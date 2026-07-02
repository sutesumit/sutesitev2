"use client";

import React from "react";
import Link from "next/link";
import type { BloqPost } from "@/lib/bloq";
import type { Blip } from "@/types/blip";
import type { Byte } from "@/types/byte";
import { formatTimeAgo } from "@/lib/formatTimeAgo";
import ScrambleText from "@/components/shared/ScrambleText";

type LatestUpdatesClientProps = {
  latestBloq: BloqPost | null;
  latestByte: Byte | null;
  latestBlip: Blip | null;
};

type UpdateItemProps = {
  href: string;
  label: string;
  text: string;
  date: string | null | undefined;
  liveStatus?: "active" | "closed";
};

const UpdateItem = ({ href, label, text, date, liveStatus }: UpdateItemProps) => (
  <li className="project-item flex items-center gap-2">
    <Link href={href} className="flex-1 truncate">
      {label} <ScrambleText text={text} />
    </Link>
    {liveStatus === "active" && (
      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-500">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex h-full w-full rounded-full bg-red-500" />
        </span>
        Live
      </span>
    )}
    <span className="opacity-50 ml-auto text-gray-500 text-xs">
      <ScrambleText text={formatTimeAgo(date)} />
    </span>
  </li>
);

export function LatestUpdatesClient({
  latestBloq,
  latestByte,
  latestBlip,
}: LatestUpdatesClientProps) {
  const updates = [
    latestBloq && {
      key: "bloq",
      href: `/bloq/${latestBloq.url}`,
      label: "bloq  |",
      text: latestBloq.title,
      date: latestBloq.publishedAt,
      liveStatus: latestBloq.liveStatus,
    },
    latestByte && {
      key: "byte",
      href: `/byte/${latestByte.byte_serial}`,
      label: "byte  |",
      text: latestByte.content,
      date: latestByte.created_at,
    },
    latestBlip && {
      key: "blip",
      href: `/blip/${latestBlip.blip_serial}`,
      label: "blip  |",
      text: latestBlip.term,
      date: latestBlip.created_at,
    },
  ].filter((item): item is NonNullable<typeof item> => !!item);

  return (
    <>
      <p>latest logs:</p>
      <ul className="project-list text-blue-900 dark:text-blue-400">
        {updates.map(({ key, ...props }) => (
          <UpdateItem key={key} {...props} />
        ))}
      </ul>
    </>
  );
}
