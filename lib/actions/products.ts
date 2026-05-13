"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { uploadImage, deleteImage } from "@/lib/cloudinary";
import { auth } from "@/auth";

const variantSchema = z.object({
  name: z.string().min(1, "Variant name is required"),
  mrp: z.coerce.number().min(0).optional(),
  price: z.coerce.number().min(0),
  stock: z.coerce.number().min(0),
  lowStockLevel: z.coerce.number().min(0),
  weight: z.coerce.number().min(0).optional(),
  unit: z.string().optional(),
});

const productSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().min(10),
  categoryId: z.string().min(1),
  images: z.array(z.object({
    url: z.string().min(1),
    isPrimary: z.boolean(),
  })).min(1),
  variants: z.array(variantSchema).min(1, "At least one variant is required"),
});

export type ProductActionState = {
  errors?: {
    name?: string[];
    slug?: string[];
    description?: string[];
    categoryId?: string[];
    images?: string[];
    variants?: string[];
  };
  message: string;
  success?: boolean;
};

export async function createProduct(
  prevState: ProductActionState,
  formData: FormData
): Promise<ProductActionState> {
  const session = await auth();
  if ((session?.user as any)?.role !== "ADMIN" && (session?.user as any)?.role !== "SUPER_ADMIN") {
    return { success: false, message: "Unauthorized" };
  }

  const rawData = Object.fromEntries(formData.entries());

  let variants: z.infer<typeof variantSchema>[] = [];
  try {
    variants = JSON.parse((rawData.variants as string) || "[]");
  } catch {
    return {
      success: false,
      message: "Invalid variants data",
    };
  }

  let images: { url: string; isPrimary: boolean }[] = [];
  try {
    images = JSON.parse((rawData.images as string) || "[]");
  } catch {
    return {
      success: false,
      message: "Invalid images data",
    };
  }

  const validatedFields = productSchema.safeParse({
    ...rawData,
    variants,
    images,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validation failed",
    };
  }

  try {
    const { variants, images, ...productData } = validatedFields.data;

    await prisma.$transaction(
      async (tx) => {
        const product = await tx.product.create({
          data: productData,
          select: {
            id: true,
            name: true,
          },
        });

        await tx.productImage.createMany({
          data: images.map((img) => ({
            productId: product.id,
            url: img.url,
            alt: product.name,
            isPrimary: img.isPrimary,
          })),
        });

        await tx.productVariant.createMany({
          data: variants.map((variant) => ({
            ...variant,
            productId: product.id,
          })),
        });

        const createdVariants = await tx.productVariant.findMany({
          where: {
            productId: product.id,
          },
          select: {
            id: true,
            stock: true,
          },
        });

        const stockLogs = createdVariants
          .filter((variant) => variant.stock > 0)
          .map((variant) => ({
            productId: product.id,
            variantId: variant.id,
            quantity: variant.stock,
            type: "RESTOCK" as const,
            reason: "Initial stock on creation",
          }));

        if (stockLogs.length > 0) {
          await tx.stockTransaction.createMany({
            data: stockLogs,
          });
        }
      },
      {
        maxWait: 15000,
        timeout: 30000,
      }
    );

    revalidatePath("/admin/products");

    return {
      success: true,
      message: "Product created with variants",
    };
  } catch (error) {
    console.error("Create product error:", error);

    return {
      success: false,
      message: "Failed to create product",
    };
  }
}

