import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { getBloqPostBySlug, getRelatedPosts } from '@/lib/bloq';
import IntroArt from '@/app/bloq/components/IntroArt';
import BloqCard from '@/app/bloq/components/BloqCard';
import MDXComponents from '@/app/bloq/components/MDXComponents';
import RelatedPosts from '@/app/bloq/components/RelatedPosts';

import SeedingPlant from "@/components/specific/SeedingPlant";
import SeedingPlantASCII from "@/content/bloqs/2026/2026-02-18-vibe-shift-hackathon/SeedingPlantASCII";
import MarathiClock from "@/content/bloqs/2026/2026-02-18-vibe-shift-hackathon/MarathiClock";
import { SeedingPlantWrapped } from '@/content/bloqs/2025/2025-12-12-sharing-intro-art-component/SeedingPlantWrapped';
import TrackView from '../components/TrackView';

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getBloqPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = getRelatedPosts(post);

  return (
    <article className="container py-10">
      <TrackView slug={slug} />
      <BloqCard post={post} variant="detail" className="sticky backdrop-blur-3xl top-10 z-10" />
      <div className="px-4">
        <MDXRemote source={post.content} components={{ ...MDXComponents, IntroArt, SeedingPlant, SeedingPlantASCII, MarathiClock, SeedingPlantWrapped }} />
      </div>
      <div className="px-4">
        <RelatedPosts posts={relatedPosts} />
      </div>
    </article>
  );
}