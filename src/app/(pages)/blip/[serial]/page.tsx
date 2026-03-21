import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getBlipBySerial, getAdjacentBlips } from '@/lib/blip';
import BlipDetail from './components/BlipDetail';
import { SITE_URL, SITE_NAME } from '@/config/metadata';

export async function generateMetadata({ params }: { params: Promise<{ serial: string }> }): Promise<Metadata> {
  const { serial } = await params;
  const blip = await getBlipBySerial(serial);

  if (!blip) {
    return {
      title: 'Blip Not Found',
    };
  }

  const blipUrl = `${SITE_URL}/blip/${blip.blip_serial}`;

  return {
    title: `${blip.term} | blip`,
    description: blip.meaning,
    alternates: {
      canonical: blipUrl,
    },
    openGraph: {
      title: `${blip.term} | blip`,
      description: blip.meaning,
      url: blipUrl,
      siteName: SITE_NAME,
      type: 'article',
      publishedTime: blip.created_at,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${blip.term} | blip`,
      description: blip.meaning,
    },
  };
}

function DefinedTermJsonLd({ blip }: { blip: NonNullable<Awaited<ReturnType<typeof getBlipBySerial>>> }) {
  const blipUrl = `${SITE_URL}/blip/${blip.blip_serial}`;

  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'DefinedTerm',
    name: blip.term,
    description: blip.meaning,
    url: blipUrl,
    inDefinedTermSet: {
      '@type': 'DefinedTermSet',
      name: 'Blip Dictionary',
      url: `${SITE_URL}/blip`,
    },
  };

  if (blip.tags && blip.tags.length > 0) {
    jsonLd.keywords = blip.tags.join(', ');
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

const BlipPage = async ({ params }: { params: Promise<{ serial: string }> }) => {
  const { serial } = await params;
  
  const blip = await getBlipBySerial(serial);

  if (!blip) {
    notFound();
  }

  const serialNumber = parseInt(blip.blip_serial, 10);
  const { newer: newerBlip, older: olderBlip } = await getAdjacentBlips(serialNumber);

  return (
    <div className="container flex flex-col min-h-screen justify-center p-10 font-roboto-mono lowercase">
      <DefinedTermJsonLd blip={blip} />
      <BlipDetail blip={blip} newerBlip={newerBlip} olderBlip={olderBlip} />
    </div>
  );
};

export default BlipPage;
