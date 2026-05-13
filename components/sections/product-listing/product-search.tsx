"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

export function ProductSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [searchValue, setSearchValue] = useState(searchParams.get("q") || "");

  const createQueryString = useCallback(
    (name: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      params.set("page", "1"); // Reset to page 1 on search
      return params.toString();
    },
    [searchParams]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== (searchParams.get("q") || "")) {
        router.push(`${pathname}?${createQueryString("q", searchValue || null)}`, { scroll: false });
      }
    }, 500); // Debounce search

    return () => clearTimeout(timer);
  }, [searchValue, pathname, router, createQueryString, searchParams]);

  return (
    <div className="relative w-full max-w-sm">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search products..."
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        className="pl-9 pr-9 h-10 rounded-none border-foreground/10 bg-background/50 focus-visible:ring-primary/20 focus-visible:border-primary transition-all"
      />
      {searchValue && (
        <button
          onClick={() => setSearchValue("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
