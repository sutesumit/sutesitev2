import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { BloqPost } from './types';
import { getPostsDirectory, getPostEntries, readPostFile, postFileExists } from './reader';
import { calculateReadingTime } from './reading-time';
import { PaginationInfo, createPaginationInfo, normalizePage, normalizeSearchQuery } from '@/types/pagination';
import { searchBlogPosts } from '@/lib/search';

export function toUrlSafeString(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function extractSlugFromDirectoryName(dirName: string): string {
  const datePattern = /^\d{4}-\d{2}-\d{2}-(.+)$/;
  const match = dirName.match(datePattern);
  return match ? match[1] : dirName;
}

function processPostEntry(entry: fs.Dirent, basePath: string): BloqPost | null {
  let fullPath = path.join(basePath, entry.name);
  const fileName = entry.name;

  if (entry.isDirectory()) {
    fullPath = path.join(fullPath, 'index.mdx');
    if (!postFileExists(fullPath)) return null;
  } else if (!entry.name.endsWith('.mdx')) {
    return null;
  }

  const fileContents = readPostFile(fullPath);
  const { data, content } = matter(fileContents);

  const fallbackSlug = entry.isDirectory() 
    ? extractSlugFromDirectoryName(fileName)
    : fileName.replace(/\.mdx$/, "");
  const sluggedURL = toUrlSafeString(data.slug || fallbackSlug);

  let authors: string[] = [];
  if (Array.isArray(data.authors)) {
    authors = data.authors;
  } else if (typeof data.author === 'string') {
    authors = [data.author];
  } else if (typeof data.authors === 'string') {
    authors = [data.authors];
  }

  let tags: string[] = [];
  if (Array.isArray(data.tags)) {
    tags = data.tags.map((tag: string) => tag.toLowerCase());
  }

  return {
    url: sluggedURL || fileName.replace(/\.mdx$/, ""),
    slug: data.slug,
    title: data.title,
    publishedAt: data.publishedAt,
    updatedAt: data.updatedAt,
    summary: data.summary || "",
    content,
    
    category: data.category,
    tags,
    
    authors,
    
    image: data.image,
    
    draft: data.draft || false,
    featured: data.featured || false,
    status: data.status || 'published',
    readingTime: data.readingTime ?? calculateReadingTime(content),
  };
}

let cachedPosts: BloqPost[] | null = null;

export function getBloqPosts(): BloqPost[] {
  if (cachedPosts) return cachedPosts;
  
  const postsDirectory = getPostsDirectory();
  const entries = getPostEntries(postsDirectory);
  const allPostsData: BloqPost[] = [];

  for (const entry of entries) {
    if (entry.name === 'components' || entry.name.startsWith('.')) continue;

    if (entry.isDirectory() && /^\d{4}$/.test(entry.name)) {
      const yearPath = path.join(postsDirectory, entry.name);
      const yearEntries = getPostEntries(yearPath);

      for (const postEntry of yearEntries) {
        if (postEntry.name.startsWith('.')) continue;

        if (postEntry.isDirectory() && /^(0[1-9]|1[0-2])$/.test(postEntry.name)) {
          const monthPath = path.join(yearPath, postEntry.name);
          const monthEntries = getPostEntries(monthPath);

          for (const monthPostEntry of monthEntries) {
            if (monthPostEntry.name.startsWith('.')) continue;
            
            const post = processPostEntry(monthPostEntry, monthPath);
            if (post) allPostsData.push(post);
          }
        } else {
          const post = processPostEntry(postEntry, yearPath);
          if (post) allPostsData.push(post);
        }
      }
    } else {
      const post = processPostEntry(entry, postsDirectory);
      if (post) allPostsData.push(post);
    }
  }

  const filteredPosts = allPostsData.filter(post => {
    if (post.status === 'archived' || post.status === 'trashed') {
      return false;
    }

    if (process.env.NODE_ENV === 'production' && post.draft) {
      return false;
    }

    return true;
  });

  cachedPosts = filteredPosts.sort((a, b) => {
    if (a.publishedAt < b.publishedAt) {
      return 1;
    } else {
      return -1;
    }
  });
  
  return cachedPosts;
}

export interface BloqFilters {
  searchQuery?: string;
  category?: string;
  tags?: string[];
}

export interface PaginatedBloqResult {
  posts: BloqPost[];
  pagination: PaginationInfo;
}

export function getBloqPostsPaginated(
  page: number = 1,
  limit: number = 10,
  filters?: BloqFilters
): PaginatedBloqResult {
  const allPosts = getBloqPosts();
  
  const normalizedPage = normalizePage(page, 1);
  const searchQuery = filters?.searchQuery ? normalizeSearchQuery(filters.searchQuery) : undefined;
  const category = filters?.category;
  const tags = filters?.tags;
  
  // Apply filters
  let filtered = allPosts;
  
  // Search filter (using Fuse.js for fuzzy search)
  if (searchQuery) {
    filtered = searchBlogPosts(filtered, searchQuery);
  }
  
  // Category filter
  if (category) {
    filtered = filtered.filter(post => 
      post.category?.toLowerCase() === category.toLowerCase()
    );
  }
  
  // Tags filter (OR logic - match ANY selected tag)
  if (tags && tags.length > 0) {
    const lowerTags = tags.map(t => t.toLowerCase());
    filtered = filtered.filter(post => 
      post.tags?.some(tag => lowerTags.includes(tag.toLowerCase()))
    );
  }

  // Paginate
  const from = (normalizedPage - 1) * limit;
  const to = from + limit;
  
  return {
    posts: filtered.slice(from, to),
    pagination: createPaginationInfo(normalizedPage, limit, filtered.length),
  };
}

export function getBloqPostBySlug(slug: string): BloqPost | undefined {
  return getBloqPosts().find((post) => post.url === slug);
}

export function clearCache(): void {
  cachedPosts = null;
}
