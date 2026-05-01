'use client';

import Link from 'next/link';
import { PaginationInfo } from '@/types/pagination';

interface PaginationControlsProps {
  pagination: PaginationInfo;
  basePath: string;
  searchQuery?: string;
  extraParams?: Record<string, string | undefined>;
}

function getPageNumbers(current: number, total: number): (number | '...')[] {
  const pages: (number | '...')[] = [];

  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);

    if (current > 3) pages.push('...');

    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);

    for (let i = start; i <= end; i++) pages.push(i);

    if (current < total - 2) pages.push('...');

    pages.push(total);
  }

  return pages;
}

export default function PaginationControls({
  pagination,
  basePath,
  searchQuery,
  extraParams,
}: PaginationControlsProps) {
  const { page, totalPages } = pagination;

  if (totalPages <= 1) {
    return null;
  }

  const buildUrl = (newPage: number) => {
    const params = new URLSearchParams();
    params.set('page', newPage.toString());
    if (searchQuery) {
      params.set('q', searchQuery);
    }
    if (extraParams) {
      Object.entries(extraParams).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        }
      });
    }
    return `${basePath}?${params.toString()}`;
  };

  const pageNumbers = getPageNumbers(page, totalPages);

  return (
    <nav className="flex items-center justify-center gap-1 mt-2" aria-label="Pagination">
      {pageNumbers.map((item, index) =>
        item === '...' ? (
          <span key={`ellipsis-${index}`} className="px-3 py-1.5 text-muted-foreground">
            ...
          </span>
        ) : item === page ? (
          <span
            key={item}
            className="px-3 py-1.5 blue-border border-blue-600 rounded-md bg-blue-600 transition-colors"
          >
            {item}
          </span>
        ) : (
          <Link
            key={item}
            href={buildUrl(item)}
            className="px-3 py-1.5 blue-border rounded-md hover:bg-blue-500/50 transition-colors"
            aria-label={`Page ${item}`}
          >
            {item}
          </Link>
        )
      )}
    </nav>
  );
}
