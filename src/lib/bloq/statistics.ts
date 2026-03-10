import { getBloqPosts } from './parser';

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
    .sort((a, b) => b.count - a.count);
}

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
    .sort((a, b) => a.category.localeCompare(b.category));
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
