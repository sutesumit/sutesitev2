'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { BloqPost } from '@/lib/bloq';
import { searchBlogPosts } from '@/lib/search';
import BloqCard from './BloqCard';
import FilterPanel from './FilterPanel';

interface BloqFeedProps {
  initialPosts: BloqPost[];
  allCategories: { category: string; count: number }[];
  allTags: { tag: string; count: number }[];
}

export default function BloqFeed({ initialPosts, allCategories, allTags }: BloqFeedProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize state from URL params
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(searchParams.get('category'));
  const [selectedTags, setSelectedTags] = useState<string[]>(
    searchParams.get('tags') ? searchParams.get('tags')!.split(',') : []
  );

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (selectedCategory) params.set('category', selectedCategory);
    if (selectedTags.length > 0) params.set('tags', selectedTags.join(','));

    // Use replace to avoid cluttering history, or push to allow back button navigation through filter states
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchQuery, selectedCategory, selectedTags, pathname, router]);

  // Filter posts logic
  const filteredPosts = useMemo(() => {
    let results = initialPosts;

    // 1. Filter by Category
    if (selectedCategory) {
      results = results.filter(post => 
        post.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // 2. Filter by Tags (OR logic - match ANY selected tag)
    if (selectedTags.length > 0) {
      results = results.filter(post => 
        post.tags.some(tag => selectedTags.includes(tag))
      );
    }

    // 3. Filter by Search Query (using Fuse.js wrapper from lib/bloq if available, or simple filter)
    // Note: The searchBlogPosts function in lib/bloq.ts uses Fuse.js
    if (searchQuery) {
      results = searchBlogPosts(results, searchQuery);
    }

    return results;
  }, [initialPosts, selectedCategory, selectedTags, searchQuery]);

  // Handlers
  const handleCategoryChange = (category: string | null) => {
    setSelectedCategory(category);
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleClearAll = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    setSelectedTags([]);
  };

  return (
    <div className="w-full">
      <FilterPanel
        categories={allCategories}
        tags={allTags}
        selectedCategory={selectedCategory}
        selectedTags={selectedTags}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onCategoryChange={handleCategoryChange}
        onTagToggle={handleTagToggle}
        onClearAll={handleClearAll}
      />

      <div className="flex items-center justify-between mb-1 text-sm text-gray-500">
        <span>Showing {filteredPosts.length} posts</span>
      </div>

      <motion.div 
        layout
        className='all-tiles grid sm:grid-cols-1 grid-cols-1 gap-3'
      >
        <AnimatePresence mode='popLayout'>
          {filteredPosts.map((post) => (
            <BloqCard key={post.slug} post={post} />
          ))}
        </AnimatePresence>
      </motion.div>

      {filteredPosts.length === 0 && (
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
