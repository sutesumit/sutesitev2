import { staticPageMetadata } from '@/config/metadata';
import { createOgImageResponse, HomeOgCard } from '@/lib/metadata/og-image';

export const dynamic = 'force-static';

export async function GET() {
  const copy = staticPageMetadata.home;

  return createOgImageResponse(
    <HomeOgCard
      title={copy.ogTitle}
      description={copy.description}
      footerLeft={copy.path}
      footerRight="home"
    />
  );
}
