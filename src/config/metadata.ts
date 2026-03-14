export const SITE_URL = 'https://sumitsute.com';
export const SITE_NAME = 'Sumit Sute Personal Dev Page';
export const SITE_AUTHOR = 'Sumit Sute';

export const DEFAULT_OG_IMAGE = '/sumit-sute-homepage.jpg';

export const pageMetadata = {
  home: {
    title: 'home',
    description: "Sumit Sute's personal dev page - projects and writing grounded in engineering approach",
    ogTitle: 'Sumit Sute | Developer',
    ogDescription: 'Personal dev page featuring projects and writing',
  },
  about: {
    title: 'about',
    description: 'About Sumit Sute - journey from mechanical engineering to web development, featuring experience in journalism, photography, and community organizing',
    ogTitle: 'About | Sumit Sute',
    ogDescription: 'Journey from mechanical engineering to web development',
  },
  work: {
    title: 'work',
    description: 'Projects by Sumit Sute - showcasing web development work, experiments, and side projects built with React, Next.js, and modern technologies',
    ogTitle: 'Work | Sumit Sute',
    ogDescription: 'Projects and experiments by Sumit Sute',
  },
  bloq: {
    title: 'blog',
    description: 'Writing by Sumit Sute on web development, engineering principles, and software craftsmanship',
    ogTitle: 'Blog | Sumit Sute',
    ogDescription: 'Writing on web development and engineering',
  },
} as const;

export type PageKey = keyof typeof pageMetadata;
