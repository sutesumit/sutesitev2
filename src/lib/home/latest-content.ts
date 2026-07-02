import type { Blip } from "@/types/blip";
import type { Byte } from "@/types/byte";
import { getRecentPosts, type BloqPost } from "@/lib/bloq";
import { getBlips } from "@/lib/blip";
import { getBytes } from "@/lib/byte";
import { listSessions } from "@/lib/live-bloq/repository";
import { liveSessionToBloqPost } from "@/lib/live-bloq";
import type { LiveSession } from "@/lib/live-bloq/types";

export type LatestContentSummary = {
  latestBloq: BloqPost | null;
  latestByte: Byte | null;
  latestBlip: Blip | null;
};

const getMostRecentBloq = (staticBloq: BloqPost | null, liveBloq: BloqPost | null): BloqPost | null => {
  if (!staticBloq) return liveBloq;
  if (!liveBloq) return staticBloq;
  const staticDate = new Date(staticBloq.publishedAt);
  const liveDate = new Date(liveBloq.publishedAt);
  return liveDate > staticDate ? liveBloq : staticBloq;
};

export async function getLatestContentSummary(): Promise<LatestContentSummary> {
  const [staticBloq] = getRecentPosts(1);
  const [{ data: bytes }, { data: blips }, liveSessions] = await Promise.all([
    getBytes(1, 1),
    getBlips(1, 1),
    listSessions(),
  ]);

  let liveBloq: BloqPost | null = null;
  if (liveSessions.length > 0) {
    try {
      const mostRecentSession = liveSessions.reduce((latest: LiveSession, session: LiveSession) => {
        const latestDate = new Date(latest.started_at);
        const sessionDate = new Date(session.started_at);
        return sessionDate > latestDate ? session : latest;
      });
      liveBloq = liveSessionToBloqPost(mostRecentSession);
    } catch (error) {
      console.error('Error processing live session:', error);
      liveBloq = null;
    }
  }

  const latestBloq = getMostRecentBloq(staticBloq, liveBloq);

  return {
    latestBloq,
    latestByte: bytes[0] ?? null,
    latestBlip: blips[0] ?? null,
  };
}
