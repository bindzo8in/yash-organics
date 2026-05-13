"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { ShoppingCart, Heart, Eye } from "lucide-react";
import { Product } from "@/lib/types/product";
import { PriceDisplay } from "@/components/shared/price-display";
import { RatingStars } from "@/components/shared/rating-stars";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { useCart } from "@/hooks/use-cart";
import { toast } from "sonner";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const cart = useCart();
  const isOutOfStock = product.stock <= 0;
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isOutOfStock) return;
    
    // Ensure we use the first variant if available for consistency with ProductInfo
    const firstVariant = (product as any).variants?.[0];
    
    const cartProduct = {
      ...product,
      price: firstVariant?.price || product.price,
      variantId: firstVariant?.id,
      variantName: firstVariant?.name,
    };
    
    cart.addItem(cartProduct as any);
    
    toast.success(`${product.name} added to cart`, {
      description: firstVariant ? `Variant: ${firstVariant.name}` : "Product added successfully.",
      action: {
        label: "View Cart",
        onClick: () => window.location.href = "/cart",
      },
    });
  };

  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercentage = hasDiscount
    ? Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="group relative flex flex-col h-full bg-background border-none overflow-hidden"
    >
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
        {product.isNew && (
          <Badge className="bg-primary text-primary-foreground hover:bg-primary/90 border-none px-2 py-0 text-[10px] uppercase tracking-wider rounded-none">
            New
          </Badge>
        )}
        {hasDiscount && (
          <Badge className="bg-accent text-accent-foreground hover:bg-accent/90 border-none px-2 py-0 text-[10px] uppercase tracking-wider rounded-none">
            -{discountPercentage}%
          </Badge>
        )}
        {isOutOfStock && (
          <Badge variant="outline" className="bg-background/80 backdrop-blur-sm text-foreground border-foreground/10 px-2 py-0 text-[10px] uppercase tracking-wider rounded-none">
            Out of Stock
          </Badge>
        )}
      </div>

      {/* Product Image */}
      <Link href={`/product/${product.slug}`} className="relative aspect-[4/5] overflow-hidden bg-muted">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Hover Actions */}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
          <Button
            size="icon"
            variant="secondary"
            className="rounded-full w-10 h-10 bg-white/90 hover:bg-white text-primary shadow-sm transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-[0ms]"
            onClick={(e) => {
              e.preventDefault();
              // toggleWishlist(product.id)
            }}
          >
            <Heart className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="rounded-full w-10 h-10 bg-white/90 hover:bg-white text-primary shadow-sm transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-[50ms]"
            onClick={(e) => {
              e.preventDefault();
              // quickView(product.id)
            }}
          >
            <Eye className="w-4 h-4" />
          </Button>
        </div>
      </Link>

      {/* Product Info */}
      <div className="flex flex-col flex-grow py-4 px-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium">
            {product.category.name}
          </span>
          <RatingStars rating={product.rating} showCount={false} className="gap-0.5" />
        </div>

        <Link href={`/product/${product.slug}`} className="hover:text-primary transition-colors">
          <h3 className="font-serif text-lg leading-tight mb-2 line-clamp-1">{product.name}</h3>
        </Link>
        
        <p className="text-xs text-muted-foreground line-clamp-2 mb-4 flex-grow">
          {product.description}
        </p>

        <div className="flex items-center justify-between mt-auto">
          <PriceDisplay price={product.price} compareAtPrice={product.compareAtPrice} />
          
          <Button
            size="sm"
            variant="outline"
            disabled={isOutOfStock}
            className="rounded-none border-foreground/20 hover:bg-foreground hover:text-background transition-all duration-300 group/btn"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="w-4 h-4 mr-2 group-hover/btn:scale-110 transition-transform" />
            <span className="text-[11px] uppercase tracking-wider">Add</span>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
