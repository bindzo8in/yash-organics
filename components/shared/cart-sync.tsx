"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useCart, CartItem } from "@/hooks/use-cart";
import { syncCartWithDb, getDbCart } from "@/lib/actions/cart.actions";

export function CartSync() {
  const { data: session, status } = useSession();
  const { items, setItems } = useCart();
  const isInitialSync = useRef(true);
  const lastSyncedItems = useRef<string>("");

  // Sync logic
  useEffect(() => {
    if (status === "loading") return;

    const sync = async () => {
      if (session?.user) {
        // 1. Handle Initial Hydration/Merge on Login
        if (isInitialSync.current) {
          const dbItems = await getDbCart();
          
          if (dbItems && dbItems.length > 0) {
            // Merge Logic: Use a Map to combine items by productId + variantId
            const mergedMap = new Map<string, CartItem>();
            
            // First add DB items
            dbItems.forEach((item: any) => {
              const key = `${item.id}-${item.variantId || 'null'}`;
              mergedMap.set(key, item);
            });
            
            // Then add local items (local takes precedence or increments? Let's say local increments)
            items.forEach((item) => {
              const key = `${item.id}-${item.variantId || 'null'}`;
              if (mergedMap.has(key)) {
                const existing = mergedMap.get(key)!;
                mergedMap.set(key, {
                  ...existing,
                  quantity: Math.max(existing.quantity, item.quantity) // Or existing.quantity + item.quantity
                });
              } else {
                mergedMap.set(key, item);
              }
            });
            
            const mergedItems = Array.from(mergedMap.values());
            setItems(mergedItems);
            
            // Update last synced to avoid immediate re-sync
            lastSyncedItems.current = JSON.stringify(mergedItems.map(i => ({ id: i.id, variantId: i.variantId, quantity: i.quantity })));
            
            // Push merged state back to DB to ensure consistency
            await syncCartWithDb(mergedItems.map(i => ({
              id: i.id,
              variantId: i.variantId!,
              quantity: i.quantity,
              price: i.price
            })));
          } else if (items.length > 0) {
            // No DB items, but local items exist - sync them up
            await syncCartWithDb(items.map(i => ({
              id: i.id,
              variantId: i.variantId!,
              quantity: i.quantity,
              price: i.price
            })));
          }
          isInitialSync.current = false;
          return;
        }

        // 2. Continuous Sync (Debounced or on change)
        const currentItemsKey = JSON.stringify(items.map(i => ({ id: i.id, variantId: i.variantId, quantity: i.quantity })));
        
        if (currentItemsKey !== lastSyncedItems.current) {
          lastSyncedItems.current = currentItemsKey;
          await syncCartWithDb(items.map(i => ({
            id: i.id,
            variantId: i.variantId!,
            quantity: i.quantity,
            price: i.price
          })));
        }
      }
    };

    sync();
  }, [items, session, status, setItems]);

  return null; // This is a headless component
}
