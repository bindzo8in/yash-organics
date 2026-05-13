import { Metadata } from "next";
import { ProductListingPage } from "@/components/sections/product-listing/product-listing-page";
import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { getProducts, getCategories, getPriceRange } from "@/lib/services/product.service";

export const metadata: Metadata = {
  title: "Premium Organic Products | YASH Organics",
  description: "Shop our curated collection of natural herbal, organic, skin care, hair care, and wellness products. Pure nature, bottled with love.",
};

interface PageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    page?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  
  const q = params.q || "";
  const categoriesParam = params.category?.split(",") || [];
  const sort = params.sort || "featured";
  const page = Number(params.page) || 1;

  const [categories, priceRange] = await Promise.all([
    getCategories(),
    getPriceRange(),
  ]);

  const minPrice = Number(params.minPrice) || priceRange.min;
  const maxPrice = Number(params.maxPrice) || priceRange.max;

  const { products, totalCount, totalPages } = await getProducts({
    q,
    category: categoriesParam,
    minPrice,
    maxPrice,
    sort,
    page,
    limit: 12,
  });

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      {/* Hero Section */}
      <section className="bg-[#F6F1EB] pt-32 pb-20 px-6 lg:px-12 text-center">
        <div className="max-w-4xl mx-auto">
          <nav className="flex items-center justify-center gap-2 mb-6 text-xs uppercase tracking-[0.2em] text-muted-foreground font-medium">
            <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1">
              <Home className="w-3 h-3" />
              Home
            </Link>
            <ChevronRight className="w-3 h-3 opacity-30" />
            <span className="text-primary/60">Shop All</span>
          </nav>
          
          <h1 className="font-serif text-4xl md:text-6xl text-primary mb-6 leading-tight">
            Nurtured by Nature, <br /> Crafted for You
          </h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            Discover our collection of herbal and organic essentials, sustainably sourced 
            to bring the purest healing properties of nature into your daily ritual.
          </p>
        </div>
      </section>

      {/* Main Listing Section */}
      <section className="max-w-screen-2xl mx-auto px-6 lg:px-12 pb-24">
        <ProductListingPage 
          initialProducts={products}
          initialTotalCount={totalCount}
          initialTotalPages={totalPages}
          categories={categories}
          priceRange={priceRange}
        />
      </section>
    </div>
  );
}
