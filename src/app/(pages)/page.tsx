import type { Metadata } from 'next';

import { HomeContent } from "@/components/home/HomeContent";
import { SITE_URL, pageMetadata } from '@/config/metadata';
import { getRecentPosts } from '@/lib/bloq';
import { getBlips } from '@/lib/blip';
import { getBytes } from '@/lib/byte';

const { home } = pageMetadata;

export const metadata: Metadata = {
  title: home.title,
  description: home.description,
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: home.ogTitle,
    description: home.ogDescription,
  },
  twitter: {
    title: home.ogTitle,
    description: home.ogDescription,
  },
};

export default async function Home() {
  const [latestBloq = null] = getRecentPosts(1);
  const [{ data: bytes }, { data: blips }] = await Promise.all([
    getBytes(1, 1),
    getBlips(1, 1),
  ]);

  return (
    <HomeContent
      latestBloq={latestBloq}
      latestByte={bytes[0] ?? null}
      latestBlip={blips[0] ?? null}
    />
  );
}
