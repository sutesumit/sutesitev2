import { getRecentPosts } from '@/lib/bloq';
import { getBlips } from '@/lib/blip';
import { getBytes } from '@/lib/byte';
import { LatestUpdatesClient } from "./LatestUpdatesClient";

export async function LatestUpdates() {
  const [latestBloq = null] = getRecentPosts(1);
  const [{ data: bytes }, { data: blips }] = await Promise.all([
    getBytes(1, 1),
    getBlips(1, 1),
  ]);

  const latestByte = bytes[0] ?? null;
  const latestBlip = blips[0] ?? null;

  return (
    <LatestUpdatesClient
      latestBloq={latestBloq}
      latestByte={latestByte}
      latestBlip={latestBlip}
    />
  );
}
