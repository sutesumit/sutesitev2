import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getBlipBySerial, getBlips } from '@/lib/glossary';
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
    title: `${blip.term} | blip glossary`,
    description: blip.meaning,
    alternates: {
      canonical: blipUrl,
    },
    openGraph: {
      title: `${blip.term} | blip glossary`,
      description: blip.meaning,
      url: blipUrl,
      siteName: SITE_NAME,
      type: 'article',
      publishedTime: blip.created_at,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${blip.term} | blip glossary`,
      description: blip.meaning,
    },
  };
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
      <BlipDetail blip={blip} newerBlip={newerBlip} olderBlip={olderBlip} />
    </div>
  );
};

export default BlipPage;
