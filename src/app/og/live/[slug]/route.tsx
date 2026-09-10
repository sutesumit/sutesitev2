import { NextResponse } from 'next/server';

import { liveBloqService } from '@/lib/live-bloq/service';
import { LiveOgCard, createOgImageResponse } from '@/lib/metadata/og-image';

export const revalidate = 60;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const session = await liveBloqService.getSession(slug);

  if (!session) {
    return new NextResponse('Not Found', { status: 404 });
  }

  return createOgImageResponse(
    <LiveOgCard
      title={session.title}
      description={session.summary ?? 'Live session in progress'}
      footerLeft={`/bloq/live/${slug}`}
      footerRight={session.started_at.slice(0, 10)}
    />
  );
}
