"use client";

import Link from "next/link";
import Image from "next/image";
import { Trash2, Minus, Plus, ArrowRight, ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { PriceDisplay } from "@/components/shared/price-display";
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "motion/react";

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice, totalItems } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-10 h-10 text-muted-foreground" />
        </div>
        <h1 className="font-serif text-3xl mb-4">Your cart is empty</h1>
        <p className="text-muted-foreground max-w-md mb-8">
          Looks like you haven't added anything to your cart yet. 
          Explore our organic collection and find something you love.
        </p>
        <Link href="/products">
          <Button className="rounded-none px-8 py-6 bg-primary hover:bg-primary/90 text-primary-foreground">
            Continue Shopping
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] pt-32 pb-20 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <h1 className="font-serif text-4xl mb-12 text-primary">Shopping Cart</h1>
        
        <div className="grid lg:grid-cols-12 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-8 space-y-8">
            <div className="hidden md:grid grid-cols-12 pb-4 border-b border-foreground/5 text-xs uppercase tracking-widest text-muted-foreground font-medium">
              <div className="col-span-6">Product</div>
              <div className="col-span-3 text-center">Quantity</div>
              <div className="col-span-3 text-right">Subtotal</div>
            </div>

            <AnimatePresence mode="popLayout">
              {items.map((item) => (
                <motion.div
                  key={`${item.id}-${item.variantId || 'default'}`}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center py-6 border-b border-foreground/5 group"
                >
                  <div className="col-span-6 flex gap-6">
                    <div className="relative w-24 h-32 flex-shrink-0 bg-muted overflow-hidden">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-col justify-center">
                      <Link href={`/product/${item.slug}`} className="hover:text-primary transition-colors">
                        <h3 className="font-serif text-lg mb-0.5">{item.name}</h3>
                      </Link>
                      {item.variantName && (
                        <p className="text-sm font-medium text-primary/80 mb-1">{item.variantName}</p>
                      )}
                      <p className="text-[10px] text-muted-foreground mb-4 uppercase tracking-widest">
                        {item.category.name}
                      </p>
                      <button
                        onClick={() => removeItem(item.id, item.variantId)}
                        className="flex items-center gap-2 text-xs text-muted-foreground hover:text-destructive transition-colors mt-auto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Remove
                      </button>
                    </div>
                  </div>

                  <div className="col-span-3 flex justify-center">
                    <div className="flex items-center border border-foreground/10 rounded-none bg-background overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1, item.variantId)}
                        className="p-2 hover:bg-muted transition-colors disabled:opacity-30"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-10 text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1, item.variantId)}
                        className="p-2 hover:bg-muted transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="col-span-3 text-right">
                    <PriceDisplay price={item.price * item.quantity} className="justify-end" />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-4">
            <div className="bg-white p-8 border border-foreground/5 sticky top-32">
              <h2 className="font-serif text-2xl mb-8">Order Summary</h2>
              
              <div className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal ({totalItems()} items)</span>
                  <span className="font-medium">₹{totalPrice().toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-primary text-xs uppercase tracking-wider font-medium">Calculated at checkout</span>
                </div>
                
                <Separator className="bg-foreground/5 my-6" />
                
                <div className="flex justify-between text-lg font-serif">
                  <span>Total</span>
                  <span className="text-primary font-bold">₹{totalPrice().toLocaleString()}</span>
                </div>
              </div>

              <Link href="/checkout" className="block mt-10">
                <Button className="w-full rounded-none py-7 bg-primary hover:bg-primary/90 text-primary-foreground group">
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>

              <div className="mt-8 space-y-4">
                <p className="text-[10px] text-center text-muted-foreground uppercase tracking-widest leading-relaxed">
                  SECURE CHECKOUT • EASY RETURNS • GENUINE PRODUCTS
                </p>
                <div className="flex justify-center gap-4 opacity-30 grayscale">
                  {/* Payment icons could go here */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
