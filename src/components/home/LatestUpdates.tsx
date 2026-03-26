import React from "react";
import Link from "next/link";
import type { BloqPost } from "@/lib/bloq";
import type { Blip } from "@/types/blip";
import type { Byte } from "@/types/byte";
import { formatTimeAgo } from "@/lib/formatTimeAgo";

type LatestUpdatesProps = {
  latestBloq: BloqPost | null;
  latestByte: Byte | null;
  latestBlip: Blip | null;
};

function truncateLabel(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength).trimEnd()}...`;
}

export function LatestUpdates({
  latestBloq,
  latestByte,
  latestBlip,
}: LatestUpdatesProps) {
  return (
    <>
    <p>latest logs:</p>
    <ul className="project-list text-blue-900 dark:text-blue-400">
      {latestBloq && (
        <li className="project-item flex items-center gap-2">
          <Link href={`/bloq/${latestBloq.url}`}>
            bloq: {truncateLabel(latestBloq.title, 35)}
          </Link>
          <span className="opacity-50 text-gray-500 text-xs">{formatTimeAgo(latestBloq.publishedAt)}</span>
        </li>
      )}
      {latestByte && (
        <li className="project-item flex items-center gap-2">
          <Link href={`/byte/${latestByte.byte_serial}`}>
            byte: {truncateLabel(latestByte.content, 35)}
          </Link>
          <span className="opacity-50 text-gray-500 text-xs">{formatTimeAgo(latestByte.created_at)}</span>
        </li>
      )}
      {latestBlip && (
        <li className="project-item flex items-center gap-2">
          <Link href={`/blip/${latestBlip.blip_serial}`}>
            blip: {latestBlip.term}
          </Link>
          <span className="opacity-50 text-gray-500 text-xs">{formatTimeAgo(latestBlip.created_at)}</span>
        </li>
      )}
    </ul>
    </>
  );
}
