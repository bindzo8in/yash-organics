"use client";

import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { ProductCard } from "@/components/sections/product-listing/product-card";
import { Product } from "@/lib/types/product";
import { LeafVector } from "@/components/shared/leaf-vector";
import { useCart } from "@/hooks/use-cart";
import { toast } from "sonner";
import { useState } from "react";
import { QuickAddModal } from "@/components/sections/product-listing/quick-add-modal";

interface BestSellersProps {
  products: Product[];
}

export function BestSellers({ products }: BestSellersProps) {
  const { addItem } = useCart();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleQuickAdd = (product: Product) => {
    setSelectedProduct(product);
  };

  return (
    <section className="py-12 md:py-20 px-6 bg-background relative overflow-hidden">
      <QuickAddModal 
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
      {/* Background Decor */}
      <LeafVector 
        src="/leaf/leaf-1.svg"
        className="absolute top-1/2 -right-32 w-[600px] h-[600px] opacity-[0.02] -translate-y-1/2 rotate-12"
        animate={{ y: ["-50%", "-48%", "-50%"], rotate: [12, 15, 12] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-8 md:mb-16">
          <div className="space-y-4">
            <motion.span 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-xs uppercase tracking-[0.3em] font-bold text-primary"
            >
              Curated Selection
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl sm:text-4xl md:text-6xl font-serif"
            >
              Our Best <span className="italic">Sellers</span>
            </motion.h2>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <Link href="/products" className="inline-flex items-center text-sm font-bold uppercase tracking-widest border-b border-foreground pb-2 hover:text-primary hover:border-primary transition-all">
              View All Products
              <ArrowRight className="ml-3 h-4 w-4" />
            </Link>
          </motion.div>
        </div>

        {products && products.length > 0 ? (
  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
    {products.map((product, index) => (
      <motion.div
        key={product.id}
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{
          duration: 0.35,
          delay: Math.min(index * 0.05, 0.3),
          ease: "easeOut",
        }}
        className="h-full"
      >
        <ProductCard
          product={product}
          onQuickAdd={handleQuickAdd}
        />
      </motion.div>
    ))}
  </div>
) : (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.35, ease: "easeOut" }}
    className="mx-auto flex min-h-[320px] max-w-3xl flex-col items-center justify-center rounded-3xl border border-dashed border-primary/25 bg-primary/[0.03] px-6 py-16 text-center sm:px-10"
  >
    <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-primary/10">
      <span className="text-3xl">🌱</span>
    </div>

    <h3 className="text-xl font-semibold text-foreground sm:text-2xl">
      The garden is growing...
    </h3>

    <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground sm:text-base">
      We are currently curating our most loved organic essentials.
      Our best-selling selection will bloom here very soon.
    </p>
  </motion.div>
)}
      </div>
    </section>
  );
}
