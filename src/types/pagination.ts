export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface SearchParams {
  page?: number;
  q?: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: PaginationInfo;
}

export function createPaginationInfo(
  page: number,
  limit: number,
  total: number
): PaginationInfo {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasMore: page * limit < total,
  };
}

export function normalizePage(page: unknown, defaultPage = 1): number {
  const parsed = Number(page);
  if (isNaN(parsed) || parsed < 1) {
    return defaultPage;
  }
  return Math.floor(parsed);
}

export function normalizeSearchQuery(query: unknown, maxLength = 100): string {
  if (typeof query !== 'string') {
    return '';
  }
  return query.slice(0, maxLength).trim();
}
