"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { getImageUrl } from "@/lib/cloudinary-utils";

interface ProductCardProps {
  product: any;
  index: number;
}

export function ProductCard({ product, index }: ProductCardProps) {
  const variants = product.variants || [];
  
  // Get price range or single price
  let priceDisplay = "Price on request";
  if (variants.length > 0) {
    const prices = variants.map((v: any) => v.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    priceDisplay = min === max ? `₹${min}` : `₹${min} - ₹${max}`;
  }

  // Calculate total stock
  const totalStock = variants.reduce((acc: number, v: any) => acc + v.stock, 0);
  const isOutOfStock = totalStock === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group"
    >
      <Link href={`/product/${product.slug}`} className="block space-y-4">
        {/* Image Container */}
        <div className="relative aspect-[4/5] bg-secondary/20 overflow-hidden rounded-sm">
          <Image
            src={getImageUrl(
              product.productImages?.find((img: any) => img.isPrimary)?.url || 
              product.productImages?.[0]?.url
            ) || "/images/placeholder.jpg"}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          
          {/* Status Badge */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
              <span className="text-white text-[10px] uppercase tracking-[0.2em] font-bold border border-white/30 px-3 py-1">
                Out of Stock
              </span>
            </div>
          )}

          {/* Quick View Hover Overlay */}
          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
             <div className="bg-white/90 backdrop-blur-md p-3 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 shadow-xl">
                <ArrowUpRight className="h-5 w-5 text-primary" />
             </div>
          </div>
        </div>

        {/* Product Details */}
        <div className="space-y-1">
          <div className="flex justify-between items-start">
            <h3 className="text-sm font-serif group-hover:text-primary transition-colors">
              {product.name}
            </h3>
          </div>
          <p className="text-xs text-muted-foreground uppercase tracking-widest">
            {product.category?.name}
          </p>
          <div className="pt-2 flex items-center justify-between">
            <span className="text-sm font-bold">{priceDisplay}</span>
            {product.variants.length > 1 && (
              <span className="text-[10px] text-muted-foreground uppercase tracking-tighter">
                {product.variants.length} Options
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
