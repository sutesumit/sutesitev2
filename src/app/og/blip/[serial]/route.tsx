import { ImageResponse } from 'next/og';

import { getBlipBySerial } from '@/lib/blip';
import { OG_IMAGE_SIZE, OgCard } from '@/lib/metadata/og-image';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ serial: string }> }
) {
  const { serial } = await params;
  const blip = await getBlipBySerial(serial);

  return new ImageResponse(
    <OgCard
      eyebrow="Blip"
      title={blip?.term ?? 'Blip Not Found'}
      description={blip?.meaning ?? 'This blip could not be found.'}
      footerLeft="sumitsute.com/blip"
      footerRight={blip?.blip_serial ?? serial}
      accentColor="#7c3aed"
      background="linear-gradient(135deg, #faf5ff 0%, #ede9fe 100%)"
      textColor="#2e1065"
      mutedColor="#5b21b6"
    />,
    OG_IMAGE_SIZE
  );
}
