import { staticPageMetadata } from '@/config/metadata';
import { BlipIndexOgCard, createOgImageResponse } from '@/lib/metadata/og-image';

export const dynamic = 'force-static';

export async function GET() {
  const copy = staticPageMetadata.blip;

  return createOgImageResponse(
    <BlipIndexOgCard
      title={copy.ogTitle}
      description={copy.description}
      footerLeft={copy.path}
      footerRight="blip"
    />
  );
}
