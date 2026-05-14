"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";

import { Category } from "@/lib/types/product";
import { LeafVector } from "@/components/shared/leaf-vector";

interface FeaturedCategoriesProps {
  categories: Category[];
}

export function FeaturedCategories({ categories }: FeaturedCategoriesProps) {
  return (
    <section className="py-16 px-6 bg-secondary/5 relative overflow-hidden">
      {/* Background Decor */}
      <LeafVector 
        src="/leaf/leaf-3.svg"
        className="absolute -top-20 -left-20 w-96 h-96 opacity-[0.03] rotate-45"
        animate={{ rotate: [45, 55, 45] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <LeafVector 
        src="/leaf/leaf-4.svg"
        className="absolute -bottom-20 -right-20 w-96 h-96 opacity-[0.03] -rotate-12"
        animate={{ rotate: [-12, -22, -12] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <LeafVector 
        src="/leaf/leaf.svg"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] opacity-[0.015] pointer-events-none"
        animate={{ scale: [1, 1.05, 1], rotate: [0, 5, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="max-w-7xl mx-auto">
        <div className="text-center space-y-4 mb-20">
          <motion.span 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-xs uppercase tracking-[0.4em] font-bold text-primary/60"
          >
            Explore Categories
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-serif"
          >
            The <span className="italic">Organic</span> Essentials
          </motion.h2>
        </div>

        {categories && categories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {categories.map((cat, index) => (
              <Link key={cat.slug} href={`/products?category=${cat.slug}`} className="group">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15, duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
                  className="relative h-full flex flex-col"
                >
                  {/* Image Container with Luxury Soft Shadow */}
                  <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] bg-white shadow-[0_20px_50px_rgba(0,0,0,0.08)] group-hover:shadow-[0_40px_80px_rgba(16,185,129,0.12)] transition-all duration-700">
                    <Image
                      src={cat.image || "/placeholder-category.png"}
                      alt={cat.name}
                      fill
                      className="object-cover transition-transform duration-1000 group-hover:scale-105"
                    />
                    {/* Subtle Overlay to lift the text if needed, but keeping it light */}
                    <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    
                    {/* Floating Product Count Badge */}
                    <div className="absolute top-6 right-6">
                      <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-sm border border-emerald-50">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700">
                          {cat.productCount || 0} items
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Content Area */}
                  <div className="mt-8 space-y-4 px-2">
                    <div className="space-y-2">
                      <h3 className="text-3xl md:text-4xl font-serif text-foreground group-hover:text-emerald-800 transition-colors duration-500 flex items-center justify-between">
                        {cat.name}
                        <span className="h-px flex-1 mx-4 bg-emerald-100 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-700" />
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2 font-medium">
                        {cat.description}
                      </p>
                    </div>
                    
                    <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600 transition-all duration-500 group-hover:gap-4">
                      Explore Collection
                      <div className="w-8 h-px bg-emerald-600" />
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="py-24 border border-dashed border-primary/20 rounded-[2.5rem] flex flex-col items-center justify-center text-center space-y-6 bg-white/50"
          >
            <div className="w-20 h-20 bg-secondary/20 rounded-full flex items-center justify-center">
               <span className="text-3xl">🌿</span>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-serif italic">Our collections are being curated</h3>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto leading-relaxed">
                We're currently organizing our organic essentials into beautiful collections. 
                New categories will be available for exploration very soon.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
