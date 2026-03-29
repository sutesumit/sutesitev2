import { staticPageMetadata } from '@/config/metadata';
import { BloqIndexOgCard, createOgImageResponse } from '@/lib/metadata/og-image';

export const dynamic = 'force-static';

export async function GET() {
  const copy = staticPageMetadata.bloq;

  return createOgImageResponse(
    <BloqIndexOgCard
      title={copy.ogTitle}
      description={copy.description}
      footerLeft={copy.path}
      footerRight="bloq"
    />
  );
}
