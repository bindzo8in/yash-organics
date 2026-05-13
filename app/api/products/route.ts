import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId");
    const search = searchParams.get("search");

    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        ...(categoryId && { categoryId }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ],
        }),
      },
      include: {
        category: true,
        productImages: true,
        variants: {
          where: { isActive: true }
        },
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("API Products GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || ((session.user as any).role !== "ADMIN" && (session.user as any).role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { 
      name, slug, description, categoryId, images, variants 
    } = body;

    console.log("body from product create ", body)

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        categoryId,
        productImages: {
          create: images.map((url: string) => ({
            url,
            isPrimary: false
          }))
        },
        variants: {
          create: variants || [],
        },
      },
      include: {
        variants: true,
        productImages: true
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Product creation error:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
