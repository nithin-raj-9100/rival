'use client';

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  // Generate page numbers array to display
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <nav
      aria-label="Pagination Navigation"
      className="flex items-center justify-center gap-1.5 mt-8 border-t border-border/40 pt-6"
    >
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="h-9 w-9 rounded-lg border-border/50 bg-background/50 hover:bg-accent text-foreground focus-ring cursor-pointer"
        aria-label="Go to previous page"
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>

      <div className="flex items-center gap-1">
        {pages.map((p) => {
          const isActive = p === page;
          return (
            <Button
              key={p}
              variant={isActive ? 'default' : 'outline'}
              size="sm"
              onClick={() => onPageChange(p)}
              className={`h-9 min-w-9 rounded-lg font-semibold text-xs cursor-pointer ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20 border-primary'
                  : 'border-border/50 bg-background/50 text-muted-foreground hover:text-foreground hover:bg-accent hover:border-border'
              }`}
              aria-label={`Go to page ${p}`}
              aria-current={isActive ? 'page' : undefined}
            >
              {p}
            </Button>
          );
        })}
      </div>

      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="h-9 w-9 rounded-lg border-border/50 bg-background/50 hover:bg-accent text-foreground focus-ring cursor-pointer"
        aria-label="Go to next page"
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </nav>
  );
}
