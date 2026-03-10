export type BloqPost = {
  slug: string;
  title: string;
  publishedAt: string;
  updatedAt?: string;
  summary: string;
  content: string;
  url: string;
  
  category?: string;
  tags: string[];
  
  authors: string[];
  
  image?: string;
  
  draft: boolean;
  featured: boolean;
  status?: 'published' | 'draft' | 'archived' | 'trashed';
  readingTime?: number;
};
