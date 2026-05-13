"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const SORT_OPTIONS = [
  { label: "Featured", value: "featured" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Newest Arrivals", value: "newest" },
  { label: "Best Rated", value: "rating" },
];

export function SortDropdown() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const currentSort = searchParams.get("sort") || "featured";
  const currentLabel = SORT_OPTIONS.find(opt => opt.value === currentSort)?.label || "Featured";

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      return params.toString();
    },
    [searchParams]
  );

  const handleSort = (value: string) => {
    router.push(`${pathname}?${createQueryString("sort", value)}`, { scroll: false });
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs uppercase tracking-widest text-muted-foreground hidden sm:inline-block">Sort by:</span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className="h-8 px-2 font-normal text-sm hover:bg-transparent focus-visible:ring-0 group"
          >
            {currentLabel}
            <ChevronDown className="ml-1 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="rounded-none border-foreground/10 min-w-[180px]">
          {SORT_OPTIONS.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => handleSort(option.value)}
              className="text-sm cursor-pointer focus:bg-primary focus:text-primary-foreground rounded-none"
            >
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
