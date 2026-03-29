import type { ReactElement } from 'react';

import { SITE_AUTHOR, SITE_DESCRIPTION, SITE_NAME, SITE_URL, staticPageMetadata } from '@/config/metadata';
import { buildCanonicalUrl } from '@/lib/metadata/builders';
import type { BloqPost } from '@/lib/bloq';
import type { ProjectProps } from '@/data/projects/types';
import type { Byte } from '@/types/byte';
import type { Blip } from '@/types/blip';

type JsonLdValue = Record<string, unknown>;

export function renderJsonLd(data: JsonLdValue): ReactElement {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function buildHomeSchema(): JsonLdValue {
  const copy = staticPageMetadata.home;

  return {
    '@context': 'https://schema.org',
    '@type': copy.schemaKind,
    name: copy.ogTitle,
    description: copy.description,
    url: buildCanonicalUrl(copy.path),
    isPartOf: {
      '@type': 'WebSite',
      name: SITE_NAME,
      url: SITE_URL,
    },
    about: {
      '@type': 'Person',
      name: SITE_AUTHOR,
      url: SITE_URL,
    },
  };
}

export function buildAboutSchema(): JsonLdValue {
  return {
    '@context': 'https://schema.org',
    '@type': staticPageMetadata.about.schemaKind,
    mainEntity: {
      '@type': 'Person',
      name: SITE_AUTHOR,
      url: SITE_URL,
      jobTitle: 'Software Engineer',
      knowsAbout: ['Web Development', 'TypeScript', 'React', 'Next.js', 'System Design'],
      sameAs: [],
    },
  };
}

export function buildWorkIndexSchema(projects: ProjectProps[]): JsonLdValue {
  return {
    '@context': 'https://schema.org',
    '@type': staticPageMetadata.work.schemaKind,
    name: 'Projects by Sumit Sute',
    description: staticPageMetadata.work.description,
    numberOfItems: projects.length,
    itemListElement: projects.map((project, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: buildCanonicalUrl(`/work/${project.slug}`),
      name: project.title,
    })),
  };
}

export function buildBloqIndexSchema(posts: BloqPost[]): JsonLdValue {
  return {
    '@context': 'https://schema.org',
    '@type': staticPageMetadata.bloq.schemaKind,
    name: staticPageMetadata.bloq.ogTitle,
    description: staticPageMetadata.bloq.description,
    url: buildCanonicalUrl(staticPageMetadata.bloq.path),
    author: {
      '@type': 'Person',
      name: SITE_AUTHOR,
      url: SITE_URL,
    },
    blogPost: posts.slice(0, 10).map((post) => ({
      '@type': 'BlogPosting',
      headline: post.title,
      url: buildCanonicalUrl(`/bloq/${post.url}`),
      datePublished: post.publishedAt,
      dateModified: post.updatedAt || post.publishedAt,
      description: post.summary,
    })),
  };
}

export function buildByteIndexSchema(): JsonLdValue {
  return {
    '@context': 'https://schema.org',
    '@type': staticPageMetadata.byte.schemaKind,
    name: staticPageMetadata.byte.ogTitle,
    description: staticPageMetadata.byte.description,
    url: buildCanonicalUrl(staticPageMetadata.byte.path),
    isPartOf: {
      '@type': 'WebSite',
      name: SITE_NAME,
      url: SITE_URL,
    },
    author: {
      '@type': 'Person',
      name: SITE_AUTHOR,
      url: SITE_URL,
    },
  };
}

export function buildBlipIndexSchema(): JsonLdValue {
  return {
    '@context': 'https://schema.org',
    '@type': staticPageMetadata.blip.schemaKind,
    name: 'Blip Dictionary',
    description: staticPageMetadata.blip.description,
    url: buildCanonicalUrl(staticPageMetadata.blip.path),
    author: {
      '@type': 'Person',
      name: SITE_AUTHOR,
      url: SITE_URL,
    },
  };
}

export function buildBloqPostSchema(post: BloqPost): JsonLdValue {
  const postUrl = buildCanonicalUrl(`/bloq/${post.url}`);

  const jsonLd: JsonLdValue = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.summary,
    url: postUrl,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    author: {
      '@type': 'Person',
      name: post.authors[0] || SITE_AUTHOR,
      url: SITE_URL,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': postUrl,
    },
    keywords: post.tags.join(', '),
    publisher: {
      '@type': 'Person',
      name: SITE_AUTHOR,
      url: SITE_URL,
    },
  };

  if (post.image) {
    jsonLd.image = buildCanonicalUrl(post.image);
  }

  return jsonLd;
}

export function buildProjectSchema(project: ProjectProps): JsonLdValue {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareSourceCode',
    name: project.title,
    description: project.description,
    url: buildCanonicalUrl(`/work/${project.slug}`),
    author: {
      '@type': 'Person',
      name: SITE_AUTHOR,
      url: SITE_URL,
    },
  };
}

export function buildByteSchema(byte: Byte): JsonLdValue {
  const byteUrl = buildCanonicalUrl(`/byte/${byte.byte_serial}`);
  const description = byte.content.length > 150
    ? `${byte.content.substring(0, 147)}...`
    : byte.content;

  return {
    '@context': 'https://schema.org',
    '@type': 'SocialMediaPosting',
    headline: `byte #${byte.byte_serial}`,
    description,
    url: byteUrl,
    datePublished: byte.created_at,
    author: {
      '@type': 'Person',
      name: SITE_AUTHOR,
      url: SITE_URL,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': byteUrl,
    },
    publisher: {
      '@type': 'Person',
      name: SITE_AUTHOR,
      url: SITE_URL,
    },
  };
}

export function buildBlipSchema(blip: Blip): JsonLdValue {
  const jsonLd: JsonLdValue = {
    '@context': 'https://schema.org',
    '@type': 'DefinedTerm',
    name: blip.term,
    description: blip.meaning,
    url: buildCanonicalUrl(`/blip/${blip.blip_serial}`),
    inDefinedTermSet: {
      '@type': 'DefinedTermSet',
      name: 'Blip Dictionary',
      url: buildCanonicalUrl(staticPageMetadata.blip.path),
    },
  };

  if (blip.tags.length > 0) {
    jsonLd.keywords = blip.tags.join(', ');
  }

  return jsonLd;
}

export function buildWebsiteSchema(): JsonLdValue {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    author: {
      '@type': 'Person',
      name: SITE_AUTHOR,
      url: SITE_URL,
    },
  };
}

export function buildPersonSchema(): JsonLdValue {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: SITE_AUTHOR,
    url: SITE_URL,
    sameAs: [],
    jobTitle: 'Software Engineer',
    knowsAbout: ['Web Development', 'TypeScript', 'React', 'Next.js', 'System Design'],
  };
}
