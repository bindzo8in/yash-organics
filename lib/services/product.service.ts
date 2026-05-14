import prisma from "@/lib/prisma";
import { Product, Category, SortOption } from "../types/product";

export async function getProducts(params: {
  q?: string;
  category?: string[];
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  availability?: string[];
  sort?: string;
  page?: number;
  limit?: number;
}) {
  const {
    q,
    category,
    minPrice = 0,
    maxPrice = 10000,
    availability,
    sort = "featured",
    page = 1,
    limit = 12,
  } = params;

  const skip = (page - 1) * limit;

  // Find all category IDs (including subcategories if a parent slug is provided)
  let categoryIds: string[] | undefined = undefined;
  if (category && category.length > 0) {
    const matchingCategories = await prisma.category.findMany({
      where: {
        OR: [
          { slug: { in: category } },
          { parent: { slug: { in: category } } }
        ]
      },
      select: { id: true }
    });
    categoryIds = matchingCategories.map(c => c.id);
  }

  // Build Prisma query
  const where: any = {
    isActive: true,
    deletedAt: null,
    OR: q ? [
      { name: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ] : undefined,
  };

  if (categoryIds && categoryIds.length > 0) {
    where.categoryId = { in: categoryIds };
  } else if (category && category.length > 0) {
    // If category slugs were provided but no IDs found, force return no results
    // unless you want to ignore invalid categories. Usually, we want no results.
    where.categoryId = { in: [] };
  }

  // Add variant filters (Price & Availability)
  where.variants = {
    some: {
      sellingPrice: {
        gte: isNaN(minPrice) ? 0 : minPrice,
        lte: isNaN(maxPrice) ? 1000000 : maxPrice,
      },
      ...(availability?.includes("in-stock") && !availability?.includes("out-of-stock") && {
        stock: { gt: 0 }
      })
    },
    ...(availability?.includes("out-of-stock") && !availability?.includes("in-stock") && {
      every: { stock: 0 }
    })
  };

  // Sorting
  let orderBy: any = {};
  switch (sort) {
    case "price-asc":
      orderBy = { variants: { _min: { sellingPrice: "asc" } } };
      break;
    case "price-desc":
      orderBy = { variants: { _min: { sellingPrice: "desc" } } };
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
      orderBy,
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
      sellingPrice: baseVariant?.sellingPrice || 0,
      mrp: baseVariant?.mrp || null,
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

  // Manual sorting for rating if needed (since it's mocked for now)
  if (sort === "rating") {
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
    _min: { sellingPrice: true },
    _max: { sellingPrice: true }
  });

  return {
    min: result._min.sellingPrice || 0,
    max: result._max.sellingPrice || 5000,
  };
}
