'use client';

import Link from 'next/link';
import { PaginationInfo } from '@/types/pagination';

interface PaginationControlsProps {
  pagination: PaginationInfo;
  basePath: string;
  searchQuery?: string;
}

export default function PaginationControls({
  pagination,
  basePath,
  searchQuery,
}: PaginationControlsProps) {
  const { page, limit, total, totalPages, hasMore } = pagination;

  // Don't render if only one page
  if (totalPages <= 1) {
    return null;
  }

  const buildUrl = (newPage: number) => {
    const params = new URLSearchParams();
    params.set('page', newPage.toString());
    if (searchQuery) {
      params.set('q', searchQuery);
    }
    return `${basePath}?${params.toString()}`;
  };

  // Calculate showing range
  const start = Math.min((page - 1) * limit + 1, total);
  const end = Math.min(page * limit, total);

  return (
    <nav className="flex flex-col items-center gap-2 mt-8" aria-label="Pagination">
      <div className="text-sm text-muted-foreground">
        Showing {start} - {end} of {total}
      </div>

      <div className="flex items-center gap-1">
        {page > 1 && (
          <Link
            href={buildUrl(page - 1)}
            className="px-3 py-1.5 border rounded-md hover:bg-muted transition-colors"
            aria-label="Previous page"
          >
            ← Prev
          </Link>
        )}

        <span className="px-3 py-1.5">
          {page} / {totalPages}
        </span>

        {hasMore && (
          <Link
            href={buildUrl(page + 1)}
            className="px-3 py-1.5 border rounded-md hover:bg-muted transition-colors"
            aria-label="Next page"
          >
            Next →
          </Link>
        )}
      </div>
    </nav>
  );
}
