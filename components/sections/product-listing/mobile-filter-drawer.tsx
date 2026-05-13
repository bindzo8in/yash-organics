"use client";

import { useState } from "react";
import { Filter } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ProductFilters } from "./product-filters";
import { Category } from "@/lib/types/product";

interface MobileFilterDrawerProps {
  categories: Category[];
  priceRange: { min: number; max: number };
}

export function MobileFilterDrawer({ categories, priceRange }: MobileFilterDrawerProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="lg:hidden flex items-center gap-2 rounded-none border-foreground/10 text-xs uppercase tracking-widest"
        >
          <Filter className="w-3.5 h-3.5" />
          Filters
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[400px] border-r-foreground/5 bg-[#FDFBF7] p-0 overflow-y-auto">
        <SheetHeader className="p-6 border-b border-foreground/5">
          <SheetTitle className="font-serif text-2xl">Filters</SheetTitle>
        </SheetHeader>
        <div className="p-6">
          <ProductFilters categories={categories} priceRange={priceRange} onClose={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
