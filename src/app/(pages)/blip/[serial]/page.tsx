import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { buildDetailMetadata } from '@/lib/metadata/builders';
import { buildBlipSchema, renderJsonLd } from '@/lib/metadata/schema';
import { getAdjacentBlips, getBlipBySerial } from '@/lib/blip';

import BlipDetail from './components/BlipDetail';

export async function generateMetadata({ params }: { params: Promise<{ serial: string }> }): Promise<Metadata> {
  const { serial } = await params;
  const blip = await getBlipBySerial(serial);

  if (!blip) {
    return {
      title: 'Blip Not Found',
    };
  }

  return buildDetailMetadata({
    title: `${blip.term} | blip`,
    socialTitle: `${blip.term} | blip | Sumit Sute`,
    description: blip.meaning,
    path: `/blip/${blip.blip_serial}`,
    ogType: 'article',
    publishedTime: blip.created_at,
    modifiedTime: blip.updated_at,
    generatedImagePath: `/og/blip/${blip.blip_serial}`,
  });
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
      {renderJsonLd(buildBlipSchema(blip))}
      <BlipDetail blip={blip} newerBlip={newerBlip} olderBlip={olderBlip} />
    </div>
  );
};

export default BlipPage;
