"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { uploadImage, deleteImage } from "@/lib/cloudinary";
import { auth } from "@/auth";

const categorySchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().min(5),
  image: z.any().optional(), // Can be string (existing) or File (new)
  parentId: z.string().min(1).optional().nullable(),
});

export type CategoryActionState = {
  errors?: {
    name?: string[];
    slug?: string[];
    description?: string[];
    image?: string[];
    parentId?: string[];
  };
  message: string;
  success?: boolean;
};

export async function createCategory(
  prevState: CategoryActionState,
  formData: FormData
): Promise<CategoryActionState> {
  const session = await auth();
  if ((session?.user as any)?.role !== "ADMIN" && (session?.user as any)?.role !== "SUPER_ADMIN") {
    return { success: false, message: "Unauthorized" };
  }

  const values = Object.fromEntries(formData.entries());
  const imageUrl = formData.get("image") as string;

    const rawParentId = values.parentId;

  const cleanParentId =
    typeof rawParentId === "string" &&
    rawParentId !== "none" &&
    rawParentId.trim() !== ""
      ? rawParentId
      : null;

  const validatedFields = categorySchema.safeParse({
    name: values.name,
    slug: values.slug,
    description: values.description,
    image: imageUrl,
    parentId: cleanParentId,
  });

  if (!validatedFields.success) {
    return {
      errors: !validatedFields.success ? validatedFields.error.flatten().fieldErrors : undefined,
      message: !imageUrl ? "Image is required" : "Validation failed",
      success: false,
    };
  }

  if (!imageUrl) {
    return {
      message: "Image is required",
      success: false,
    };
  }

  try {
    if (cleanParentId) {
      const parentCategory = await prisma.category.findUnique({
        where: { id: cleanParentId },
        select: { id: true, parentId: true },
      });

      if (!parentCategory) {
        return {
          success: false,
          message: "Selected parent category does not exist",
        };
      }

      if (parentCategory.parentId) {
        return {
          success: false,
          message: "A subcategory cannot be a parent. Please select a top-level category.",
        };
      }
    }

    await prisma.category.create({
      data: {
        ...validatedFields.data,
        image: imageUrl
      },
    });

    revalidatePath("/admin/categories");

    return {
      success: true,
      message: "Category created",
    };
  } catch (error) {
    console.error("Create category error:", error);
    // Cleanup blob if DB fails
    if (imageUrl) await deleteImage(imageUrl);
    return {
      success: false,
      message: "Failed to create category",
    };
  }
}

export async function updateCategory(
  id: string,
  prevState: CategoryActionState,
  formData: FormData
): Promise<CategoryActionState> {
  const session = await auth();
  if ((session?.user as any)?.role !== "ADMIN" && (session?.user as any)?.role !== "SUPER_ADMIN") {
    return { success: false, message: "Unauthorized" };
  }

  const values = Object.fromEntries(formData.entries());
  const currentCategory = await prisma.category.findUnique({
    where: { id },
    select: { image: true }
  });

  const imageUrl = formData.get("image") as string;
  
  // If image changed, delete the old one
  if (currentCategory?.image && currentCategory.image !== imageUrl && currentCategory.image.startsWith("http")) {
    try {
      await deleteImage(currentCategory.image);
    } catch (error) {
      console.error("Failed to delete old category image:", error);
    }
  }

  const rawParentId = values.parentId;
  const cleanParentId =
    typeof rawParentId === "string" &&
    rawParentId !== "none" &&
    rawParentId.trim() !== ""
      ? rawParentId
      : null;

  const validatedFields = categorySchema.safeParse({
    name: values.name,
    slug: values.slug,
    description: values.description,
    image: imageUrl,
    parentId: cleanParentId,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validation failed",
      success: false,
    };
  }

  try {
    if (cleanParentId) {
      if (cleanParentId === id) {
        return {
          success: false,
          message: "A category cannot be its own parent",
        };
      }

      const parentCategory = await prisma.category.findUnique({
        where: { id: cleanParentId },
        select: { id: true, parentId: true },
      });

      if (!parentCategory) {
        return {
          success: false,
          message: "Selected parent category does not exist",
        };
      }

      // Check if selected parent is a subcategory
      if (parentCategory.parentId) {
        return {
          success: false,
          message: "The selected parent is already a subcategory. Only 2 levels allowed.",
        };
      }

      // Check if current category has children
      const hasChildren = await prisma.category.findFirst({
        where: { parentId: id }
      });

      if (hasChildren) {
        return {
          success: false,
          message: "This category has subcategories. It cannot be converted to a subcategory.",
        };
      }
    }

    await prisma.category.update({
      where: { id },
      data: {
        ...validatedFields.data,
        image: imageUrl
      },
    });

    revalidatePath("/admin/categories");

    return {
      success: true,
      message: "Category updated",
    };
  } catch (error) {
    console.error("Update category error:", error);
    return {
      success: false,
      message: "Failed to update category",
    };
  }
}

export async function deleteCategory(id: string): Promise<CategoryActionState> {
  const session = await auth();
  if ((session?.user as any)?.role !== "ADMIN" && (session?.user as any)?.role !== "SUPER_ADMIN") {
    return { success: false, message: "Unauthorized" };
  }

  try {
    const category = await prisma.category.findUnique({
      where: { id },
      include: { children: true, products: true }
    });

    if (!category) {
      return { success: false, message: "Category not found" };
    }

    if (category.children.length > 0) {
      return { success: false, message: "Cannot delete category with subcategories" };
    }

    if (category.products.length > 0) {
      return { success: false, message: "Cannot delete category with products" };
    }

    // Delete image from blob
    // Delete image from storage
    if (category.image && category.image.startsWith("http")) {
      await deleteImage(category.image);
    }

    await prisma.category.delete({
      where: { id },
    });

    revalidatePath("/admin/categories");
    return { success: true, message: "Category deleted" };
  } catch (error) {
    console.error("Delete category error:", error);
    return { success: false, message: "Failed to delete category" };
  }
}
