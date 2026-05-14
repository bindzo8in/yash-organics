"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Minus, Plus, Check } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
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
  const [openSection, setOpenSection] = useState<string | null>("benefits");

  const currentPrice = selectedVariant?.sellingPrice || 0;
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
      sellingPrice: currentPrice,
      mrp: currentMRP,
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

  const sections = [
    { id: "benefits", title: "Benefits", content: product.benefits },
    { id: "ingredients", title: "Key Ingredients", content: product.ingredients },
    { id: "usage", title: "How to Use", content: product.usage },
  ].filter(s => s.content);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 space-y-10">
        {/* Header & Badges */}
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="bg-secondary/50 text-secondary-foreground text-[10px] uppercase tracking-widest px-3 py-1 rounded-sm border-none font-bold">
              {product.category.name}
            </Badge>
            {product.isNew && (
              <Badge className="bg-accent/10 text-accent text-[10px] uppercase tracking-widest px-3 py-1 rounded-sm border-none font-bold">
                New Arrival
              </Badge>
            )}
            <Badge className="bg-primary/10 text-primary text-[10px] uppercase tracking-widest px-3 py-1 rounded-sm border-none font-bold">
              Bestseller
            </Badge>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif leading-[1.1] text-foreground tracking-tight">
              {product.name}
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-3xl font-light text-foreground/90">₹{currentPrice}</span>
              {currentMRP && currentMRP > currentPrice && (
                <div className="flex items-center gap-3">
                  <span className="text-xl text-muted-foreground line-through decoration-1">₹{currentMRP}</span>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-sm">
                    {discount}% OFF
                  </span>
                </div>
              )}
            </div>
          </div>

          <p className="text-muted-foreground text-sm md:text-base leading-relaxed max-w-xl">
            {product.description}
          </p>
        </div>

        {/* Quick Features / Key Ingredients (from image) */}
        {product.ingredients && (
          <div className="space-y-4 pt-2">
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground/80">Key Ingredients</span>
            <div className="flex flex-wrap gap-2">
              {product.ingredients.split(",").slice(0, 3).map((ing: string, i: number) => (
                <div key={i} className="px-4 py-2 bg-secondary/30 border border-border/50 text-[11px] font-medium rounded-sm">
                  {ing.trim()}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Variant Selection */}
        {variants.length > 1 && (
          <div className="space-y-4">
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground/80">Select Option</span>
            <div className="flex flex-wrap gap-3">
              {variants.map((v: any) => (
                <button
                  key={v.id}
                  onClick={() => {
                    setSelectedVariant(v);
                    setQuantity(1);
                  }}
                  className={cn(
                    "px-6 py-2 border text-[11px] uppercase tracking-widest transition-all duration-300",
                    selectedVariant?.id === v.id
                      ? "bg-primary border-primary text-white shadow-md"
                      : "bg-transparent border-border hover:border-primary"
                  )}
                >
                  {v.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Actions Row (Quantity + Add to Bag matching image) */}
        <div className="pt-4 space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Quantity Selector */}
            <div className="flex items-center border border-border h-14 bg-secondary/10 px-2">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-full flex items-center justify-center hover:text-primary transition-colors disabled:opacity-30"
                disabled={currentStock === 0}
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="w-10 text-center font-serif text-lg">{quantity}</span>
              <button 
                onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                className="w-10 h-full flex items-center justify-center hover:text-primary transition-colors disabled:opacity-30"
                disabled={currentStock === 0}
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Add to Bag Button */}
            <Button 
              onClick={handleAddToCart}
              disabled={isAdding || currentStock === 0}
              className="flex-1 h-14 text-sm font-bold bg-primary hover:bg-primary/90 rounded-none shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-3"
            >
              {isAdding ? (
                <motion.div 
                  animate={{ rotate: 360 }} 
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                >
                  <RefreshCcw className="h-5 w-5" />
                </motion.div>
              ) : (
                <>
                  <ShoppingBag className="h-4 w-4" />
                  {currentStock === 0 ? "OUT OF STOCK" : "ADD TO SHOPPING BAG"}
                </>
              )}
            </Button>
          </div>

          <div className="flex items-center gap-4 text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-medium">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Free shipping over ₹999
            </div>
            <div className="w-1 h-1 rounded-full bg-border" />
            <div className="flex items-center gap-2">
              Secure Payments
            </div>
          </div>
        </div>
      </div>

      {/* Accordions Section */}
      {sections.length > 0 && (
        <div className="mt-16 border-t border-border/50 divide-y divide-border/50">
          {sections.map((section) => (
            <div key={section.id} className="py-5">
              <button 
                onClick={() => setOpenSection(openSection === section.id ? null : section.id)}
                className="w-full flex items-center justify-between cursor-pointer group"
              >
                <span className={cn(
                  "text-[11px] uppercase tracking-[0.2em] font-bold transition-colors",
                  openSection === section.id ? "text-primary" : "text-muted-foreground/60 group-hover:text-primary"
                )}>
                  {section.title}
                </span>
                <Plus className={cn(
                  "h-3.5 w-3.5 transition-transform duration-500",
                  openSection === section.id ? "rotate-45" : "rotate-0"
                )} />
              </button>
              <AnimatePresence initial={false}>
                {openSection === section.id && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                  >
                    <div className="pt-5 text-[13px] text-muted-foreground leading-relaxed whitespace-pre-line">
                      {section.content}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}
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
