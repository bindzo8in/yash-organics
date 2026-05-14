"use client";

import { motion } from "motion/react";
import { ProductCard } from "@/components/sections/product-listing/product-card";
import { Product } from "@/lib/types/product";
import { LeafVector } from "@/components/shared/leaf-vector";

interface NewLaunchProps {
  products: Product[];
}

export function NewLaunch({ products }: NewLaunchProps) {
  return (
    <section className="py-16 px-6 bg-secondary/5 relative overflow-hidden">
      {/* Background Decor */}
      <LeafVector 
        src="/leaf/leaf.svg"
        className="absolute -bottom-20 -left-20 w-[500px] h-[500px] opacity-[0.02] -rotate-45"
        animate={{ y: [0, 10, 0], rotate: [-45, -35, -45] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="max-w-7xl mx-auto">
        <div className="text-center space-y-4 mb-20">
          <motion.span 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-xs uppercase tracking-[0.4em] font-bold text-primary"
          >
            Fresh Arrivals
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-serif"
          >
            The <span className="italic">New</span> Standard
          </motion.h2 >
        </div>

      {products && products.length > 0 ? (
  <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 xl:grid-cols-3">
    {products.map((product, index) => (
      <motion.div
        key={product.id}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{
          duration: 0.45,
          delay: index * 0.08,
          ease: "easeOut",
        }}
        className="h-full"
      >
        <div className="h-full">
          <ProductCard
            product={product}
            onQuickAdd={() => {}}
          />
        </div>
      </motion.div>
    ))}
  </div>
) : (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.3 }}
    transition={{
      duration: 0.45,
      ease: "easeOut",
    }}
    className="min-h-[360px] rounded-[2rem] border border-dashed border-primary/20 bg-white px-6 py-16 text-center shadow-sm sm:px-10 sm:py-20"
  >
    <div className="mx-auto flex max-w-md flex-col items-center justify-center space-y-6">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary/30">
        <span className="text-3xl">✨</span>
      </div>

      <div className="space-y-3">
        <h3 className="font-serif text-2xl italic leading-tight text-foreground sm:text-3xl">
          New arrivals arriving soon
        </h3>

        <p className="mx-auto max-w-sm text-sm leading-relaxed text-muted-foreground sm:text-base">
          We're currently preparing our next collection of organic treasures.
          Stay tuned for the newest additions to our garden.
        </p>
      </div>
    </div>
  </motion.div>
)}
      </div>
    </section>
  );
}
