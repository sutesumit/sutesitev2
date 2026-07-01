import { getBloqPosts } from './parser';
import type { BloqPost } from './types';

export function getAllTags(extraPosts: BloqPost[] = []): { tag: string; count: number }[] {
  const mdxPosts = getBloqPosts().filter(post => 
    post.status !== 'archived' && post.status !== 'trashed'
  );
  const posts = [...mdxPosts, ...extraPosts];
  
  const tagMap = new Map<string, number>();
  
  posts.forEach(post => {
    post.tags.forEach(tag => {
      tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
    });
  });
  
  return Array.from(tagMap.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}

export function getAllCategories(extraPosts: BloqPost[] = []): { category: string; count: number }[] {
  const mdxPosts = getBloqPosts().filter(post => 
    post.status !== 'archived' && post.status !== 'trashed'
  );
  const posts = [...mdxPosts, ...extraPosts];
  
  const categoryMap = new Map<string, number>();
  
  posts.forEach(post => {
    if (post.category) {
      const category = post.category;
      categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
    }
  });
  
  return Array.from(categoryMap.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => a.category.localeCompare(b.category));
}

export function getFeaturedCount(extraPosts: BloqPost[] = []): number {
  const mdxPosts = getBloqPosts().filter(post => 
    post.featured && post.status !== 'archived' && post.status !== 'trashed'
  );
  const featuredLive = extraPosts.filter(p => p.featured).length;
  return mdxPosts.length + featuredLive;
}

export function getAllAuthors(): string[] {
  const posts = getBloqPosts();
  const authorSet = new Set<string>();
  
  posts.forEach(post => {
    post.authors.forEach(author => authorSet.add(author));
  });
  
  return Array.from(authorSet).sort();
}

export function getTagStats(): Map<string, number> {
  const tags = getAllTags();
  return new Map(tags.map(({ tag, count }) => [tag, count]));
}

export function getPopularTags(limit: number): string[] {
  return getAllTags()
    .slice(0, limit)
    .map(({ tag }) => tag);
}
