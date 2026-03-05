import { getBloqPosts, type BloqPost } from "./bloq";
import { getBlips } from "./blip";
import type { Blip } from "@/types/blip";

const SITE_URL = "https://sumitsute.com";
const SITE_TITLE = "Sumit Sute";
const SITE_DESCRIPTION = "Projects and writing by Sumit Sute, shaped by simplicity, clear boundaries, and long-term maintainability.";
const FEED_LANGUAGE = "en-us";

type FeedItem = {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  guid: string;
  category?: string;
};

function formatDateToRFC822(dateString: string): string {
  const date = new Date(dateString);
  return date.toUTCString();
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function bloqToFeedItem(post: BloqPost): FeedItem {
  return {
    title: `Bloq: ${post.title}`,
    link: `${SITE_URL}/bloq/${post.url}`,
    description: post.summary,
    pubDate: formatDateToRFC822(post.publishedAt),
    guid: `${SITE_URL}/bloq/${post.url}`,
    category: post.category,
  };
}

function blipToFeedItem(blip: Blip): FeedItem {
  return {
    title: `Blip: ${blip.content.substring(0, 50)}${blip.content.length > 50 ? "..." : ""}`,
    link: `${SITE_URL}/#blip-${blip.id}`,
    description: blip.content,
    pubDate: formatDateToRFC822(blip.created_at),
    guid: `${SITE_URL}/blip/${blip.id}`,
  };
}

export async function generateFeed(maxItems: number = 50): Promise<string> {
  const [bloqs, blips] = await Promise.all([
    Promise.resolve(getBloqPosts()),
    getBlips(),
  ]);

  const bloqItems = bloqs.map(bloqToFeedItem);
  const blipItems = blips.map(blipToFeedItem);

  const allItems = [...bloqItems, ...blipItems]
    .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
    .slice(0, maxItems);

  const itemsXml = allItems
    .map((item) => {
      const categoryXml = item.category ? `\n      <category>${escapeXml(item.category)}</category>` : "";
      return `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${item.link}</link>
      <description>${escapeXml(item.description)}</description>
      <pubDate>${item.pubDate}</pubDate>
      <guid isPermaLink="true">${item.guid}</guid>${categoryXml}
    </item>`;
    })
    .join("\n");

  const lastBuildDate = new Date().toUTCString();

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${SITE_TITLE}</title>
    <link>${SITE_URL}</link>
    <description>${SITE_DESCRIPTION}</description>
    <language>${FEED_LANGUAGE}</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
${itemsXml}
  </channel>
</rss>`;
}
