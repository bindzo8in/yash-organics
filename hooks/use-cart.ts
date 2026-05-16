import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { syncCartWithDb } from "@/lib/actions/cart.actions";
import { toast } from "sonner";
import { Product } from "@/lib/types/product";

export interface CartItem extends Product {
  quantity: number;
  variantId?: string; // For later when variants are selected
  variantName?: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void;
  clearCart: () => void;
  setItems: (items: CartItem[]) => void;
  syncWithDb: () => Promise<void>;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (product, quantity = 1) => {
        const currentItems = get().items;
        const cartProduct = product as CartItem;
        const stockLimit = cartProduct.stock || 0;
        
        // Use a consistent comparison for variantId (normalize null/undefined)
        const existingItemIndex = currentItems.findIndex((item) => 
          item.id === cartProduct.id && 
          (item.variantId || null) === (cartProduct.variantId || null)
        );

        if (existingItemIndex > -1) {
          const currentQty = currentItems[existingItemIndex].quantity;
          const newQty = currentQty + quantity;
          
          if (newQty > stockLimit) {
            toast.error("Stock limit reached", {
              description: `Only ${stockLimit} units available. You already have ${currentQty} in your cart.`,
            });
            // Update to max stock if not already there
            if (currentQty < stockLimit) {
              const updatedItems = [...currentItems];
              updatedItems[existingItemIndex].quantity = stockLimit;
              set({ items: updatedItems });
            }
            return;
          }

          const updatedItems = [...currentItems];
          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            quantity: newQty
          };
          set({ items: updatedItems });
        } else {
          if (quantity > stockLimit) {
            toast.error("Stock limit reached", {
              description: `Only ${stockLimit} units available.`,
            });
            set({ items: [...currentItems, { ...cartProduct, quantity: stockLimit }] });
            return;
          }
          set({ items: [...currentItems, { ...cartProduct, quantity }] });
        }
      },

      removeItem: (productId, variantId) => {
        const currentItems = get().items;
        const filteredItems = currentItems.filter(
          (item) => !(item.id === productId && (item.variantId || null) === (variantId || null))
        );
        set({ items: filteredItems });
      },

      updateQuantity: (productId, quantity, variantId) => {
        const currentItems = get().items;
        const updatedItems = currentItems.map((item) => {
          if (item.id === productId && (item.variantId || null) === (variantId || null)) {
            const stockLimit = item.stock || 0;
            const requestedQty = Math.max(1, quantity);
            
            if (requestedQty > stockLimit) {
              toast.error(`Only ${stockLimit} units in stock`);
              return { ...item, quantity: stockLimit };
            }
            return { ...item, quantity: requestedQty };
          }
          return item;
        });
        set({ items: updatedItems });
      },

      clearCart: () => set({ items: [] }),
      setItems: (items: CartItem[]) => set({ items }),

      syncWithDb: async () => {
        const items = get().items;
        const result = await syncCartWithDb(items.map(i => ({
          id: i.id,
          variantId: i.variantId || "",
          quantity: i.quantity,
          sellingPrice: i.sellingPrice
        })));

        if (!result.success && result.error !== "Unauthorized") {
          console.error("Cart sync failed:", result.error);
        }
      },

      totalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      totalPrice: () => {
        return get().items.reduce((total, item) => total + item.sellingPrice * item.quantity, 0);
      },
    }),
    {
      name: "yash-cart-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
