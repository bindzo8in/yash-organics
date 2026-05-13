import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
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
        
        // Use a consistent comparison for variantId (normalize null/undefined)
        const existingItemIndex = currentItems.findIndex((item) => 
          item.id === cartProduct.id && 
          (item.variantId || null) === (cartProduct.variantId || null)
        );

        if (existingItemIndex > -1) {
          const updatedItems = [...currentItems];
          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            quantity: updatedItems[existingItemIndex].quantity + quantity
          };
          set({ items: updatedItems });
        } else {
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
        const updatedItems = currentItems.map((item) =>
          item.id === productId && (item.variantId || null) === (variantId || null)
            ? { ...item, quantity: Math.max(1, quantity) }
            : item
        );
        set({ items: updatedItems });
      },

      clearCart: () => set({ items: [] }),

      totalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      totalPrice: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },
    }),
    {
      name: "yash-cart-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
