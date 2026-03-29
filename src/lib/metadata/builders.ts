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
  const image = resolveMetadataImage();

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
      images: [
        {
          url: image,
          alt: copy.ogTitle,
        },
      ],
    },
    twitter: {
      card: DEFAULT_TWITTER_CARD,
      title: copy.ogTitle,
      description: copy.ogDescription,
      images: [image],
    },
  };
}

type DetailMetadataInput = {
  title: string;
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
      title: input.title,
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
          alt: input.title,
        },
      ],
    },
    twitter: {
      card: DEFAULT_TWITTER_CARD,
      title: input.title,
      description: input.description,
      images: [image],
    },
  };
}
