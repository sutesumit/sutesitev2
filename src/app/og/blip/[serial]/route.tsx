import { getBlipBySerial } from '@/lib/blip';
import { BlipOgCard, createOgImageResponse } from '@/lib/metadata/og-image';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ serial: string }> }
) {
  const { serial } = await params;
  const blip = await getBlipBySerial(serial);

  return createOgImageResponse(
    <BlipOgCard
      title={blip?.term ?? 'Blip Not Found'}
      description={blip?.meaning ?? 'This blip could not be found.'}
      footerLeft={`/blip/${blip?.blip_serial ?? serial}`}
      footerRight={blip?.blip_serial ?? serial}
    />
  );
}
