import { NextResponse } from 'next/server';

import { liveBloqService } from '@/lib/live-bloq/service';
import { liveSessionToBloqPost } from '@/lib/live-bloq';
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

  const bloqPost = liveSessionToBloqPost(session);

  return createOgImageResponse(
    <LiveOgCard
      title={session.title}
      description={bloqPost.summary}
      status={session.status === 'active' ? 'active' : 'closed'}
      entryCount={session.entry_count}
      footerLeft={`/bloq/live/${slug}`}
      footerRight={session.closed_at?.slice(0, 10) ?? session.started_at.slice(0, 10)}
    />
  );
}
