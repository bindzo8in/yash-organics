"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { Heart, ShoppingCart } from "lucide-react";

import { Product } from "@/lib/types/product";
import { PriceDisplay } from "@/components/shared/price-display";
import { RatingStars } from "@/components/shared/rating-stars";

interface ProductCardProps {
  product: Product;
  onQuickAdd: (product: Product) => void;
}

export function ProductCard({ product, onQuickAdd }: ProductCardProps) {
  const isOutOfStock = product.stock <= 0;

  const hasDiscount =
    product.mrp && product.mrp > product.sellingPrice;

  const discountPercentage = hasDiscount
    ? Math.round(
        ((product.mrp! - product.sellingPrice) / product.mrp!) *
          100
      )
    : 0;

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) return;

    onQuickAdd(product);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      <Link
        href={`/product/${product.slug}`}
        className="relative block aspect-[4/4.2] overflow-hidden bg-muted"
        aria-label={`View ${product.name}`}
      >
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <div className="absolute left-3 top-3 z-10 flex flex-col gap-2">
          {product.isNew && (
            <span className="w-fit rounded-full bg-emerald-600 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white shadow-sm">
              New
            </span>
          )}

          {hasDiscount && (
            <span className="w-fit rounded-full bg-orange-500 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white shadow-sm">
              {discountPercentage}% Off
            </span>
          )}

          {isOutOfStock && (
            <span className="w-fit rounded-full bg-zinc-900 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white shadow-sm">
              Out of Stock
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          className="absolute right-3 top-3 z-10 flex size-9 items-center justify-center rounded-full border border-white/70 bg-white/90 text-zinc-700 shadow-sm backdrop-blur transition hover:bg-white hover:text-red-500"
          aria-label="Add to wishlist"
        >
          <Heart className="size-4" />
        </button>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/25 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex items-center justify-between gap-3">
          <span className="line-clamp-1 text-xs font-medium text-emerald-700">
            {product.category?.name || "Organic Product"}
          </span>

          {typeof product.rating === "number" && (
            <RatingStars
              rating={product.rating}
              showCount={true}
              className="shrink-0 scale-90"
            />
          )}
        </div>

        <Link href={`/product/${product.slug}`} className="group/title">
          <h3 className="line-clamp-2 text-base font-semibold leading-snug text-zinc-950 transition-colors group-hover/title:text-emerald-700 sm:text-lg">
            {product.name}
          </h3>
        </Link>

        {product.description && (
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
            {product.description}
          </p>
        )}

        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <div className="min-w-0">
            <PriceDisplay
              price={product.sellingPrice}
              compareAtPrice={product.mrp}
              className="text-lg font-bold text-emerald-900 sm:text-xl"
            />

            {!isOutOfStock && product.stock <= 5 && (
              <p className="mt-1 text-xs font-medium text-orange-600">
                Only {product.stock} left
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full bg-emerald-700 px-4 text-sm font-semibold text-white transition hover:bg-emerald-800 active:scale-95 disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-500"
          >
            <ShoppingCart className="size-4" />
            <span className="hidden sm:inline">
              {isOutOfStock ? "Sold" : "Add"}
            </span>
          </button>
        </div>
      </div>
    </motion.article>
  );
}