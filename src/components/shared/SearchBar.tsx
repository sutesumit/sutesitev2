'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { Search, X } from 'lucide-react';

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
    <div className="relative search-bar w-full">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="block w-full pl-10 pr-10 py-1 border border-gray-300 dark:border-gray-700 rounded-md leading-5 bg-white dark:bg-gray-900 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
        aria-label={placeholder}
      />
      {query && (
        <button
          onClick={() => {
            setQuery('');
            handleSearch('');
          }}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
