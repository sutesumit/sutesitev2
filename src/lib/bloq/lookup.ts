import type { BloqPost } from "./types";
import { getBloqPostBySlug } from "./parser";
import { parseLiveBloqSlug } from "@/lib/content-identity";
import { getSessionBySlug } from "@/lib/live-bloq/repository";
import { liveSessionToBloqPost } from "@/lib/live-bloq/to-bloq-post";

/**
 * Resolves a slug to a BloqPost: the MDX content store first, then live
 * bloq sessions (dressed as BloqPosts via liveSessionToBloqPost). Accepts
 * live slugs with or without the "live/" prefix. Cancelled sessions,
 * unresolvable slugs, and live-store failures resolve to undefined so
 * callers (e.g. BloqLookupCard) can skip them silently.
 */
export async function resolveBloqPost(
  slug: string
): Promise<BloqPost | undefined> {
  const staticPost = getBloqPostBySlug(slug);
  if (staticPost) return staticPost;

  const liveSlug = parseLiveBloqSlug(slug) ?? slug;
  try {
    const session = await getSessionBySlug(liveSlug);
    if (!session || session.status === "cancelled") return undefined;
    return liveSessionToBloqPost(session);
  } catch {
    // Live store unavailable (e.g. build without Supabase env): skip lookup.
    return undefined;
  }
}
