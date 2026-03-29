import { staticPageMetadata } from '@/config/metadata';
import { ByteIndexOgCard, createOgImageResponse } from '@/lib/metadata/og-image';

export const dynamic = 'force-static';

export async function GET() {
  const copy = staticPageMetadata.byte;

  return createOgImageResponse(
    <ByteIndexOgCard
      title={copy.ogTitle}
      description={copy.description}
      footerLeft={copy.path}
      footerRight="byte"
    />
  );
}
