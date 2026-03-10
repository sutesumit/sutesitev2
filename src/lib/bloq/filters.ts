import type { BloqPost } from './types';
import { getBloqPosts } from './parser';

export function getBloqPostsByTag(tag: string): BloqPost[] {
  const normalizedTag = tag.toLowerCase();
  return getBloqPosts().filter(post => 
    post.tags.includes(normalizedTag)
  );
}

export function getBloqPostsByTags(tags: string[]): BloqPost[] {
  const normalizedTags = tags.map(t => t.toLowerCase());
  return getBloqPosts().filter(post =>
    post.tags.some(tag => normalizedTags.includes(tag))
  );
}

export function getBloqPostsByCategory(category: string): BloqPost[] {
  return getBloqPosts().filter(post =>
    post.category?.toLowerCase() === category.toLowerCase()
  );
}

export function getBloqPostsByAuthor(author: string): BloqPost[] {
  return getBloqPosts().filter(post =>
    post.authors.some(a => a.toLowerCase() === author.toLowerCase())
  );
}

export function searchBloqPosts(query: string): BloqPost[] {
  const lowerQuery = query.toLowerCase();
  return getBloqPosts().filter(post =>
    post.title.toLowerCase().includes(lowerQuery) ||
    post.summary?.toLowerCase().includes(lowerQuery) ||
    post.tags.some(tag => tag.includes(lowerQuery)) ||
    post.authors.some(author => author.toLowerCase().includes(lowerQuery))
  );
}
