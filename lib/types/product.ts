import { Category as PrismaCategory, Product as PrismaProduct, ProductVariant, ProductImage } from "@/app/generated/prisma/client";

export type ProductWithDetails = PrismaProduct & {
  category: PrismaCategory;
  variants: ProductVariant[];
  productImages: ProductImage[];
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  sellingPrice: number;
  mrp?: number | null;
  image: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  rating: number; // Placeholder for now as it's not in schema
  reviewCount: number; // Placeholder for now
  stock: number;
  isFeatured?: boolean;
  isNew?: boolean;
  variants?: ProductVariant[];
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string | null;
  productCount?: number;
  order?: number;
};

export type SortOption = "featured" | "price-asc" | "price-desc" | "newest" | "rating";
