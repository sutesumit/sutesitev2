import { staticPageMetadata } from '@/config/metadata';
import { createOgImageResponse, WorkIndexOgCard } from '@/lib/metadata/og-image';

export const dynamic = 'force-static';

export async function GET() {
  const copy = staticPageMetadata.work;

  return createOgImageResponse(
    <WorkIndexOgCard
      title={copy.ogTitle}
      description={copy.description}
      footerLeft={copy.path}
      footerRight="work"
    />
  );
}
