// Utility to read files from the filesystem. Do not put this logic inside components. Keep it in a lib folder. 
// **Action** Create `src/lib/bloq.ts`

import fs from "fs";
import path from "path";
import matter from "gray-matter";

export type BloqPost = {
  // Core fields
  slug: string;
  title: string;
  publishedAt: string;
  updatedAt?: string;
  summary: string;
  content: string;
  url: string;
  
  // Organization & taxonomy
  category?: string;
  tags: string[];
  
  // Authors (array for multi-author support)
  authors: string[];
  
  // Media
  image?: string;
  
  // Metadata & status
  draft: boolean;
  featured: boolean;
  status?: 'published' | 'draft' | 'archived' | 'trashed';
  readingTime?: number;
};

const postsDirectory = path.join(process.cwd(), "src/content/bloqs");

export function toUrlSafeString(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function getBloqPosts(): BloqPost[] {
  const entries = fs.readdirSync(postsDirectory, { withFileTypes: true });
  const allPostsData: BloqPost[] = [];

  for (const entry of entries) {
    // Ignore 'components' directory and hidden files
    if (entry.name === 'components' || entry.name.startsWith('.')) continue;

    // Check if this is a year directory (e.g., 2023, 2024, 2025)
    if (entry.isDirectory() && /^\d{4}$/.test(entry.name)) {
      // This is a year directory, scan it for blog posts
      const yearPath = path.join( postsDirectory, entry.name);
      const yearEntries = fs.readdirSync(yearPath, { withFileTypes: true });

      for (const postEntry of yearEntries) {
        if (postEntry.name.startsWith('.')) continue;
        
        const post = processPostEntry(postEntry, yearPath);
        if (post) allPostsData.push(post);
      }
    } else {
      // Handle backward compatibility: posts directly in bloqs/ directory
      const post = processPostEntry(entry, postsDirectory);
      if (post) allPostsData.push(post);
    }
  }

  // Filter out archived/trashed posts and drafts (in production)
  const filteredPosts = allPostsData.filter(post => {
    // 1. Remove if status is archived or trashed
    if (post.status === 'archived' || post.status === 'trashed') {
      return false;
    }

    // 2. Remove if draft in production
    if (process.env.NODE_ENV === 'production' && post.draft) {
      return false;
    }

    return true;
  });

  return filteredPosts.sort((a, b) => {
    if (a.publishedAt < b.publishedAt) {
      return 1;
    } else {
      return -1;
    }
  });
}

// Helper function to process a post entry (directory or file)
function processPostEntry(entry: fs.Dirent, basePath: string): BloqPost | null {
  let fullPath = path.join(basePath, entry.name);
  const fileName = entry.name;

  if (entry.isDirectory()) {
    fullPath = path.join(fullPath, 'index.mdx');
    if (!fs.existsSync(fullPath)) return null;
  } else if (!entry.name.endsWith('.mdx')) {
    return null;
  }

  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  const sluggedURL = toUrlSafeString(data.slug || fileName.replace(/\.mdx$/, ""));

  // Parse authors - support both string and array
  let authors: string[] = [];
  if (Array.isArray(data.authors)) {
    authors = data.authors;
  } else if (typeof data.author === 'string') {
    authors = [data.author];
  } else if (typeof data.authors === 'string') {
    authors = [data.authors];
  }

  // Parse tags - ensure it's an array
  let tags: string[] = [];
  if (Array.isArray(data.tags)) {
    tags = data.tags.map((tag: string) => tag.toLowerCase());
  }

  return {
    // Core fields
    url: sluggedURL || fileName.replace(/\.mdx$/, ""),
    slug: data.slug,
    title: data.title,
    publishedAt: data.publishedAt,
    updatedAt: data.updatedAt,
    summary: data.summary || "",
    content,
    
    // Organization & taxonomy
    category: data.category,
    tags,
    
    // Authors
    authors,
    
    // Media
    image: data.image,
    
    // Metadata & status
    draft: data.draft || false,
    featured: data.featured || false,
    status: data.status || 'published',
    readingTime: data.readingTime,
  };
}

export function getBloqPostBySlug(slug: string): BloqPost | undefined {
  const posts = getBloqPosts();
  return posts.find((post) => post.url === slug);
}

// ============================================================================
// FILTERING FUNCTIONS
// ============================================================================

/**
 * Get all posts with a specific tag
 */
export function getBloqPostsByTag(tag: string): BloqPost[] {
  const normalizedTag = tag.toLowerCase();
  return getBloqPosts().filter(post => 
    post.tags.includes(normalizedTag)
  );
}

/**
 * Get posts that have ANY of the specified tags (OR logic)
 */
export function getBloqPostsByTags(tags: string[]): BloqPost[] {
  const normalizedTags = tags.map(t => t.toLowerCase());
  return getBloqPosts().filter(post =>
    post.tags.some(tag => normalizedTags.includes(tag))
  );
}

/**
 * Get all posts in a specific category
 */
export function getBloqPostsByCategory(category: string): BloqPost[] {
  return getBloqPosts().filter(post =>
    post.category?.toLowerCase() === category.toLowerCase()
  );
}

/**
 * Get all posts by a specific author
 */
export function getBloqPostsByAuthor(author: string): BloqPost[] {
  return getBloqPosts().filter(post =>
    post.authors.some(a => a.toLowerCase() === author.toLowerCase())
  );
}

/**
 * Search posts by query string (searches title, summary, tags, and authors)
 */
export function searchBloqPosts(query: string): BloqPost[] {
  const lowerQuery = query.toLowerCase();
  return getBloqPosts().filter(post =>
    post.title.toLowerCase().includes(lowerQuery) ||
    post.summary?.toLowerCase().includes(lowerQuery) ||
    post.tags.some(tag => tag.includes(lowerQuery)) ||
    post.authors.some(author => author.toLowerCase().includes(lowerQuery))
  );
}

// ============================================================================
// METADATA & STATISTICS FUNCTIONS
// ============================================================================

/**
 * Get all unique tags with post counts (excludes trashed/archived)
 */
export function getAllTags(): { tag: string; count: number }[] {
  const posts = getBloqPosts().filter(post => 
    post.status !== 'archived' && post.status !== 'trashed'
  );
  
  const tagMap = new Map<string, number>();
  
  posts.forEach(post => {
    post.tags.forEach(tag => {
      tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
    });
  });
  
  return Array.from(tagMap.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count); // Sort by count descending
}

/**
 * Get all unique categories with post counts (excludes trashed/archived)
 */
export function getAllCategories(): { category: string; count: number }[] {
  const posts = getBloqPosts().filter(post => 
    post.status !== 'archived' && post.status !== 'trashed'
  );
  
  const categoryMap = new Map<string, number>();
  
  posts.forEach(post => {
    if (post.category) {
      const category = post.category;
      categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
    }
  });
  
  return Array.from(categoryMap.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => a.category.localeCompare(b.category)); // Sort alphabetically
}

/**
 * Get all unique authors from all posts
 */
export function getAllAuthors(): string[] {
  const posts = getBloqPosts();
  const authorSet = new Set<string>();
  
  posts.forEach(post => {
    post.authors.forEach(author => authorSet.add(author));
  });
  
  return Array.from(authorSet).sort();
}

/**
 * Get tag usage statistics as a Map
 */
export function getTagStats(): Map<string, number> {
  const tags = getAllTags();
  return new Map(tags.map(({ tag, count }) => [tag, count]));
}

/**
 * Get related posts based on tag similarity
 */
export function getRelatedPosts(post: BloqPost, limit: number = 3): BloqPost[] {
  const allPosts = getBloqPosts().filter(p => p.url !== post.url);
  
  // Score posts based on number of common tags
  const scoredPosts = allPosts.map(p => {
    const commonTags = p.tags.filter(tag => post.tags.includes(tag));
    return {
      post: p,
      score: commonTags.length
    };
  });
  
  // Sort by score (descending) and take top N
  return scoredPosts
    .filter(sp => sp.score > 0) // Only posts with at least one common tag
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(sp => sp.post);
}

/**
 * Get featured posts
 */
export function getFeaturedPosts(): BloqPost[] {
  return getBloqPosts().filter(post => post.featured);
}

/**
 * Get draft posts
 */
export function getDraftPosts(): BloqPost[] {
  return getBloqPosts().filter(post => post.draft || post.status === 'draft');
}

/**
 * Get N most recent posts
 */
export function getRecentPosts(limit: number): BloqPost[] {
  return getBloqPosts().slice(0, limit);
}

/**
 * Get most popular tags (by usage count)
 */
export function getPopularTags(limit: number): string[] {
  return getAllTags()
    .slice(0, limit)
    .map(({ tag }) => tag);
}