import { describe, it, expect } from 'vitest';
import {
  createPaginationInfo,
  normalizePage,
  normalizeSearchQuery,
} from '@/types/pagination';

describe('createPaginationInfo', () => {
  it('should calculate correct pagination for 50 items, 10 per page', () => {
    const result = createPaginationInfo(1, 10, 50);
    
    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
    expect(result.total).toBe(50);
    expect(result.totalPages).toBe(5);
    expect(result.hasMore).toBe(true);
  });

  it('should show hasMore=false on last page', () => {
    const result = createPaginationInfo(5, 10, 50);
    
    expect(result.hasMore).toBe(false);
    expect(result.totalPages).toBe(5);
  });

  it('should handle less than one page of items', () => {
    const result = createPaginationInfo(1, 10, 5);
    
    expect(result.totalPages).toBe(1);
    expect(result.hasMore).toBe(false);
  });

  it('should handle exact page boundary', () => {
    const result = createPaginationInfo(3, 10, 30);
    
    expect(result.totalPages).toBe(3);
    expect(result.hasMore).toBe(false);
  });
});

describe('normalizePage', () => {
  it('should return default for undefined', () => {
    expect(normalizePage(undefined)).toBe(1);
  });

  it('should return default for non-numeric string', () => {
    expect(normalizePage('abc')).toBe(1);
  });

  it('should return default for negative numbers', () => {
    expect(normalizePage(-1)).toBe(1);
  });

  it('should return default for zero', () => {
    expect(normalizePage(0)).toBe(1);
  });

  it('should return floor of positive integer', () => {
    expect(normalizePage(5)).toBe(5);
  });

  it('should floor decimal numbers', () => {
    expect(normalizePage(3.7)).toBe(3);
  });

  it('should use custom default', () => {
    expect(normalizePage(undefined, 10)).toBe(10);
  });
});

describe('normalizeSearchQuery', () => {
  it('should return empty string for undefined', () => {
    expect(normalizeSearchQuery(undefined)).toBe('');
  });

  it('should return empty string for non-string', () => {
    expect(normalizeSearchQuery(123)).toBe('');
  });

  it('should trim whitespace', () => {
    expect(normalizeSearchQuery('  test  ')).toBe('test');
  });

  it('should truncate long queries', () => {
    const longQuery = 'a'.repeat(200);
    const result = normalizeSearchQuery(longQuery);
    
    expect(result.length).toBe(100);
  });

  it('should not truncate short queries', () => {
    expect(normalizeSearchQuery('test').length).toBe(4);
  });
});
