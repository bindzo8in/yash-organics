import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        variants: true,
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || ((session.user as any).role !== "ADMIN" && (session.user as any).role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { variants, images, ...productData } = body;
    const { id } = await params;

    // Handle variants update carefully to avoid foreign key violations
    // If variants are provided, we clean up CartItems first since we use the delete-and-recreate pattern
    if (variants) {
      await prisma.cartItem.deleteMany({ where: { productId: id } });
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...productData,
        productImages: images ? {
          deleteMany: {},
          create: images.map((img: { url: string; isPrimary: boolean }) => ({
            url: img.url,
            isPrimary: img.isPrimary
          }))
        } : undefined,
        variants: variants ? {
          deleteMany: {}, 
          create: variants,
        } : undefined,
      },
      include: {
        variants: true,
        productImages: true
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("Product update error:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || ((session.user as any).role !== "ADMIN" && (session.user as any).role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    
    // Soft delete logic: preserve order history by not deleting referenced variants
    // 1. Mark product as deleted and inactive
    // 2. Remove from all carts (ephemeral data)
    await prisma.$transaction([
      prisma.cartItem.deleteMany({ where: { productId: id } }),
      prisma.product.update({
        where: { id },
        data: { 
          deletedAt: new Date(),
          isActive: false
        }
      }),
    ]);

    return NextResponse.json({ message: "Product soft-deleted and removed from carts" });
  } catch (error) {
    console.error("error while delete product -> ", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
