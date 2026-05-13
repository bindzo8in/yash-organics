"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useMemo } from "react";
import { X } from "lucide-react";
import { Category } from "@/lib/types/product";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface ProductFiltersProps {
  categories: Category[];
  priceRange: { min: number; max: number };
  onClose?: () => void; // Used for mobile drawer
}

export function ProductFilters({ categories, priceRange: globalPriceRange, onClose }: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [priceRange, setPriceRange] = useState<number[]>([
    Number(searchParams.get("minPrice")) || globalPriceRange.min,
    Number(searchParams.get("maxPrice")) || globalPriceRange.max,
  ]);

  const activeCategories = useMemo(() => {
    const cat = searchParams.get("category");
    if (!cat) return [];
    return cat.split(",").filter(Boolean);
  }, [searchParams]);

  const createQueryString = useCallback(
    (params: Record<string, string | null>) => {
      const newParams = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(params)) {
        if (value === null) {
          newParams.delete(key);
        } else {
          newParams.set(key, value);
        }
      }

      return newParams.toString();
    },
    [searchParams]
  );

  const handleCategoryChange = (categorySlug: string, checked: boolean) => {
    let newCategories = [...activeCategories];
    if (checked) {
      newCategories.push(categorySlug);
    } else {
      newCategories = newCategories.filter((c) => c !== categorySlug);
    }

    const query = createQueryString({
      category: newCategories.length > 0 ? newCategories.join(",") : null,
      page: "1",
    });
    router.push(`${pathname}?${query}`, { scroll: false });
  };

  const handlePriceChange = (value: number[]) => {
    setPriceRange(value);
  };

  const handlePriceCommit = (value: number[]) => {
    const query = createQueryString({
      minPrice: value[0].toString(),
      maxPrice: value[1].toString(),
      page: "1",
    });
    router.push(`${pathname}?${query}`, { scroll: false });
  };

  const clearFilters = () => {
    router.push(pathname, { scroll: false });
    setPriceRange([globalPriceRange.min, globalPriceRange.max]);
    if (onClose) onClose();
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Categories */}
      <div className="space-y-6">
        <h3 className="font-serif text-xl tracking-tight text-primary">Categories</h3>
        <div className="space-y-6">
          {categories
            .filter((cat) => !cat.parentId) // Get parent categories
            .map((parent) => {
              const subcategories = categories.filter((sub) => sub.parentId === parent.id);
              if (subcategories.length === 0) return null;

              return (
                <div key={parent.id} className="space-y-3">
                  <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground/60 border-b border-foreground/5 pb-2 mb-3">
                    {parent.name}
                  </h4>
                  <div className="space-y-2.5">
                    {subcategories.map((sub) => (
                      <div key={sub.id} className="flex items-center space-x-3 group cursor-pointer">
                        <Checkbox
                          id={`cat-${sub.slug}`}
                          checked={activeCategories.includes(sub.slug)}
                          onCheckedChange={(checked) => handleCategoryChange(sub.slug, checked as boolean)}
                          className="rounded-none border-foreground/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-colors"
                        />
                        <Label
                          htmlFor={`cat-${sub.slug}`}
                          className={cn(
                            "text-sm font-normal cursor-pointer transition-colors group-hover:text-primary",
                            activeCategories.includes(sub.slug) ? "text-primary font-medium" : "text-muted-foreground"
                          )}
                        >
                          {sub.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      <Separator className="bg-foreground/5" />

      {/* Price Range */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-lg tracking-tight">Price Range</h3>
          <span className="text-xs font-medium text-muted-foreground">
            ₹{priceRange[0]} - ₹{priceRange[1]}
          </span>
        </div>
        <Slider
          defaultValue={[globalPriceRange.min, globalPriceRange.max]}
          min={globalPriceRange.min}
          max={globalPriceRange.max}
          step={1}
          value={priceRange}
          onValueChange={handlePriceChange}
          onValueCommit={handlePriceCommit}
          className="py-4"
        />
      </div>

      <Button
        variant="ghost"
        onClick={clearFilters}
        className="mt-4 text-xs uppercase tracking-widest text-muted-foreground hover:text-primary hover:bg-transparent px-0 justify-start h-auto group"
      >
        <X className="w-3 h-3 mr-2 group-hover:rotate-90 transition-transform" />
        Clear all filters
      </Button>
    </div>
  );
}
