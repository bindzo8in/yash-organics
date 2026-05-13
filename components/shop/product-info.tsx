"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Minus, Plus, Check } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useCart } from "@/hooks/use-cart";

interface ProductInfoProps {
  product: any;
}

export function ProductInfo({ product }: ProductInfoProps) {
  const cart = useCart();
  const variants = product.variants || [];
  const [selectedVariant, setSelectedVariant] = useState(
    variants.length > 0 ? variants[0] : null
  );
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  const currentPrice = selectedVariant?.price || 0;
  const currentMRP = selectedVariant?.mrp;
  const currentStock = selectedVariant?.stock || 0;
  
  const discount = currentMRP ? Math.round(((currentMRP - currentPrice) / currentMRP) * 100) : 0;

  const handleAddToCart = async () => {
    setIsAdding(true);
    
    // Map raw product to Cart-friendly product type
    const primaryImage = product.productImages?.find((img: any) => img.isPrimary)?.url || product.productImages?.[0]?.url;
    
    const cartProduct = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: currentPrice,
      compareAtPrice: currentMRP,
      image: primaryImage || "/placeholder-product.png",
      category: product.category,
      rating: 4.5,
      reviewCount: 12,
      stock: currentStock,
      variantId: selectedVariant?.id,
      variantName: selectedVariant?.name,
    };

    // Add to cart with quantity
    cart.addItem(cartProduct as any, quantity);
    
    toast.success(`Added ${quantity} x ${product.name} to cart`, {
      description: selectedVariant ? `Variant: ${selectedVariant.name}` : undefined,
      icon: <Check className="h-4 w-4 text-emerald-600" />,
      action: {
        label: "View Cart",
        onClick: () => window.location.href = "/cart",
      },
    });
    
    setIsAdding(false);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <Badge variant="outline" className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-none border-primary/30 text-primary font-bold">
            {product.category.name}
          </Badge>
          <h1 className="text-4xl md:text-5xl font-serif leading-tight">
            {product.name}
          </h1>
          <div className="flex items-baseline gap-4">
            <span className="text-3xl font-light">₹{currentPrice}</span>
            {currentMRP && currentMRP > currentPrice && (
              <>
                <span className="text-xl text-muted-foreground line-through decoration-1">₹{currentMRP}</span>
                <span className="text-sm font-bold text-emerald-600">{discount}% OFF</span>
              </>
            )}
          </div>
          {selectedVariant?.weight && (
            <p className="text-sm text-muted-foreground">
              Weight: <span className="font-medium text-foreground">{selectedVariant.weight} {selectedVariant.unit}</span>
            </p>
          )}
        </div>

        {/* Variant Selection */}
        {variants.length > 1 && (
          <div className="space-y-4">
            <span className="text-xs uppercase tracking-widest font-bold">Select Option</span>
            <div className="flex flex-wrap gap-3">
              {variants.map((v: any) => (
                <button
                  key={v.id}
                  onClick={() => {
                    setSelectedVariant(v);
                    setQuantity(1); // Reset quantity on variant change
                  }}
                  className={cn(
                    "px-6 py-2 border text-sm transition-all duration-300",
                    selectedVariant?.id === v.id
                      ? "bg-primary border-primary text-white shadow-md scale-105"
                      : "bg-transparent border-border hover:border-primary"
                  )}
                >
                  {v.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quantity & Inventory Status */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
             <span className="text-xs uppercase tracking-widest font-bold">Quantity</span>
             <span className={cn(
               "text-[10px] uppercase font-bold px-2 py-0.5 rounded-sm",
               currentStock > 10 ? "bg-emerald-50 text-emerald-700" : 
               currentStock > 0 ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"
             )}>
               {currentStock === 0 ? "Out of Stock" : currentStock <= 10 ? "Low Stock" : "In Stock"}
             </span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center border border-border h-12">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-12 h-full flex items-center justify-center hover:bg-secondary/20 transition-colors"
                disabled={currentStock === 0}
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-12 text-center font-medium">{quantity}</span>
              <button 
                onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                className="w-12 h-full flex items-center justify-center hover:bg-secondary/20 transition-colors"
                disabled={currentStock === 0}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-12 space-y-4">
        <Button 
          onClick={handleAddToCart}
          disabled={isAdding || currentStock === 0}
          className="w-full h-16 text-lg font-bold bg-primary hover:bg-primary/90 rounded-none shadow-xl transition-all active:scale-[0.98]"
        >
          {isAdding ? (
            <motion.div 
              animate={{ rotate: 360 }} 
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            >
              <RefreshCcw className="h-6 w-6" />
            </motion.div>
          ) : (
            <>
              <ShoppingBag className="mr-3 h-5 w-5" />
              {currentStock === 0 ? "Out of Stock" : "Add to Shopping Bag"}
            </>
          )}
        </Button>
        <p className="text-[10px] text-center text-muted-foreground uppercase tracking-widest">
          Free Shipping on all organic products over ₹999
        </p>
      </div>
    </div>
  );
}

// Minimal Refresh icon for loading
function RefreshCcw({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
      <path d="M16 16h5v5" />
    </svg>
  );
}
