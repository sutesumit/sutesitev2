import { ImageResponse } from 'next/og';

import { getBloqPostBySlug } from '@/lib/bloq';
import { OG_IMAGE_SIZE, OgCard } from '@/lib/metadata/og-image';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const post = getBloqPostBySlug(slug);

  return new ImageResponse(
    <OgCard
      eyebrow="Bloq"
      title={post?.title ?? 'Post Not Found'}
      description={post?.summary ?? 'This bloq post could not be found.'}
      footerLeft="sumitsute.com/bloq"
      footerRight={post?.publishedAt ?? slug}
      accentColor="#2563eb"
      background="linear-gradient(135deg, #f8fafc 0%, #dbeafe 100%)"
      textColor="#0f172a"
      mutedColor="#334155"
    />,
    OG_IMAGE_SIZE
  );
}
