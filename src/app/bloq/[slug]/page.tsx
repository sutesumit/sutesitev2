import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { getBloqPostBySlug, getRelatedPosts } from '@/lib/bloq';
import IntroArt from '@/app/bloq/components/IntroArt';
import BloqCard from '@/app/bloq/components/BloqCard';
import MDXComponents from '@/app/bloq/components/MDXComponents';
import RelatedPosts from '@/app/bloq/components/RelatedPosts';

import SeedingPlant from "@/components/specific/SeedingPlant";
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
        <MDXRemote source={post.content} components={{ ...MDXComponents, IntroArt, SeedingPlant }} />
      </div>
      <div className="px-4">
        <RelatedPosts posts={relatedPosts} />
      </div>
    </article>
  );
}