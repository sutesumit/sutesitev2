import type { BloqPost } from "@/lib/bloq";
import type { Blip } from "@/types/blip";
import type { FeedItem } from './types';

export function formatDateToRFC822(dateString: string): string {
  const date = new Date(dateString);
  return date.toUTCString();
}

export function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function bloqToFeedItem(post: BloqPost, siteUrl: string): FeedItem {
  return {
    title: `Bloq: ${post.title}`,
    link: `${siteUrl}/bloq/${post.url}`,
    description: post.summary,
    pubDate: formatDateToRFC822(post.publishedAt),
    guid: `${siteUrl}/bloq/${post.url}`,
    category: post.category,
  };
}

export function blipToFeedItem(blip: Blip, siteUrl: string): FeedItem {
  return {
    title: `Blip: ${blip.content.substring(0, 50)}${blip.content.length > 50 ? "..." : ""}`,
    link: `${siteUrl}/blip?blip=${blip.blip_serial}`,
    description: blip.content,
    pubDate: formatDateToRFC822(blip.created_at),
    guid: `${siteUrl}/blip?blip=${blip.blip_serial}`,
  };
}
