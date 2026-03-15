import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { MDXRemote } from 'next-mdx-remote/rsc';
import Link from 'next/link';
import { getBloqPostBySlug, getBloqPosts, getRelatedPosts } from '@/lib/bloq';
import BloqCard from '@/app/(pages)/bloq/components/BloqCard';
import MDXComponents from '@/app/(pages)/bloq/components/MDXComponents';
import RelatedPosts from '@/app/(pages)/bloq/components/RelatedPosts';
import SeedingPlant from "@/components/specific/SeedingPlant";
import ClapsCounter from '@/components/shared/ClapsCounter';
import BloqViewCounter from '../components/BloqViewCounter';
import TrackView from '@/components/shared/TrackView';
import { MdOutlineRssFeed } from 'react-icons/md';
import CopyLink from '@/components/shared/CopyLink';
import DryKeysQuest from '@/components/bloq/DryKeysQuestWrapper';
import DitherShader from '@/components/bloq/DitherShaderWrapper';
import SeedingPlantASCII from '@/components/bloq/SeedingPlantASCIIWrapper';
import MarathiClock from '@/components/bloq/MarathiClockWrapper';
import { SeedingPlantWrapped } from '@/components/bloq/SeedingPlantWrappedWrapper';

const SITE_URL = 'https://sumitsute.com';

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

  const postUrl = `${SITE_URL}/bloq/${post.url}`;

  const baseMetadata: Metadata = {
    title: post.title,
    description: post.summary,
    alternates: {
      canonical: postUrl,
    },
    openGraph: {
      title: post.title,
      description: post.summary,
      url: postUrl,
      siteName: 'Sumit Sute Personal Dev Page',
      type: 'article',
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: post.authors.map(() => `${SITE_URL}/about`),
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.summary,
    },
  };

  if (post.image) {
    const imageUrl = `${SITE_URL}${post.image}`;
    baseMetadata.openGraph = {
      ...baseMetadata.openGraph,
      images: [{ url: imageUrl, width: 800, height: 600, alt: post.title }],
    };
    baseMetadata.twitter = {
      ...baseMetadata.twitter,
      images: [imageUrl],
    };
  }

  return baseMetadata;
}

function BlogPostingJsonLd({ post }: { post: ReturnType<typeof getBloqPostBySlug> & NonNullable<ReturnType<typeof getBloqPostBySlug>> }) {
  const postUrl = `${SITE_URL}/bloq/${post.url}`;

  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.summary,
    url: postUrl,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    author: {
      '@type': 'Person',
      name: post.authors[0] || 'Sumit Sute',
      url: SITE_URL,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': postUrl,
    },
    keywords: post.tags.join(', '),
    publisher: {
      '@type': 'Person',
      name: 'Sumit Sute',
      url: SITE_URL,
    },
  };

  if (post.image) {
    jsonLd.image = `${SITE_URL}${post.image}`;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
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
      <BlogPostingJsonLd post={post} />
      <TrackView type="bloq" identifier={slug} />
      <BloqCard post={post} variant="detail" className="sticky backdrop-blur-3xl top-10 z-10" />
      <div className="px-4">
        <MDXRemote source={post.content} components={{ ...MDXComponents, DryKeysQuest, SeedingPlant, DitherShader, SeedingPlantASCII, MarathiClock, SeedingPlantWrapped, ClapsCounter, ViewCounter: BloqViewCounter, Link, MdOutlineRssFeed, CopyLink }} />
      </div>
      <div className="px-4">
        <RelatedPosts posts={relatedPosts} />
      </div>
    </article>
  );
}