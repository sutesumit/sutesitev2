export const SITE_URL = 'https://sumitsute.com';
export const SITE_NAME = 'Sumit Sute\'s Personal Dev Page';
export const SITE_AUTHOR = 'Sumit Sute';
export const SITE_DESCRIPTION = "Sumit Sute's personal dev page - exploring agentic engineering, autonomous systems, and AI-driven development, grounded in simplicity, clear boundaries, and long-term maintainability.";
export const SITE_OG_DESCRIPTION = 'Projects and writing on agentic engineering, web development, software craftsmanship, and building systems that evolve | from Sumit Sute.';
export const DEFAULT_OG_IMAGE = '/sumit-sute-homepage.jpg';
export const DEFAULT_TWITTER_CARD = 'summary_large_image' as const;

export const STATIC_SITEMAP_LAST_MODIFIED = '2026-03-28T00:00:00.000Z';
export const PROJECTS_SITEMAP_LAST_MODIFIED = '2026-03-28T00:00:00.000Z';

export type StaticSchemaKind =
  | 'WebPage'
  | 'ProfilePage'
  | 'ItemList'
  | 'Blog'
  | 'CollectionPage'
  | 'DefinedTermSet';

export type StaticPageKey = 'home' | 'about' | 'work' | 'bloq' | 'byte' | 'blip';

export const staticPageMetadata = {
  home: {
    path: '/',
    title: 'sumit sute',
    description: "A personal dev page - projects and writing grounded in engineering approach",
    ogTitle: 'Sumit Sute | Software Engineer',
    ogDescription: 'Personal dev page featuring projects and writing',
    ogType: 'website' as const,
    schemaKind: 'WebPage' as const,
    imagePolicy: 'generated' as const,
    generatedImagePath: '/og/static/home',
    ogGeneration: 'static' as const,
  },
  about: {
    path: '/about',
    title: 'about',
    description: 'About Sumit Sute - journey from mechanical engineering to web development, via experience in journalism, photography, games for policy, and community organizing',
    ogTitle: 'About | Sumit Sute',
    ogDescription: 'Journey from journalism to web development',
    ogType: 'profile' as const,
    schemaKind: 'ProfilePage' as const,
    imagePolicy: 'generated' as const,
    generatedImagePath: '/og/static/about',
    ogGeneration: 'static' as const,
  },
  work: {
    path: '/work',
    title: 'work',
    description: 'Projects by Sumit Sute - showcasing web development work, experiments, and side projects built with React, Next.js, and modern technologies',
    ogTitle: 'Work | Sumit Sute',
    ogDescription: 'Projects and experiments by Sumit Sute',
    ogType: 'website' as const,
    schemaKind: 'ItemList' as const,
    imagePolicy: 'generated' as const,
    generatedImagePath: '/og/static/work',
    ogGeneration: 'static' as const,
  },
  bloq: {
    path: '/bloq',
    title: 'blog',
    description: 'Writing by Sumit Sute on agentic engineering, engineering principles, and software craftsmanship',
    ogTitle: 'Blog | Sumit Sute',
    ogDescription: 'Writing on agentic engineering and software development',
    ogType: 'website' as const,
    schemaKind: 'Blog' as const,
    imagePolicy: 'generated' as const,
    generatedImagePath: '/og/static/bloq',
    ogGeneration: 'static' as const,
  },
  byte: {
    path: '/byte',
    title: 'byte',
    description: 'short thoughts, updates, and quick notes from sumit sute',
    ogTitle: 'byte | sumit sute',
    ogDescription: 'short thoughts, updates, and quick notes from sumit sute',
    ogType: 'website' as const,
    schemaKind: 'CollectionPage' as const,
    imagePolicy: 'generated' as const,
    generatedImagePath: '/og/static/byte',
    ogGeneration: 'static' as const,
  },
  blip: {
    path: '/blip',
    title: 'blip',
    description: 'a collection of terms and definitions from sumit sute',
    ogTitle: 'blip | sumit sute',
    ogDescription: 'a collection of terms and definitions from sumit sute',
    ogType: 'website' as const,
    schemaKind: 'DefinedTermSet' as const,
    imagePolicy: 'generated' as const,
    generatedImagePath: '/og/static/blip',
    ogGeneration: 'static' as const,
  },
} as const satisfies Record<
  StaticPageKey,
  {
    path: string;
    title: string;
    description: string;
    ogTitle: string;
    ogDescription: string;
    ogType: 'website' | 'article' | 'profile';
    schemaKind: StaticSchemaKind;
    imagePolicy: 'generated' | 'none';
    generatedImagePath?: string;
    ogGeneration: 'static';
  }
>;
