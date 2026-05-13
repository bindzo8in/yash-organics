import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyProductsStateProps {
  onClearFilters: () => void;
}

export function EmptyProductsState({ onClearFilters }: EmptyProductsStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
        <SearchX className="w-10 h-10 text-muted-foreground" />
      </div>
      <h3 className="font-serif text-2xl mb-2">No products found</h3>
      <p className="text-muted-foreground max-w-md mb-8">
        We couldn't find any products matching your current filters. Try adjusting your search or clearing all filters.
      </p>
      <Button 
        variant="outline" 
        onClick={onClearFilters}
        className="rounded-none border-foreground/20 hover:bg-foreground hover:text-background transition-all"
      >
        Clear All Filters
      </Button>
    </div>
  );
}
