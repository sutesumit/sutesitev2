import type { Metadata } from 'next';

import {
  DEFAULT_OG_IMAGE,
  DEFAULT_TWITTER_CARD,
  SITE_NAME,
  SITE_URL,
  staticPageMetadata,
  type StaticPageKey,
} from '@/config/metadata';

export function buildCanonicalUrl(path: string): string {
  if (path === '/') {
    return SITE_URL;
  }

  return `${SITE_URL}${path}`;
}

export function resolveMetadataImage(image?: string): string {
  return image ?? DEFAULT_OG_IMAGE;
}

export function buildStaticMetadata(page: StaticPageKey): Metadata {
  const copy = staticPageMetadata[page];
  const canonical = buildCanonicalUrl(copy.path);
  const image = copy.imagePolicy === 'generated' && copy.generatedImagePath
    ? buildCanonicalUrl(copy.generatedImagePath)
    : null;

  return {
    title: copy.title,
    description: copy.description,
    alternates: {
      canonical,
    },
    openGraph: {
      title: copy.ogTitle,
      description: copy.ogDescription,
      url: canonical,
      siteName: SITE_NAME,
      type: copy.ogType,
      ...(image && {
        images: [
          {
            url: image,
            alt: copy.ogTitle,
          },
        ],
      }),
    },
    twitter: {
      card: image ? DEFAULT_TWITTER_CARD : 'summary',
      title: copy.ogTitle,
      description: copy.ogDescription,
      ...(image && { images: [image] }),
    },
  };
}

type DetailMetadataInput = {
  title: string;
  socialTitle?: string;
  description: string;
  path: string;
  ogType?: 'website' | 'article' | 'profile';
  image?: string;
  generatedImagePath?: string;
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  tags?: string[];
};

export function buildDetailMetadata(input: DetailMetadataInput): Metadata {
  const canonical = buildCanonicalUrl(input.path);
  const socialTitle = input.socialTitle ?? input.title;
  const image = input.image
    ? resolveMetadataImage(input.image)
    : input.generatedImagePath
      ? buildCanonicalUrl(input.generatedImagePath)
      : resolveMetadataImage();

  return {
    title: input.title,
    description: input.description,
    alternates: {
      canonical,
    },
    openGraph: {
      title: socialTitle,
      description: input.description,
      url: canonical,
      siteName: SITE_NAME,
      type: input.ogType ?? 'article',
      publishedTime: input.publishedTime,
      modifiedTime: input.modifiedTime,
      authors: input.authors,
      tags: input.tags,
      images: [
        {
          url: image,
          alt: socialTitle,
        },
      ],
    },
    twitter: {
      card: DEFAULT_TWITTER_CARD,
      title: socialTitle,
      description: input.description,
      images: [image],
    },
  };
}
