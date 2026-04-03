import { projects } from "@/data";
import { getBlipByIdentifier } from "@/lib/blip";
import { getBloqPostBySlug } from "@/lib/bloq";
import { getByteByIdentifier } from "@/lib/byte";
import type { CounterNotificationContentType } from "@/lib/notifications/types";

const BYTE_TITLE_LIMIT = 48;

export type NotificationContentSummary = {
  contentType: CounterNotificationContentType;
  contentId: string;
  displayId: string;
  title: string | null;
};

function truncateTitle(value: string, limit: number): string {
  const normalized = value.trim().replace(/\s+/g, " ");

  if (normalized.length <= limit) {
    return normalized;
  }

  return `${normalized.slice(0, limit - 3).trimEnd()}...`;
}

export async function resolveNotificationContentSummary(
  contentType: CounterNotificationContentType,
  contentId: string
): Promise<NotificationContentSummary> {
  if (contentType === "bloq") {
    const post = getBloqPostBySlug(contentId);
    return {
      contentType,
      contentId,
      displayId: "",
      title: post?.title ?? null,
    };
  }

  if (contentType === "blip") {
    const blip = await getBlipByIdentifier(contentId);
    return {
      contentType,
      contentId,
      displayId: blip?.blip_serial ?? contentId,
      title: blip?.term ?? null,
    };
  }

  if (contentType === "byte") {
    const byte = await getByteByIdentifier(contentId);
    return {
      contentType,
      contentId,
      displayId: byte?.byte_serial ?? contentId,
      title: byte ? truncateTitle(byte.content, BYTE_TITLE_LIMIT) : null,
    };
  }

  const project = projects.find((entry) => entry.slug === contentId);
  return {
    contentType,
    contentId,
    displayId: "",
    title: project?.title ?? null,
  };
}
