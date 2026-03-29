import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import Link from 'next/link';
import { MdOutlineRssFeed } from 'react-icons/md';
import { FaSitemap } from 'react-icons/fa6';
import { FaTelegram } from 'react-icons/fa';

import TrackView from '@/components/shared/TrackView';
import ClapsCounter from '@/components/shared/ClapsCounter';
import CopyLink from '@/components/shared/CopyLink';
import DitherShader from '@/components/bloq/DitherShaderWrapper';
import DryKeysQuest from '@/components/bloq/DryKeysQuestWrapper';
import { LatestUpdates } from '@/components/home/LatestUpdates';
import MarathiClock from '@/components/bloq/MarathiClockWrapper';
import SeedingPlantASCII from '@/components/bloq/SeedingPlantASCIIWrapper';
import { SeedingPlantWrapped } from '@/components/bloq/SeedingPlantWrappedWrapper';
import SeedingPlant from "@/components/specific/SeedingPlant";
import { SITE_URL } from '@/config/metadata';
import { buildDetailMetadata } from '@/lib/metadata/builders';
import { buildBloqPostSchema, renderJsonLd } from '@/lib/metadata/schema';
import { getBloqPostBySlug, getBloqPosts, getRelatedPosts } from '@/lib/bloq';

import BloqCard from '@/app/(pages)/bloq/components/BloqCard';
import MDXComponents from '@/app/(pages)/bloq/components/MDXComponents';

import BloqViewCounter from '../components/BloqViewCounter';
import RelatedPosts from '../components/RelatedPosts';

export async function generateStaticParams() {
  const posts = getBloqPosts();
  return posts.map((post) => ({
    slug: post.url,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getBloqPostBySlug(slug);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  return buildDetailMetadata({
    title: post.title,
    socialTitle: `${post.title} | Sumit Sute`,
    description: post.summary,
    path: `/bloq/${post.url}`,
    ogType: 'article',
    publishedTime: post.publishedAt,
    modifiedTime: post.updatedAt,
    authors: post.authors.map(() => `${SITE_URL}/about`),
    tags: post.tags,
    image: post.image,
    generatedImagePath: `/og/bloq/${post.url}`,
  });
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getBloqPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = getRelatedPosts(post);

  return (
    <article className="container py-10">
      {renderJsonLd(buildBloqPostSchema(post))}
      <TrackView type="bloq" identifier={slug} />
      <BloqCard post={post} variant="detail" className="sticky backdrop-blur-3xl top-10 z-10" />
      <div className="px-4">
        <MDXRemote source={post.content} components={{ ...MDXComponents, DryKeysQuest, SeedingPlant, DitherShader, SeedingPlantASCII, MarathiClock, SeedingPlantWrapped, LatestUpdates, ClapsCounter, ViewCounter: BloqViewCounter, Link, MdOutlineRssFeed, FaSitemap, FaTelegram, CopyLink }} />
      </div>
      <div className="px-4">
        <RelatedPosts posts={relatedPosts} />
      </div>
    </article>
  );
}
