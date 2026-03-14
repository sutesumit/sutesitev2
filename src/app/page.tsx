import type { Metadata } from 'next';
import { HomeContent } from "@/components/home/HomeContent";
import { SITE_URL, pageMetadata } from '@/config/metadata';

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

export default function Home() {
  return <HomeContent />;
}
