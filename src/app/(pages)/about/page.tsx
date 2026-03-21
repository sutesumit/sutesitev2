import type { Metadata } from 'next';
import { AboutContent } from "./components/AboutContent";
import { SITE_URL, SITE_NAME, SITE_AUTHOR, pageMetadata } from '@/config/metadata';

const { about } = pageMetadata;

export const metadata: Metadata = {
  title: about.title,
  description: about.description,
  alternates: { canonical: `${SITE_URL}/about` },
  openGraph: {
    title: about.ogTitle,
    description: about.ogDescription,
    url: `${SITE_URL}/about`,
    siteName: SITE_NAME,
    type: 'profile',
  },
  twitter: {
    card: 'summary_large_image',
    title: about.ogTitle,
    description: about.ogDescription,
  },
};

function ProfilePageJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    mainEntity: {
      '@type': 'Person',
      name: SITE_AUTHOR,
      url: SITE_URL,
      jobTitle: 'Software Engineer',
      knowsAbout: ['Web Development', 'TypeScript', 'React', 'Next.js', 'System Design'],
      sameAs: [],
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default function About() {
  return (
    <>
      <ProfilePageJsonLd />
      <AboutContent />
    </>
  );
}
