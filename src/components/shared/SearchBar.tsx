'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';

interface SearchBarProps {
  placeholder?: string;
  initialValue?: string;
  basePath?: string;
  otherParams?: Record<string, string>;
}

export default function SearchBar({
  placeholder = 'Search...',
  initialValue = '',
  basePath = '',
  otherParams = {},
}: SearchBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState(initialValue);

  const handleSearch = useCallback(
    (searchValue: string) => {
      const params = new URLSearchParams();
      
      if (searchValue) {
        params.set('q', searchValue);
      }
      
      // Always reset to page 1 on search
      params.set('page', '1');
      
      // Add other params
      Object.entries(otherParams).forEach(([key, value]) => {
        params.set(key, value);
      });

      const queryString = params.toString();
      const url = queryString ? `${basePath}?${queryString}` : basePath || pathname;
      
      router.replace(url, { scroll: false });
    },
    [router, pathname, basePath, otherParams]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query !== initialValue) {
        handleSearch(query);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, initialValue, handleSearch]);

  return (
    <input
      type="text"
      placeholder={placeholder}
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      className="w-full px-4 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
      aria-label={placeholder}
    />
  );
}
