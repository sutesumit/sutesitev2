import { staticPageMetadata } from '@/config/metadata';
import { AboutOgCard, createOgImageResponse } from '@/lib/metadata/og-image';

export const dynamic = 'force-static';

export async function GET() {
  const copy = staticPageMetadata.about;

  return createOgImageResponse(
    <AboutOgCard
      title={copy.ogTitle}
      description={copy.description}
      footerLeft={copy.path}
      footerRight="about"
    />
  );
}
