import type { BloqPost } from "@/lib/bloq";
import type { Byte } from "@/types/byte";
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

export function byteToFeedItem(byte: Byte, siteUrl: string): FeedItem {
  return {
    title: `Byte: ${byte.content.substring(0, 50)}${byte.content.length > 50 ? "..." : ""}`,
    link: `${siteUrl}/byte?byte=${byte.byte_serial}`,
    description: byte.content,
    pubDate: formatDateToRFC822(byte.created_at),
    guid: `${siteUrl}/byte?byte=${byte.byte_serial}`,
  };
}
