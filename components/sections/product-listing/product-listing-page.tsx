"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Product, Category } from "@/lib/types/product";
import { ProductGrid } from "./product-grid";
import { ProductFilters } from "./product-filters";
import { MobileFilterDrawer } from "./mobile-filter-drawer";
import { SortDropdown } from "./sort-dropdown";
import { ProductSearch } from "./product-search";
import { Pagination } from "./pagination";
import { EmptyProductsState } from "./empty-products-state";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { QuickAddModal } from "./quick-add-modal";

interface ProductListingPageProps {
  initialProducts: Product[];
  initialTotalCount: number;
  initialTotalPages: number;
  categories: Category[];
}

export function ProductListingPage({
  initialProducts,
  initialTotalCount,
  initialTotalPages,
  categories,
}: ProductListingPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [quickAddProduct, setQuickAddProduct] = useState<Product | null>(null);

  // Extract page from URL for pagination component
  const page = Number(searchParams.get("page")) || 1;

  const handleClearFilters = () => {
    router.push(pathname, { scroll: false });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-12 mt-8 lg:mt-12">
      <QuickAddModal 
        product={quickAddProduct}
        isOpen={!!quickAddProduct}
        onClose={() => setQuickAddProduct(null)}
      />
      {/* Sidebar Filters (Desktop) */}
      <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-24 h-fit">
        <ProductFilters categories={categories} />
      </aside>

      {/* Main Content */}
      <main className="flex-grow">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 pb-4 border-b border-foreground/5">
          <div className="flex items-center justify-between w-full sm:w-auto gap-4">
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              Showing <span className="text-foreground font-medium">{initialTotalCount}</span> products
            </span>
            <MobileFilterDrawer categories={categories} />
          </div>
          
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <ProductSearch />
            <SortDropdown />
          </div>
        </div>

        {/* Product Grid / Empty State */}
        <AnimatePresence mode="wait">
          {initialProducts.length > 0 ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ProductGrid 
                products={initialProducts} 
                onQuickAdd={(product) => setQuickAddProduct(product)}
              />
              <Pagination totalPages={initialTotalPages} currentPage={page} />
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <EmptyProductsState onClearFilters={handleClearFilters} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
