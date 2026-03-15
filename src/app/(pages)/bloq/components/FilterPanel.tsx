import React, { useState } from 'react';
import { Search, X, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface FilterPanelProps {
  categories: { category: string; count: number }[];
  tags: { tag: string; count: number }[];
  selectedCategory: string | null;
  selectedTags: string[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onCategoryChange: (category: string | null) => void;
  onTagToggle: (tag: string) => void;
  onClearAll: () => void;
  className?: string;
}

export default function FilterPanel({
  categories,
  tags,
  selectedCategory,
  selectedTags,
  searchQuery,
  onSearchChange,
  onCategoryChange,
  onTagToggle,
  onClearAll,
  className
}: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  const hasActiveFilters = selectedCategory || selectedTags.length > 0 || searchQuery;
  const showFilters = isExpanded || isFocused || hasActiveFilters;

  const filterVariants = {
    hidden: { 
      height: 0, 
      opacity: 0,
      transition: { duration: 0.2, ease: "easeInOut" }
    },
    visible: { 
      height: "auto", 
      opacity: 1,
      transition: { duration: 0.2, ease: "easeInOut" }
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = (e: React.FocusEvent) => {
    // Check if the new focus target is within the filter panel
    const currentTarget = e.currentTarget;
    const relatedTarget = e.relatedTarget as Node;
    
    // Only set isFocused to false if we're focusing outside the entire panel
    if (!currentTarget.contains(relatedTarget)) {
      setIsFocused(false);
    }
  };

  const handleToggle = () => {
    const newExpandedState = !isExpanded;
    setIsExpanded(newExpandedState);
    
    // If explicitly collapsing, also clear focus to ensure it actually collapses
    if (!newExpandedState) {
      setIsFocused(false);
    }
  };

  return (
    <div 
      className={cn("w-full space-y-2 mb-2 p-2 rounded-md blue-border backdrop-blur-sm", className)}
      onFocusCapture={handleFocus}
      onBlurCapture={handleBlur}
    >
      
      {/* Search Bar with Toggle Button */}
      <div className="flex gap-2 items-center">
        <div className="relative search-bar flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-1 border border-gray-300 dark:border-gray-700 rounded-md leading-5 bg-white dark:bg-gray-900 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
            placeholder="Search bloqs..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-controls="filter-sections"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        
        {/* Toggle Button */}
        <button
          onClick={handleToggle}
          className={cn(
            "inline-flex items-center gap-1 px-3 py-1 blue-border rounded-md text-sm font-medium transition-all duration-200",
            showFilters
              ? "bg-blue-600 text-white shadow-md"
              : "bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-200 dark:hover:bg-blue-900/50",
            // Gray out when active filters prevent collapse
            hasActiveFilters && "opacity-50 cursor-not-allowed hover:bg-blue-600"
          )}
          aria-label="Toggle filters"
          aria-expanded={!!showFilters}
          aria-controls="filter-sections"
          title={hasActiveFilters ? "Clear filters to collapse" : "Toggle filters"}
        >
          <Filter className="h-4 w-4" />
          {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {/* Collapsible Filter Sections */}
      <AnimatePresence initial={false}>
        {showFilters && (
          <motion.div
            id="filter-sections"
            role="region"
            aria-label="Filter options"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={filterVariants}
            className="overflow-hidden"
          >
            <div className="filter-panel flex flex-col justify-center text-center space-y-2 pt-2">
              {/* Categories */}
              <div className="space-y-1 flex items-baseline gap-2">
                <div className="flex flex-wrap gap-2 justify-start">
                   <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Categories: </h3>
                  <button
                    onClick={() => onCategoryChange(null)}
                    className={cn(
                      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-all duration-200",
                      !selectedCategory
                        ? "bg-blue-600 text-white shadow-md scale-105"
                        : "bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-200 dark:hover:bg-blue-900/50"
                    )}
                  >
                    All
                  </button>
                  {categories.map(({ category, count }) => (
                    <button
                      key={category}
                      onClick={() => onCategoryChange(category === selectedCategory ? null : category)}
                      className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-all duration-200",
                        category === selectedCategory
                          ? "bg-blue-600 text-white shadow-md scale-105"
                          : "bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-200 dark:hover:bg-blue-900/50"
                      )}
                    >
                      {category} <span className="ml-1 opacity-60 text-xs">({count})</span>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Tags */}
              <div className="space-y-2 flex items-baseline gap-2">
                <div className="flex flex-wrap gap-2 justify-start">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tags: </h3>
                  {tags.map(({ tag }) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        onClick={() => onTagToggle(tag)}
                        className={cn(
                          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-all duration-200",
                          isSelected
                            ? "bg-blue-600 text-white shadow-md scale-105"
                            : "bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-200 dark:hover:bg-blue-900/50"
                        )}
                      >
                        #{tag}
                      </button>
                    );
                  })}
                </div>
              </div>
              
              {/* Active Filters Summary & Clear */}
              {hasActiveFilters && (
                <div className="flex items-center justify-end pt-1 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={onClearAll}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-all duration-200 bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-200 dark:hover:bg-red-900/50"
                    aria-label="Clear all active filters"
                  >
                    Clear all filters <Filter className="ml-1 h-3 w-3" /> 
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
