"use client";

import { useEffect, useRef } from "react";
import { useCart } from "@/hooks/use-cart";
import { getDbCart } from "@/lib/actions/cart.actions";
import { useSession } from "next-auth/react";

export function CartSync() {
  const { data: session, status } = useSession();
  const { items, setItems, syncWithDb } = useCart();
  const isInitialMount = useRef(true);
  const isSyncing = useRef(false);

  // Initial Sync: Fetch from DB and merge with local cart
  useEffect(() => {
    if (status === "authenticated" && isInitialMount.current) {
      const initSync = async () => {
        try {
          const dbItems = await getDbCart();
          if (dbItems && dbItems.length > 0) {
            // Merge logic: DB items take priority, but we could merge quantities
            // For simplicity, if DB has items and local is empty, use DB.
            // If both have items, we'll merge them here.
            const localItems = [...items];
            const mergedItems = [...dbItems];

            localItems.forEach(localItem => {
              const exists = mergedItems.find(
                dbItem => dbItem.id === localItem.id && dbItem.variantId === localItem.variantId
              );
              if (!exists) {
                mergedItems.push(localItem as any);
              } else {
                // If exists, maybe we should sum quantities? 
                // For now, let's just keep the DB quantity as it's more likely "official"
              }
            });

            setItems(mergedItems as any);
            // After merging, sync back to DB to ensure consistency
            isSyncing.current = true;
            await syncWithDb();
            isSyncing.current = false;
          }
        } catch (error) {
          console.error("Initial cart sync failed:", error);
        } finally {
          isInitialMount.current = false;
        }
      };

      initSync();
    } else if (status !== "loading") {
      isInitialMount.current = false;
    }
  }, [status]);

  // Periodic Sync: Watch for changes in local cart and push to DB
  useEffect(() => {
    if (status !== "authenticated" || isInitialMount.current || isSyncing.current) return;

    const timer = setTimeout(async () => {
      await syncWithDb();
    }, 2000); // Debounce sync by 2s

    return () => clearTimeout(timer);
  }, [items, status]);

  return null;
}
