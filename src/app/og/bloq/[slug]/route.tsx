import { NextResponse } from 'next/server';

import { getBloqPostBySlug, getBloqPosts } from '@/lib/bloq';
import { ArticleOgCard, createOgImageResponse } from '@/lib/metadata/og-image';

export const dynamic = 'force-static';
export const dynamicParams = false;

export async function generateStaticParams() {
  return getBloqPosts().map((post) => ({ slug: post.url }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const post = getBloqPostBySlug(slug);

  if (!post) {
    return new NextResponse('Not Found', { status: 404 });
  }

  return createOgImageResponse(
    <ArticleOgCard
      title={post.title}
      description={post.summary}
      footerLeft={`/bloq/${post.url}`}
      footerRight={post.publishedAt}
    />
  );
}
