import { notFound } from "next/navigation";
import { cache } from "react";
import { getBloqEngagementIdentity } from "@/lib/content-identity";
import { liveBloqService } from "@/lib/live-bloq/service";
import { liveSessionToBloqPost } from "@/lib/live-bloq";
import { buildBloqPostSchema, renderJsonLd } from "@/lib/metadata/schema";
import TrackView from "@/components/shared/TrackView";
import BloqCard from "@/app/(pages)/bloq/components/BloqCard";
import { LiveBloqFeed } from "./LiveBloqFeed";
import type { Metadata } from "next";

export const revalidate = 60;

const getCachedSession = cache((slug: string) =>
  liveBloqService.getSession(slug),
);

interface LiveBloqPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: LiveBloqPageProps): Promise<Metadata> {
  const { slug } = await params;
  const session = await getCachedSession(slug);
  if (!session) return { title: "Not Found" };

  return {
    title: `${session.title} — Live`,
    description:
      session.summary ?? `${session.entry_count} entries from live session`,
  };
}

export default async function LiveBloqPage({ params }: LiveBloqPageProps) {
  const { slug } = await params;
  const session = await getCachedSession(slug);

  if (!session) {
    notFound();
  }

  const entries = await liveBloqService.getEntries(session.id);
  const bloqPost = liveSessionToBloqPost(session);
  const { type: engagementType, id: engagementId } =
    getBloqEngagementIdentity(bloqPost);

  return (
    <article className="container relative isolate py-10">
      {renderJsonLd(buildBloqPostSchema(bloqPost))}
      <TrackView type={engagementType} identifier={engagementId} />
      <BloqCard
        post={bloqPost}
        variant="detail"
        className="sticky backdrop-blur-3xl top-10 z-10"
      />
      <div className="px-4">
        <LiveBloqFeed session={session} initialEntries={entries} slug={slug} />
      </div>
    </article>
  );
}
