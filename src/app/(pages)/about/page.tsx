import type { Metadata } from 'next';
import { AboutContent } from "./components/AboutContent";
import { SITE_URL, pageMetadata } from '@/config/metadata';

const { about } = pageMetadata;

export const metadata: Metadata = {
  title: about.title,
  description: about.description,
  alternates: { canonical: `${SITE_URL}/about` },
  openGraph: {
    title: about.ogTitle,
    description: about.ogDescription,
  },
  twitter: {
    title: about.ogTitle,
    description: about.ogDescription,
  },
};

export default function About() {
  return <AboutContent />;
}
