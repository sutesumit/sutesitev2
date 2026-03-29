import { getByteBySerial } from '@/lib/byte';
import { ByteOgCard, createOgImageResponse } from '@/lib/metadata/og-image';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ serial: string }> }
) {
  const { serial } = await params;
  const byte = await getByteBySerial(serial);
  const description = byte?.content ?? 'This byte could not be found.';

  return createOgImageResponse(
    <ByteOgCard
      title={byte ? `byte #${byte.byte_serial}` : 'Byte Not Found'}
      description={description}
      footerLeft={`/byte/${byte?.byte_serial ?? serial}`}
      footerRight={byte?.created_at.slice(0, 10) ?? serial}
    />
  );
}
