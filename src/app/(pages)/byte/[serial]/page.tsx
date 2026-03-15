import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getByteBySerial, getAdjacentBytes } from '@/lib/byte';
import ByteDetail from './components/ByteDetail';
import TrackView from '@/components/shared/TrackView';
import { SITE_URL, SITE_NAME, SITE_AUTHOR } from '@/config/metadata';

export async function generateMetadata({ params }: { params: Promise<{ serial: string }> }): Promise<Metadata> {
  const { serial } = await params;
  const byte = await getByteBySerial(serial);

  if (!byte) {
    return {
      title: 'Byte Not Found',
    };
  }

  const byteUrl = `${SITE_URL}/byte/${byte.byte_serial}`;
  const description = byte.content.length > 150 
    ? byte.content.substring(0, 147) + '...' 
    : byte.content;

  return {
    title: `byte #${byte.byte_serial}`,
    description,
    alternates: {
      canonical: byteUrl,
    },
    openGraph: {
      title: `byte #${byte.byte_serial}`,
      description,
      url: byteUrl,
      siteName: SITE_NAME,
      type: 'article',
      publishedTime: byte.created_at,
    },
    twitter: {
      card: 'summary_large_image',
      title: `byte #${byte.byte_serial}`,
      description,
    },
  };
}

function SocialMediaPostingJsonLd({ byte }: { byte: NonNullable<Awaited<ReturnType<typeof getByteBySerial>>> }) {
  const byteUrl = `${SITE_URL}/byte/${byte.byte_serial}`;
  const description = byte.content.length > 150 
    ? byte.content.substring(0, 147) + '...' 
    : byte.content;

  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'SocialMediaPosting',
    headline: `byte #${byte.byte_serial}`,
    description,
    url: byteUrl,
    datePublished: byte.created_at,
    author: {
      '@type': 'Person',
      name: SITE_AUTHOR,
      url: SITE_URL,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': byteUrl,
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

const BytePage = async ({ params }: { params: Promise<{ serial: string }> }) => {
  const { serial } = await params;
  
  const byte = await getByteBySerial(serial);

  if (!byte) {
    notFound();
  }

  // Use optimized adjacent query instead of fetching all bytes
  const serialNumber = parseInt(byte.byte_serial, 10);
  const { newer: newerByte, older: olderByte } = await getAdjacentBytes(serialNumber);

  return (
    <div className="container flex flex-col min-h-screen justify-center p-10 font-roboto-mono lowercase">
      <SocialMediaPostingJsonLd byte={byte} />
      <TrackView type="byte" identifier={byte.byte_serial} />
      <ByteDetail byte={byte} newerByte={newerByte} olderByte={olderByte} />
    </div>
  );
};

export default BytePage;
