'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { BloqPost, PaginationInfo } from '@/lib/bloq';
import BloqCard from './BloqCard';
import FilterPanel from './FilterPanel';

interface BloqFeedProps {
  initialPosts: BloqPost[];
  allCategories: { category: string; count: number }[];
  allTags: { tag: string; count: number }[];
  featuredCount?: number;
  pagination?: PaginationInfo;
  currentFilters?: {
    category?: string;
    tags?: string[];
    featuredOnly?: boolean;
  };
  initialSearchQuery?: string;
}

export default function BloqFeed({ 
  initialPosts, 
  allCategories, 
  allTags,
  featuredCount = 0,
  pagination,
  currentFilters,
  initialSearchQuery = ''
}: BloqFeedProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Initialize state from props (which come from URL)
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(currentFilters?.category || null);
  const [selectedTags, setSelectedTags] = useState<string[]>(currentFilters?.tags || []);
  const [isFeaturedOnly, setIsFeaturedOnly] = useState<boolean>(currentFilters?.featuredOnly || false);

  // Debounce ref for search
  const debouncedSearchRef = useRef<NodeJS.Timeout | null>(null);

  const clearPendingSearchUpdate = useCallback((): void => {
    if (debouncedSearchRef.current) {
      clearTimeout(debouncedSearchRef.current);
      debouncedSearchRef.current = null;
    }
  }, []);

  const navigateWithFilters = useCallback((filters: {
    query?: string;
    category?: string | null;
    tags?: string[];
    featuredOnly?: boolean;
  }): void => {
    clearPendingSearchUpdate();

    const params = new URLSearchParams();
    if (filters.query) params.set('q', filters.query);
    if (filters.category) params.set('category', filters.category);
    if (filters.tags && filters.tags.length > 0) params.set('tags', filters.tags.join(','));
    if (filters.featuredOnly) params.set('featured', 'true');

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [clearPendingSearchUpdate, pathname, router]);

  // Debounced URL update for search - prevents excessive URL changes
  const updateSearchParams = useCallback((query: string) => {
    clearPendingSearchUpdate();

    debouncedSearchRef.current = setTimeout(() => {
      debouncedSearchRef.current = null;
      navigateWithFilters({
        query,
        category: selectedCategory,
        tags: selectedTags,
        featuredOnly: isFeaturedOnly,
      });
    }, 300);
  }, [clearPendingSearchUpdate, navigateWithFilters, selectedCategory, selectedTags, isFeaturedOnly]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      clearPendingSearchUpdate();
    };
  }, [clearPendingSearchUpdate]);

  // Handle search input change
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    updateSearchParams(query);
  };

  // Handle category change
  const handleCategoryChange = (category: string | null) => {
    setSelectedCategory(category);
    navigateWithFilters({
      query: searchQuery,
      category,
      tags: selectedTags,
      featuredOnly: isFeaturedOnly,
    });
  };

  // Handle featured toggle
  const handleFeaturedToggle = () => {
    const newValue = !isFeaturedOnly;
    setIsFeaturedOnly(newValue);
    navigateWithFilters({
      query: searchQuery,
      category: selectedCategory,
      tags: selectedTags,
      featuredOnly: newValue,
    });
  };

  // Handle tag toggle
  const handleTagToggle = (tag: string) => {
    const newTags = selectedTags.includes(tag) 
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    setSelectedTags(newTags);
    navigateWithFilters({
      query: searchQuery,
      category: selectedCategory,
      tags: newTags,
      featuredOnly: isFeaturedOnly,
    });
  };

  const handleClearAll = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    setSelectedTags([]);
    setIsFeaturedOnly(false);
    clearPendingSearchUpdate();
    router.replace(pathname, { scroll: false });
  };

  return (
    <div className="w-full">
      <FilterPanel
        categories={allCategories}
        tags={allTags}
        selectedCategory={selectedCategory}
        selectedTags={selectedTags}
        isFeaturedOnly={isFeaturedOnly}
        featuredCount={featuredCount}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onCategoryChange={handleCategoryChange}
        onFeaturedToggle={handleFeaturedToggle}
        onTagToggle={handleTagToggle}
        onClearAll={handleClearAll}
      />

      <div className="flex items-center justify-between mb-1 text-sm text-gray-500">
        {pagination ? (
          <span>Showing {initialPosts.length} of {pagination.total} posts</span>
        ) : (
          <span>Showing {initialPosts.length} posts</span>
        )}
      </div>

      <motion.div 
        layout
        className='all-tiles grid sm:grid-cols-1 grid-cols-1 gap-3'
      >
        <AnimatePresence mode='popLayout'>
          {initialPosts.map((post) => (
            <BloqCard key={post.slug} post={post} />
          ))}
        </AnimatePresence>
      </motion.div>

      {initialPosts.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          <p className="text-lg">No posts found matching your criteria.</p>
          <button 
            onClick={handleClearAll}
            className="mt-4 text-blue-600 hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
