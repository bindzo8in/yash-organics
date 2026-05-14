"use client";

import { useState, useEffect } from "react";
import { Product } from "@/lib/types/product";
import { ProductVariant } from "@/app/generated/prisma/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PriceDisplay } from "@/components/shared/price-display";
import { Minus, Plus, ShoppingCart, X } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { motion } from "motion/react";

interface QuickAddModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function QuickAddModal({ product, isOpen, onClose }: QuickAddModalProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const cart = useCart();

  // Reset state when product changes or modal opens
  useEffect(() => {
    if (product && product.variants && product.variants.length > 0) {
      setSelectedVariant(product.variants[0]);
      setQuantity(1);
    }
  }, [product, isOpen]);

  if (!product) return null;

  const variants = product.variants || [];
  const currentVariant = selectedVariant || variants[0];

  const handleAddToCart = () => {
    if (!currentVariant) return;

    const cartProduct = {
      ...product,
      price: currentVariant.sellingPrice,
      variantId: currentVariant.id,
      variantName: currentVariant.name,
    };

    cart.addItem(cartProduct as any, quantity);
    
    toast.success(`${product.name} added to cart`, {
      description: `Variant: ${currentVariant.name}, Quantity: ${quantity}`,
      action: {
        label: "View Cart",
        onClick: () => window.location.href = "/cart",
      },
    });
    
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden rounded-none border-none bg-[#FDFBF7]">
        <div className="relative">
          {/* Close Button Override for Design Consistency */}
          <button 
            onClick={onClose}
            className="absolute right-4 top-4 z-20 p-2 rounded-full bg-white/80 hover:bg-white text-primary transition-all duration-300 shadow-sm"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex flex-col">
            {/* Minimal Image Header */}
            <div className="relative aspect-[16/9] w-full bg-muted">
              <Image 
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#FDFBF7] to-transparent" />
            </div>

            <div className="p-8 -mt-12 relative z-10">
              <DialogHeader className="mb-8">
                <span className="text-[10px] uppercase tracking-[0.2em] text-primary/60 font-medium mb-2 block text-center">
                  Quick Add
                </span>
                <DialogTitle className="font-serif text-3xl text-primary text-center leading-tight">
                  {product.name}
                </DialogTitle>
                <DialogDescription className="hidden">
                   Select variant and quantity for {product.name}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-10">
                {/* Variant Selection */}
                {variants.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">
                        Select Variant
                      </label>
                      <span className="text-[10px] text-primary/40 font-medium italic">
                        {variants.length} options available
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                      {variants.map((v) => (
                        <button
                          key={v.id}
                          onClick={() => setSelectedVariant(v)}
                          className={cn(
                            "px-5 py-2.5 text-xs transition-all duration-500 border relative overflow-hidden group",
                            selectedVariant?.id === v.id 
                              ? "border-primary text-primary bg-primary/5"
                              : "border-foreground/5 text-muted-foreground hover:border-primary/30"
                          )}
                        >
                          <span className="relative z-10 font-medium">{v.name}</span>
                          {selectedVariant?.id === v.id && (
                            <motion.div 
                              layoutId="activeVariant"
                              className="absolute inset-0 bg-primary/5 z-0"
                              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-8 items-end">
                  {/* Price Section */}
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">
                      Price
                    </label>
                    <PriceDisplay 
                      price={currentVariant?.sellingPrice || product.sellingPrice} 
                      compareAtPrice={currentVariant?.mrp || product.mrp} 
                      className="text-2xl"
                    />
                  </div>

                  {/* Quantity Selection */}
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">
                      Quantity
                    </label>
                    <div className="flex items-center h-11 border border-foreground/10 bg-white">
                      <button 
                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                        className="w-10 h-full flex items-center justify-center hover:bg-[#F6F1EB] transition-colors disabled:opacity-20"
                        disabled={quantity <= 1}
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="flex-1 text-center text-sm font-medium tabular-nums">{quantity}</span>
                      <button 
                        onClick={() => setQuantity(q => q + 1)}
                        className="w-10 h-full flex items-center justify-center hover:bg-[#F6F1EB] transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Button 
                    className="w-full rounded-none h-14 uppercase tracking-[0.25em] text-[10px] font-bold shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all duration-500"
                    onClick={handleAddToCart}
                  >
                    <ShoppingCart className="w-4 h-4 mr-3" />
                    Add to Cart
                  </Button>
                </div>
                
                <p className="text-[10px] text-center text-muted-foreground/60 uppercase tracking-widest font-medium">
                  Free delivery on orders above ₹499
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
