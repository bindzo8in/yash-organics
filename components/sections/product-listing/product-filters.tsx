"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
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
  onClose?: () => void; // Used for mobile drawer
}

export function ProductFilters({ categories, onClose }: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [priceRange, setPriceRange] = useState<number[]>([
    Number(searchParams.get("minPrice")) || 0,
    Number(searchParams.get("maxPrice")) || 10000,
  ]);

  const activeCategories = searchParams.get("category")?.split(",") || [];
  const activeRating = searchParams.get("rating");

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

  const handleRatingChange = (rating: string) => {
    const query = createQueryString({
      rating: activeRating === rating ? null : rating,
      page: "1",
    });
    router.push(`${pathname}?${query}`, { scroll: false });
  };

  const clearFilters = () => {
    router.push(pathname, { scroll: false });
    setPriceRange([0, 10000]);
    if (onClose) onClose();
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Categories */}
      <div className="space-y-4">
        <h3 className="font-serif text-lg tracking-tight">Categories</h3>
        <div className="space-y-3">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center space-x-3">
              <Checkbox
                id={`cat-${category.id}`}
                checked={activeCategories.includes(category.id)} // Using ID from DB
                onCheckedChange={(checked) => handleCategoryChange(category.id, checked as boolean)}
                className="rounded-none border-foreground/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <Label
                htmlFor={`cat-${category.id}`}
                className="text-sm font-normal cursor-pointer hover:text-primary transition-colors"
              >
                {category.name}
              </Label>
            </div>
          ))}
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
          defaultValue={[0, 10000]}
          max={10000}
          step={100}
          value={priceRange}
          onValueChange={handlePriceChange}
          onValueCommit={handlePriceCommit}
          className="py-4"
        />
      </div>

      <Separator className="bg-foreground/5" />

      {/* Ratings */}
      <div className="space-y-4">
        <h3 className="font-serif text-lg tracking-tight">Minimum Rating</h3>
        <div className="space-y-2">
          {["4", "3", "2"].map((rating) => (
            <button
              key={rating}
              onClick={() => handleRatingChange(rating)}
              className={cn(
                "flex items-center gap-2 w-full text-sm py-1 transition-all hover:translate-x-1",
                activeRating === rating ? "text-primary font-medium" : "text-muted-foreground"
              )}
            >
              <div className={cn(
                "w-3 h-3 border border-foreground/20 flex items-center justify-center",
                activeRating === rating && "bg-primary border-primary"
              )}>
                {activeRating === rating && <div className="w-1 h-1 bg-white" />}
              </div>
              <span>{rating} Stars & Up</span>
            </button>
          ))}
        </div>
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
