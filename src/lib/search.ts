// Fuse.js search wrapper for blog posts
import Fuse from 'fuse.js';
import type { IFuseOptions } from 'fuse.js';
import { BloqPost } from './bloq';

// Configure Fuse.js options
const fuseOptions: IFuseOptions<BloqPost> = {
  keys: [
    { name: 'title', weight: 0.4 },       // Title most important
    { name: 'tags', weight: 0.2 },        // Tags second
    { name: 'summary', weight: 0.2 },     // Summary third  
    { name: 'content', weight: 0.1 },     // Content body
    { name: 'authors', weight: 0.1 }      // Authors last
  ],
  threshold: 0.4,  // 0 = exact match, 1 = match anything
  includeScore: true,
  minMatchCharLength: 2,
  ignoreLocation: true,
};

/**
 * Create a Fuse instance for searching blog posts
 */
export function createBlogSearchIndex(posts: BloqPost[]): Fuse<BloqPost> {
  return new Fuse(posts, fuseOptions);
}

/**
 * Search blog posts using Fuse.js
 * Returns ranked results based on relevance
 */
export function searchBlogPosts(posts: BloqPost[], query: string): BloqPost[] {
  if (!query || query.trim().length < 2) {
    return posts; // Return all posts if query is too short
  }

  const fuse = createBlogSearchIndex(posts);
  const results = fuse.search(query);
  
  return results.map(result => result.item);
}

/**
 * Get search score for debugging
 */
export function searchBlogPostsWithScores(posts: BloqPost[], query: string) {
  const fuse = createBlogSearchIndex(posts);
  return fuse.search(query);
}
