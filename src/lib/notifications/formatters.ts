import type { Blip } from "@/types/blip";
import type { Byte } from "@/types/byte";
import type { BloqNotificationPayload, VisitorNotificationPayload } from "./types";

const SITE_URL = "https://www.sumitsute.com";

export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function formatByteChannelMessage(byte: Byte): string {
  return `🤖: <a href="${SITE_URL}/byte/${encodeURIComponent(byte.byte_serial)}">${escapeHtml(byte.content)}</a>`;
}

export function formatBlipChannelMessage(blip: Blip): string {
  const content = `${blip.term}: ${blip.meaning}`;
  return `🤖: <a href="${SITE_URL}/blip/${encodeURIComponent(blip.blip_serial)}">${escapeHtml(content)}</a>`;
}

export function formatBloqChannelMessage(bloq: BloqNotificationPayload): string {
  const safeTags = bloq.tags && bloq.tags.length > 0
    ? `\nTags: ${bloq.tags.map((tag) => escapeHtml(tag)).join(", ")}`
    : "";

  return `📝 <b>${escapeHtml(bloq.title)}</b>\n<a href="${SITE_URL}/bloq/${encodeURIComponent(bloq.slug)}">Read more</a>${safeTags}`;
}

export function formatVisitorNotification(
  visitor: VisitorNotificationPayload,
  referrer?: string
): string {
  const locationParts = [visitor.city, visitor.region, visitor.country].filter(Boolean);
  const location = locationParts.length > 0
    ? locationParts.map((part) => escapeHtml(part!)).join(", ")
    : "Unknown location";
  const source = referrer ? escapeHtml(referrer) : "direct";
  const returning = visitor.isReturning ? "👋 returning" : "✨ new";
  const count = visitor.visitCount && visitor.visitCount > 1 ? ` (${visitor.visitCount}x)` : "";
  const device = escapeHtml(visitor.deviceType || "Unknown");
  const ip = escapeHtml(visitor.ip || "Unknown IP");

  return `👤 <b>${returning}${count}</b>\n📍 ${location}\n💻 ${device}\n🌐 <code>${ip}</code>\n🔗 ${source}`;
}

