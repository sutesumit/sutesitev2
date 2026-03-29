import { ImageResponse } from 'next/og';

import { getByteBySerial } from '@/lib/byte';
import { OG_IMAGE_SIZE, OgCard } from '@/lib/metadata/og-image';

export const alt = 'Byte preview image';
export const size = OG_IMAGE_SIZE;
export const contentType = 'image/png';

export default async function Image({
  params,
}: {
  params: Promise<{ serial: string }>;
}) {
  const { serial } = await params;
  const byte = await getByteBySerial(serial);
  const description = byte
    ? byte.content
    : 'This byte could not be found.';

  return new ImageResponse(
    <OgCard
      eyebrow="Byte"
      title={byte ? `byte #${byte.byte_serial}` : 'Byte Not Found'}
      description={description}
      footerLeft="sumitsute.com/byte"
      footerRight={byte?.created_at.slice(0, 10) ?? serial}
      accentColor="#0f766e"
      background="linear-gradient(135deg, #ecfeff 0%, #ccfbf1 100%)"
      textColor="#042f2e"
      mutedColor="#115e59"
    />,
    size
  );
}
