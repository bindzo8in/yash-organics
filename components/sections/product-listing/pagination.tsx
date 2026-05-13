"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PaginationProps {
  totalPages: number;
  currentPage: number;
}

export function Pagination({ totalPages, currentPage }: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createPageUrl = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  const handlePageChange = (page: number) => {
    router.push(createPageUrl(page), { scroll: true });
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-12 py-8 border-t border-foreground/5">
      <Button
        variant="ghost"
        size="icon"
        disabled={currentPage <= 1}
        onClick={() => handlePageChange(currentPage - 1)}
        className="rounded-none hover:bg-primary/5 text-muted-foreground disabled:opacity-30"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <Button
          key={page}
          variant="ghost"
          onClick={() => handlePageChange(page)}
          className={cn(
            "w-10 h-10 rounded-none text-sm font-medium transition-all",
            currentPage === page
              ? "bg-primary text-primary-foreground hover:bg-primary"
              : "hover:bg-primary/5 text-muted-foreground hover:text-primary"
          )}
        >
          {page}
        </Button>
      ))}

      <Button
        variant="ghost"
        size="icon"
        disabled={currentPage >= totalPages}
        onClick={() => handlePageChange(currentPage + 1)}
        className="rounded-none hover:bg-primary/5 text-muted-foreground disabled:opacity-30"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