export async function updateProduct(id: string, prevState: ProductActionState, formData: FormData): Promise<ProductActionState> {
  const session = await auth();
  if ((session?.user as any)?.role !== "ADMIN" && (session?.user as any)?.role !== "SUPER_ADMIN") {
    return { success: false, message: "Unauthorized" };
  }

  const rawData = Object.fromEntries(formData.entries());
  
  let variants = [];
  try {
    variants = JSON.parse(rawData.variants as string || "[]");
  } catch (e) {}

  const oldProduct = await prisma.product.findUnique({
    where: { id },
    include: { productImages: true, variants: true }
  });

  if (!oldProduct) return { success: false, message: "Product not found" };

  // Get images from formData
  let images = [];
  try {
    images = JSON.parse(rawData.images as string || "[]");
  } catch (e) {}

  // Identify deleted images to cleanup blobs later
  const existingUrls = images.map((img: { url: string }) => img.url);
  const deletedImages = oldProduct.productImages.filter((img: { url: string }) => !existingUrls.includes(img.url));

  const validatedFields = productSchema.safeParse({
    ...rawData,
    variants,
    images,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validation failed",
    };
  }

  try {
    const { variants, images, ...productData } = validatedFields.data;
    
    await prisma.$transaction(async (tx) => {
      // 1. Update basic product data
      await tx.product.update({
        where: { id },
        data: {
          ...productData,
          productImages: {
            deleteMany: {},
            create: images.map(img => ({
              url: img.url,
              alt: productData.name,
              isPrimary: img.isPrimary
            }))
          }
        }
      });

      // 2. Handle Variants properly (Preserve IDs)
      const existingVariants = oldProduct.variants;
      const incomingVariants = variants;

      // Identify variants to delete
      const incomingNames = incomingVariants.map(v => v.name);
      const variantsToDelete = existingVariants.filter(ev => !incomingNames.includes(ev.name));
      
      for (const v of variantsToDelete) {
        // Check if variant has orders
        const orderCount = await tx.orderItem.count({ where: { variantId: v.id } });
        if (orderCount > 0) {
          await tx.productVariant.update({ 
            where: { id: v.id }, 
            data: { isActive: false } 
          });
        } else {
          await tx.productVariant.delete({ where: { id: v.id } });
        }
      }

      // Upsert incoming variants
      for (const v of incomingVariants) {
        const existing = existingVariants.find(ev => ev.name === v.name);
        
        if (existing) {
          const stockDiff = v.stock - existing.stock;
          
          await tx.productVariant.update({
            where: { id: existing.id },
            data: v
          });

          if (stockDiff !== 0) {
            await tx.stockTransaction.create({
              data: {
                productId: id,
                variantId: existing.id,
                quantity: stockDiff,
                type: stockDiff > 0 ? "RESTOCK" : "ADJUSTMENT",
                reason: "Product edit (Stock update)"
              }
            });
          }
        } else {
          const newVariant = await tx.productVariant.create({
            data: { ...v, productId: id }
          });

          if (newVariant.stock > 0) {
            await tx.stockTransaction.create({
              data: {
                productId: id,
                variantId: newVariant.id,
                quantity: newVariant.stock,
                type: "RESTOCK",
                reason: "New variant added during edit"
              }
            });
          }
        }
      }
    }, {
      maxWait: 15000,
      timeout: 30000,
    });

    // Cleanup blobs of deleted images
    // Cleanup deleted images from Cloudinary
    for (const img of deletedImages) {
      if (img.url.startsWith("http")) {
        await deleteImage(img.url);
      }
    }

    revalidatePath("/admin/products");
    return { success: true, message: "Product and stock logs updated" };
  } catch (error) {
    console.error("Update product error:", error);
    return { success: false, message: "Failed to update product" };
  }
}

export async function deleteProduct(id: string): Promise<ProductActionState> {
  const session = await auth();
  if ((session?.user as any)?.role !== "ADMIN" && (session?.user as any)?.role !== "SUPER_ADMIN") {
    return { success: false, message: "Unauthorized" };
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { productImages: true }
    });

    if (!product) {
      return { success: false, message: "Product not found" };
    }

    // Delete images from blob
    // Delete images from Cloudinary
    for (const img of product.productImages) {
      if (img.url.startsWith("http")) {
        await deleteImage(img.url);
      }
    }

    // Check for orders before hard delete
    const orderCount = await prisma.orderItem.count({ where: { productId: id } });

    if (orderCount > 0) {
      await prisma.product.update({
        where: { id },
        data: { isActive: false }
      });
      revalidatePath("/admin/products");
      return { success: true, message: "Product deactivated (has associated orders)" };
    }

    await prisma.$transaction([
      prisma.stockTransaction.deleteMany({ where: { productId: id } }),
      prisma.productVariant.deleteMany({ where: { productId: id } }),
      prisma.productImage.deleteMany({ where: { productId: id } }),
      prisma.product.delete({ where: { id } }),
    ]);

    revalidatePath("/admin/products");
    return { success: true, message: "Product deleted" };
  } catch (error) {
    console.error("Delete product error:", error);
    return { success: false, message: "Failed to delete product" };
  }
}