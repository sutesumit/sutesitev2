import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import TrackView from '@/components/shared/TrackView';
import { buildDetailMetadata } from '@/lib/metadata/builders';
import { buildByteSchema, renderJsonLd } from '@/lib/metadata/schema';
import { getAdjacentBytes, getByteBySerial } from '@/lib/byte';

import ByteDetail from './components/ByteDetail';

export async function generateMetadata({ params }: { params: Promise<{ serial: string }> }): Promise<Metadata> {
  const { serial } = await params;
  const byte = await getByteBySerial(serial);

  if (!byte) {
    return {
      title: 'Byte Not Found',
    };
  }

  const description = byte.content.length > 150
    ? `${byte.content.substring(0, 147)}...`
    : byte.content;

  return buildDetailMetadata({
    title: `byte #${byte.byte_serial}`,
    socialTitle: `byte #${byte.byte_serial} | Sumit Sute`,
    description,
    path: `/byte/${byte.byte_serial}`,
    ogType: 'article',
    publishedTime: byte.created_at,
    generatedImagePath: `/og/byte/${byte.byte_serial}`,
  });
}

const BytePage = async ({ params }: { params: Promise<{ serial: string }> }) => {
  const { serial } = await params;

  const byte = await getByteBySerial(serial);

  if (!byte) {
    notFound();
  }

  const serialNumber = parseInt(byte.byte_serial, 10);
  const { newer: newerByte, older: olderByte } = await getAdjacentBytes(serialNumber);

  return (
    <div className="container flex flex-col min-h-screen justify-center p-10 font-roboto-mono lowercase">
      {renderJsonLd(buildByteSchema(byte))}
      <TrackView type="byte" identifier={byte.byte_serial} />
      <ByteDetail byte={byte} newerByte={newerByte} olderByte={olderByte} />
    </div>
  );
};

export default BytePage;
