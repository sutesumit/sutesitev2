import { getBloqPostBySlug } from '@/lib/bloq';
import { ArticleOgCard, createOgImageResponse } from '@/lib/metadata/og-image';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const post = getBloqPostBySlug(slug);

  return createOgImageResponse(
    <ArticleOgCard
      title={post?.title ?? 'Post Not Found'}
      description={post?.summary ?? 'This bloq post could not be found.'}
      footerLeft={`/bloq/${post?.url ?? slug}`}
      footerRight={post?.publishedAt ?? slug}
    />
  );
}
