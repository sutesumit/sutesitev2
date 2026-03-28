import type { Blip } from "@/types/blip";
import type { Byte } from "@/types/byte";
import { getRecentPosts, type BloqPost } from "@/lib/bloq";
import { getBlips } from "@/lib/blip";
import { getBytes } from "@/lib/byte";

export type LatestContentSummary = {
  latestBloq: BloqPost | null;
  latestByte: Byte | null;
  latestBlip: Blip | null;
};

export async function getLatestContentSummary(): Promise<LatestContentSummary> {
  const [latestBloq = null] = getRecentPosts(1);
  const [{ data: bytes }, { data: blips }] = await Promise.all([
    getBytes(1, 1),
    getBlips(1, 1),
  ]);

  return {
    latestBloq,
    latestByte: bytes[0] ?? null,
    latestBlip: blips[0] ?? null,
  };
}
