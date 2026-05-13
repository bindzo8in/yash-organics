import { Product } from "@/lib/types/product";
import { ProductCard } from "./product-card";

interface ProductGridProps {
  products: Product[];
  onQuickAdd: (product: Product) => void;
}

export function ProductGrid({ products, onQuickAdd }: ProductGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-x-6 gap-y-10">
      {products.map((product) => (
        <ProductCard 
          key={product.id} 
          product={product} 
          onQuickAdd={onQuickAdd}
        />
      ))}
    </div>
  );
}
