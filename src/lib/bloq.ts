// Utility to read files form the filestylem. Do not put this logic inside components. Keep it in a lib folder. 
// **Action** Create `src/lib/bloq.ts`

import fs from "fs";
import path from "path";
import matter from "gray-matter";

export type BloqPost = {
  slug: string;
  title: string;
  publishedAt: string;
  summary: string;
  image?: string;
  content: string;
  url: string;
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
  
  const allPostsData = entries
    .map((entry): BloqPost | null => {
      // Ignore 'components' directory and hidden files
      if (entry.name === 'components' || entry.name.startsWith('.')) return null;

      let fullPath = path.join(postsDirectory, entry.name);
      let fileName = entry.name;

      if (entry.isDirectory()) {
        fullPath = path.join(fullPath, 'index.mdx');
        if (!fs.existsSync(fullPath)) return null;
      } else if (!entry.name.endsWith('.mdx')) {
        return null;
      }

      const fileContents = fs.readFileSync(fullPath, "utf8");
      const { data, content } = matter(fileContents);

      const sluggedURL = toUrlSafeString(data.slug || fileName.replace(/\.mdx$/, ""));

      return {
        url: sluggedURL || fileName.replace(/\.mdx$/, ""),
        slug: data.slug,
        title: data.title,
        publishedAt: data.publishedAt,
        summary: data.summary,
        image: data.image,
        content,
      };
    })
    .filter((post): post is BloqPost => post !== null);

  return allPostsData.sort((a, b) => {
    if (a.publishedAt < b.publishedAt) {
      return 1;
    } else {
      return -1;
    }
  });
}

export function getBloqPostBySlug(slug: string): BloqPost | undefined {
  const posts = getBloqPosts();
  return posts.find((post) => post.url === slug);
}