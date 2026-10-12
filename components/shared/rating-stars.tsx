import { Star, StarHalf } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingStarsProps {
  rating?: number;
  count?: number;
  className?: string;
  showCount?: boolean;
  emptyText?: string;
}

export function RatingStars({
  rating = 0,
  count,
  className,
  showCount = true,
  emptyText,
}: RatingStarsProps) {
  const isZeroReviews = !rating || rating === 0 || count === 0;

  if (isZeroReviews) {
    return (
      <div className={cn("inline-flex items-center gap-1.5", className)}>
        <div className="flex items-center gap-0.5 text-amber-400/40">
          {[...Array(5)].map((_, i) => (
            <Star key={`empty-all-${i}`} className="w-3.5 h-3.5 stroke-[1.5]" />
          ))}
        </div>
        {showCount && (
          <span className="text-[11px] font-medium text-muted-foreground/80">
            {emptyText || "No reviews yet"}
          </span>
        )}
      </div>
    );
  }

  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = Math.max(0, 5 - fullStars - (hasHalfStar ? 1 : 0));

  return (
    <div className={cn("inline-flex items-center gap-1.5", className)}>
      <div className="flex items-center gap-0.5">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
        ))}
        {hasHalfStar && <StarHalf className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} className="w-3.5 h-3.5 text-amber-400/25 stroke-[1.5]" />
        ))}
      </div>
      {showCount && count !== undefined && (
        <span className="text-xs font-medium text-muted-foreground">({count})</span>
      )}
    </div>
  );
}
