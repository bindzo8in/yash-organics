import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { Role } from "@/app/generated/prisma";
import { categorySchema } from "@/lib/validators/category";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter");

    if (filter === "parents") {
      // Fetch only parent categories with their children
      const categories = await prisma.category.findMany({
        where: { parentId: null },
        include: { children: true, parent: true },
      });
      return NextResponse.json(categories);
    }

    const categories = await prisma.category.findMany({
      include: { children: true, parent: true }
    });
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  // Role is handled via session extension in auth.config.ts
  if (!session || ((session.user as any).role !== "ADMIN" && (session.user as any).role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = categorySchema.safeParse(body);
    if (!parsed.success) {
      console.error("error - create category", parsed.error)
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }
    const { name, slug, description, image, parentId } = parsed.data; 

    
    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description,
        image,
        parentId,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("error - create category ->", error)
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}
