import prisma from "@/lib/prisma";
import { Category } from "../types/product";

export async function getFeaturedCategories(): Promise<Category[]> {
  const categories = await prisma.category.findMany({
    where: { 
      isActive: true,
      parentId: null // Only get root categories for featured section
    },
    include: {
      products: {
        where: { isActive: true, deletedAt: null },
        select: { id: true }
      },
      children: {
        include: {
          products: {
            where: { isActive: true, deletedAt: null },
            select: { id: true }
          }
        }
      }
    },
    orderBy: { order: "asc" },
    take: 3, // Get top 3 as per current design
  });

  return categories.map(cat => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    description: cat.description,
    image: cat.image,
    parentId: cat.parentId,
    productCount: cat.products.length + ((cat as any).children?.reduce((acc: number, child: any) => acc + child.products.length, 0) || 0)
  }));
}

export async function getAllCategories(): Promise<Category[]> {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    include: {
      products: {
        where: { isActive: true, deletedAt: null },
        select: { id: true }
      },
      children: {
        include: {
          products: {
            where: { isActive: true, deletedAt: null },
            select: { id: true }
          }
        }
      }
    },
    orderBy: { order: "asc" }
  });

  return categories.map(cat => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    description: cat.description,
    image: cat.image,
    parentId: cat.parentId,
    productCount: cat.products.length + ((cat as any).children?.reduce((acc: number, child: any) => acc + child.products.length, 0) || 0)
  }));
}

export async function getParentCategories(): Promise<Category[]> {
  const categories = await prisma.category.findMany({
    where: { 
      isActive: true,
      parentId: null 
    },
    orderBy: { order: "asc" }
  });

  return categories.map(cat => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    description: cat.description,
    image: cat.image,
    parentId: cat.parentId
  }));
}

export async function getNavbarCategories() {
  const categories = await prisma.category.findMany({
    where: { 
      isActive: true,
      parentId: null 
    },
    include: {
      children: {
        where: { isActive: true },
        orderBy: { order: "asc" }
      }
    },
    orderBy: { order: "asc" }
  });

  return categories;
}
