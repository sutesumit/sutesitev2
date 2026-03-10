import type { BloqPost } from './types';
import { getBloqPosts } from './parser';

export function getRelatedPosts(post: BloqPost, limit: number = 2): BloqPost[] {
  const allPosts = getBloqPosts().filter(p => p.url !== post.url);
  
  const scoredPosts = allPosts.map(p => {
    const commonTags = p.tags.filter(tag => post.tags.includes(tag));
    return {
      post: p,
      score: commonTags.length
    };
  });
  
  return scoredPosts
    .filter(sp => sp.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(sp => sp.post);
}

export function getFeaturedPosts(): BloqPost[] {
  return getBloqPosts().filter(post => post.featured);
}

export function getDraftPosts(): BloqPost[] {
  return getBloqPosts().filter(post => post.draft || post.status === 'draft');
}

export function getRecentPosts(limit: number): BloqPost[] {
  return getBloqPosts().slice(0, limit);
}
