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
  shouldTruncate?: boolean;
};

const truncateLabel = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}...`;
};

const UpdateItem = ({ href, label, text, date, shouldTruncate }: UpdateItemProps) => (
  <li className="project-item flex items-center gap-2">
    <Link href={href}>
      {label} <ScrambleText text={shouldTruncate ? truncateLabel(text, 35) : text} />
    </Link>
    <span className="opacity-50 text-gray-500 text-xs">
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
      shouldTruncate: true,
    },
    latestByte && {
      key: "byte",
      href: `/byte/${latestByte.byte_serial}`,
      label: "byte  |",
      text: latestByte.content,
      date: latestByte.created_at,
      shouldTruncate: true,
    },
    latestBlip && {
      key: "blip",
      href: `/blip/${latestBlip.blip_serial}`,
      label: "blip  |",
      text: latestBlip.term,
      date: latestBlip.created_at,
      shouldTruncate: false,
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
