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
    const { variants, ...productData } = body;
    const { id } = await params;

    // Update product and handle variants
    const product = await prisma.product.update({
      where: { id },
      data: {
        ...productData,
        variants: variants ? {
          deleteMany: {}, // Simple way: replace all variants. For production, use upsert logic.
          create: variants,
        } : undefined,
      },
      include: {
        variants: true,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
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
    
    // Manual cleanup of related records to satisfy foreign key constraints
    await prisma.$transaction([
      prisma.stockTransaction.deleteMany({ where: { productId: id } }),
      prisma.productImage.deleteMany({ where: { productId: id } }),
      prisma.productVariant.deleteMany({ where: { productId: id } }),
      prisma.product.delete({ where: { id } }),
    ], {
      maxWait: 15000,
      timeout: 30000,
    });

    return NextResponse.json({ message: "Product deleted" });
  } catch (error) {
    console.error("error while delete product -> ", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
