import type { BloqPost } from "@/lib/bloq/types";
import { buildLiveBloqEngagementId } from "@/lib/content-identity";
import type { LiveSession } from "./types";

export function liveSessionToBloqPost(session: LiveSession): BloqPost {
  return {
    url: buildLiveBloqEngagementId(session.slug),
    slug: session.slug,
    title: session.title,
    publishedAt: session.started_at,
    updatedAt: session.closed_at ?? undefined,
    summary:
      session.summary ??
      (session.entry_count === 0
        ? "Live session in progress"
        : `${session.entry_count} entries from live session`),
    content: "",
    category: session.category,
    tags: session.tags.length > 0 ? [...session.tags, "live"] : ["live"],
    authors: session.authors,
    image: undefined,
    draft: false,
    featured: false,
    status: "published",
    liveStatus: session.status as "active" | "closed",
    readingTime:
      session.entry_count > 0
        ? Math.max(1, Math.ceil(session.entry_count / 10))
        : undefined,
  };
}
