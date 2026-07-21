import type { BloqPost } from "@/lib/bloq/types";

/**
 * Bloq engagement identity helpers.
 *
 * For bloqs, the path suffix under `/bloq/` and the engagement `post_id`
 * (views + claps) are the same string by design. Live sessions use the
 * namespaced form `live/<slug>` so they share `post_type = bloq` without
 * colliding with MDX post urls.
 */

export const LIVE_BLOQ_ID_PREFIX = "live/";

export type BloqEngagementIdentity = {
  type: "bloq";
  id: string;
};

export function buildLiveBloqEngagementId(slug: string): string {
  return `${LIVE_BLOQ_ID_PREFIX}${slug}`;
}

export function isLiveBloqEngagementId(id: string): boolean {
  return id.startsWith(LIVE_BLOQ_ID_PREFIX);
}

export function parseLiveBloqSlug(id: string): string | null {
  if (!isLiveBloqEngagementId(id)) {
    return null;
  }
  return id.slice(LIVE_BLOQ_ID_PREFIX.length);
}

export function getBloqEngagementIdentity(
  post: Pick<BloqPost, "url">,
): BloqEngagementIdentity {
  return { type: "bloq", id: post.url };
}
