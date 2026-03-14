import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getBlipBySerial, getBlips } from '@/lib/blip';
import BlipDetail from './components/BlipDetail';
import TrackView from '../components/TrackView';
import { SITE_URL, SITE_NAME, SITE_AUTHOR } from '@/config/metadata';

export async function generateMetadata({ params }: { params: Promise<{ serial: string }> }): Promise<Metadata> {
  const { serial } = await params;
  const blip = await getBlipBySerial(serial);

  if (!blip) {
    return {
      title: 'Blip Not Found',
    };
  }

  const blipUrl = `${SITE_URL}/blip/${blip.blip_serial}`;
  const description = blip.content.length > 150 
    ? blip.content.substring(0, 147) + '...' 
    : blip.content;

  return {
    title: `blip #${blip.blip_serial}`,
    description,
    alternates: {
      canonical: blipUrl,
    },
    openGraph: {
      title: `blip #${blip.blip_serial}`,
      description,
      url: blipUrl,
      siteName: SITE_NAME,
      type: 'article',
      publishedTime: blip.created_at,
    },
    twitter: {
      card: 'summary_large_image',
      title: `blip #${blip.blip_serial}`,
      description,
    },
  };
}

function SocialMediaPostingJsonLd({ blip }: { blip: NonNullable<Awaited<ReturnType<typeof getBlipBySerial>>> }) {
  const blipUrl = `${SITE_URL}/blip/${blip.blip_serial}`;
  const description = blip.content.length > 150 
    ? blip.content.substring(0, 147) + '...' 
    : blip.content;

  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'SocialMediaPosting',
    headline: `blip #${blip.blip_serial}`,
    description,
    url: blipUrl,
    datePublished: blip.created_at,
    author: {
      '@type': 'Person',
      name: SITE_AUTHOR,
      url: SITE_URL,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': blipUrl,
    },
    publisher: {
      '@type': 'Person',
      name: SITE_AUTHOR,
      url: SITE_URL,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

const BlipPage = async ({ params }: { params: Promise<{ serial: string }> }) => {
  const { serial } = await params;
  const [blip, allBlips] = await Promise.all([
    getBlipBySerial(serial),
    getBlips(),
  ]);

  if (!blip) {
    notFound();
  }

  const currentIndex = allBlips.findIndex(b => b.id === blip.id);
  const newerBlip = currentIndex > 0 ? allBlips[currentIndex - 1] : null;
  const olderBlip = currentIndex >= 0 && currentIndex < allBlips.length - 1 ? allBlips[currentIndex + 1] : null;

  return (
    <div className="container flex flex-col min-h-screen justify-center p-10 font-roboto-mono lowercase">
      <SocialMediaPostingJsonLd blip={blip} />
      <TrackView serial={blip.blip_serial} />
      <BlipDetail blip={blip} newerBlip={newerBlip} olderBlip={olderBlip} />
    </div>
  );
};

export default BlipPage;
