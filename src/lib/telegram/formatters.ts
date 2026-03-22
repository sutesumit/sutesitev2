import { escapeHtml, formatBloqChannelMessage } from "@/lib/notifications/formatters";

export function formatByte(byte: { byte_serial: string; content: string; created_at: string }): string {
  const date = new Date(byte.created_at);
  const timeStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `<code>${escapeHtml(byte.byte_serial)}.</code> ${escapeHtml(byte.content)}\n<i>${timeStr}</i>`;
}

export function formatBlip(blip: { blip_serial: string; term: string; meaning: string; created_at: string }): string {
  const date = new Date(blip.created_at);
  const timeStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `<code>${escapeHtml(blip.blip_serial)}.</code> <b>${escapeHtml(blip.term)}</b>: ${escapeHtml(blip.meaning)}\n<i>${timeStr}</i>`;
}

export function formatBloq(bloq: { title: string; summary?: string; slug: string; tags?: string[]; category?: string }): string {
  const message = formatBloqChannelMessage({
    title: bloq.title,
    slug: bloq.slug,
    tags: bloq.tags,
  });

  if (!bloq.summary) {
    return message;
  }

  return message.replace("\n<a ", `\n${escapeHtml(bloq.summary)}\n<a `);
}
