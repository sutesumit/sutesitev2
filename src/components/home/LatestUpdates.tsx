import { getLatestContentSummary } from "@/lib/home/latest-content";
import { LatestUpdatesClient } from "./LatestUpdatesClient";

export async function LatestUpdates() {
  const { latestBloq, latestByte, latestBlip } = await getLatestContentSummary();

  return (
    <LatestUpdatesClient
      latestBloq={latestBloq}
      latestByte={latestByte}
      latestBlip={latestBlip}
    />
  );
}
