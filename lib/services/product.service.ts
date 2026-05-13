import prisma from "@/lib/prisma";
import { Product, Category, SortOption } from "../types/product";

export async function getProducts(params: {
  q?: string;
  category?: string[];
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  sort?: string;
  page?: number;
  limit?: number;
}) {
  const {
    q,
    category,
    minPrice = 0,
    maxPrice = 10000,
    sort = "featured",
    page = 1,
    limit = 12,
  } = params;

  const skip = (page - 1) * limit;

  // Build Prisma query
  const where: any = {
    isActive: true,
    deletedAt: null,
    OR: q ? [
      { name: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ] : undefined,
    category: category && category.length > 0 ? { slug: { in: category } } : undefined,
    variants: {
      some: {
        price: {
          gte: minPrice,
          lte: maxPrice,
        },
      },
    },
  };

  // Sorting
  let orderBy: any = {};
  switch (sort) {
    case "price-asc":
      orderBy = { variants: { _count: "asc" } }; // This is tricky in Prisma for variants
      // For simplicity in listing, we might sort by the first variant's price if we had it directly
      // But Prisma doesn't easily sort by children's min value in one go without aggregation
      // For now, let's just use simple ordering and handle price sort if possible
      break;
    case "price-desc":
      break;
    case "newest":
      orderBy = { createdAt: "desc" };
      break;
    case "featured":
    default:
      orderBy = { createdAt: "desc" };
  }

  const [products, totalCount] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: true,
        productImages: true,
        variants: true,
      },
      skip,
      take: limit,
      orderBy: sort === "newest" ? { createdAt: "desc" } : { name: "asc" },
    }),
    prisma.product.count({ where }),
  ]);

  // Map to our Product type
  const mappedProducts: Product[] = products.map((p) => {
    const primaryImage = p.productImages.find((img) => img.isPrimary) || p.productImages[0];
    const baseVariant = p.variants[0];
    
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: baseVariant?.price || 0,
      compareAtPrice: baseVariant?.mrp || null,
      image: primaryImage?.url || "/placeholder-product.png",
      category: {
        id: p.category.id,
        name: p.category.name,
        slug: p.category.slug,
      },
      rating: 4.5, // Mocked for now
      reviewCount: 12, // Mocked for now
      stock: p.variants.reduce((acc, v) => acc + v.stock, 0),
      isNew: (new Date().getTime() - new Date(p.createdAt).getTime()) < 30 * 24 * 60 * 60 * 1000, // 30 days
      variants: p.variants,
    };
  });

  // Manual sorting for price if needed (Prisma 5.x+ has some improvements but let's be safe)
  if (sort === "price-asc") {
    mappedProducts.sort((a, b) => a.price - b.price);
  } else if (sort === "price-desc") {
    mappedProducts.sort((a, b) => b.price - a.price);
  } else if (sort === "rating") {
    mappedProducts.sort((a, b) => b.rating - a.rating);
  }

  return {
    products: mappedProducts,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
  };
}

export async function getCategories(): Promise<Category[]> {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      slug: true,
      parentId: true,
    },
  });
  return categories;
}

export async function getPriceRange() {
  const result = await prisma.productVariant.aggregate({
    where: {
      product: {
        isActive: true,
        deletedAt: null
      }
    },
    _min: { price: true },
    _max: { price: true }
  });

  return {
    min: result._min.price || 0,
    max: result._max.price || 5000,
  };
}
