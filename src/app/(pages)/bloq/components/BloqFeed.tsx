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
  pagination?: PaginationInfo;
  currentFilters?: {
    category?: string;
    tags?: string[];
  };
  initialSearchQuery?: string;
}

export default function BloqFeed({ 
  initialPosts, 
  allCategories, 
  allTags,
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

  // Debounce ref for search
  const debouncedSearchRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced URL update for search - prevents excessive URL changes
  const updateSearchParams = useCallback((query: string) => {
    if (debouncedSearchRef.current) {
      clearTimeout(debouncedSearchRef.current);
    }

    debouncedSearchRef.current = setTimeout(() => {
      const params = new URLSearchParams();
      if (query) params.set('q', query);
      if (selectedCategory) params.set('category', selectedCategory);
      if (selectedTags.length > 0) params.set('tags', selectedTags.join(','));

      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }, 300);
  }, [pathname, router, selectedCategory, selectedTags]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (debouncedSearchRef.current) {
        clearTimeout(debouncedSearchRef.current);
      }
    };
  }, []);

  // Handle search input change
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    updateSearchParams(query);
  };

  // Handle category change
  const handleCategoryChange = (category: string | null) => {
    setSelectedCategory(category);
    
    // Immediate URL update for category (no debounce needed)
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (category) params.set('category', category);
    if (selectedTags.length > 0) params.set('tags', selectedTags.join(','));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Handle tag toggle
  const handleTagToggle = (tag: string) => {
    const newTags = selectedTags.includes(tag) 
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    setSelectedTags(newTags);
    
    // Immediate URL update for tags
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (selectedCategory) params.set('category', selectedCategory);
    if (newTags.length > 0) params.set('tags', newTags.join(','));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleClearAll = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    setSelectedTags([]);
    router.replace(pathname, { scroll: false });
  };

  return (
    <div className="w-full">
      <FilterPanel
        categories={allCategories}
        tags={allTags}
        selectedCategory={selectedCategory}
        selectedTags={selectedTags}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onCategoryChange={handleCategoryChange}
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
