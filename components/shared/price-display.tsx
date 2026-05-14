import { cn } from "@/lib/utils";

interface PriceDisplayProps {
  price: number;
  compareAtPrice?: number | null;
  className?: string;
  currency?: string;
}

export function PriceDisplay({
  price,
  compareAtPrice,
  className,
  currency = "₹",
}: PriceDisplayProps) {
  const hasDiscount = compareAtPrice && compareAtPrice > price;

  return (
    <div className={cn("flex items-baseline gap-2", className)}>
      <span className="text-lg font-bold text-primary">
        {currency}
        {price.toLocaleString()}
      </span>
      {hasDiscount && (
        <span className="text-sm text-muted-foreground line-through decoration-muted-foreground/50 font-medium">
          {currency}
          {compareAtPrice.toLocaleString()}
        </span>
      )}
    </div>
  );
}
