import { getBloqPosts } from "@/lib/bloq";
import { getBytes } from "@/lib/byte";
import type { FeedConfig } from './types';
import { escapeXml, bloqToFeedItem, byteToFeedItem } from './formatters';

const DEFAULT_CONFIG: FeedConfig = {
  siteUrl: "https://sumitsute.com",
  siteTitle: "Sumit Sute",
  siteDescription: "Projects and writing by Sumit Sute, shaped by simplicity, clear boundaries, and long-term maintainability.",
  language: "en-us",
};

export async function generateFeed(
  maxItems: number = 50, 
  config: FeedConfig = DEFAULT_CONFIG
): Promise<string> {
  const [bloqs, bytes] = await Promise.all([
    Promise.resolve(getBloqPosts()),
    getBytes(),
  ]);

  const bloqItems = bloqs.map(post => bloqToFeedItem(post, config.siteUrl));
  const byteItems = bytes.map(byte => byteToFeedItem(byte, config.siteUrl));

  const allItems = [...bloqItems, ...byteItems]
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
    <title>${config.siteTitle}</title>
    <link>${config.siteUrl}</link>
    <description>${config.siteDescription}</description>
    <language>${config.language}</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${config.siteUrl}/feed.xml" rel="self" type="application/rss+xml"/>
${itemsXml}
  </channel>
</rss>`;
}
