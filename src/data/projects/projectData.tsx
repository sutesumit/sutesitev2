import type { ProjectProps } from './types';
import { getRoleDetails, getTechDetails } from './helpers';

// TODO: Convert GIF screenshots to MP4/WebM video for ~90% size reduction
// Current GIFs total ~8.6MB - video formats would significantly improve load performance
export const projects: ProjectProps[] = [
    {
        slug: 'art',
        title: 'art.sumitsute.com',
        screenshot: '/project1screenshot.gif',
        roles: getRoleDetails(['End-to-end','Developer', 'UI Designer', 'Writer']),
        description: `A full-stack interactive digital art portfolio and publishing platform built for immersive storytelling experiences.`,
        about: `art.sumitsute.com is my digital art portfolio and publishing platform, built to hold lens-based work, long-form visual narratives, and interactive storytelling experiences in one evolving system. My journey began in documentary photography, working with media, governments, and NGOs, before I moved into photo editing at a leading Indian news organization. Over time, my practice has evolved, deeply rooted in photography and the feminist principle that "the personal is political.". Under the hood, the platform uses modular feature boundaries, typed API routes, Supabase-backed interaction flows, and reusable navigation patterns to support authenticated participation such as likes, comments, profile management, and story submissions as the body of work expands.`,
        livelink: 'https://www.art.sumitsute.com/',
        githublink: 'https://github.com/sutesumit/jaybhim_affirma',
        technologies: getTechDetails(['Next.js', 'React', 'Tailwind CSS', 'Framer Motion', 'Aceternity UI', 'Supabase', 'Radix UI']),
        features: [
            'Multiple route-specific storytelling experiences built beyond a single reusable gallery template',
            'Authenticated workflows for OTP login, persistent sessions, profile management, likes, comments, and story submissions',
            'Modular architecture with metadata-driven navigation, reusable feature modules, and service-layer business logic'
        ]
    },
    {
        slug: 'dramas-of-discrimination',
        title: 'Dramas of Discrimination',
        screenshot: '/project2screenshot.gif',
        roles: getRoleDetails(['End-to-end','Developer', 'UI Designer', 'Writer']),
        description: `An open-source workshop platform built to help communities, educators, and students facilitate Dramas of Discrimination sessions independently.`,
        about: `This open-source web platform is designed to support the independent facilitation of Dramas of Discrimination workshops, fostering dialogue, reflection, and action for more inclusive academic and professional spaces. Developed by the Ambedkar Reading Circle, it serves as a facilitator's guide, a resource repository for workshop materials, and a data portal for case studies and participant-generated charters of demands. Additionally, it contributes to a collective Manifesto of Inclusion, integrating insights rooted in constitutional values to drive systemic change.`,
        livelink: 'https://www.dod.sumitsute.com/',
        githublink: 'https://github.com/sutesumit/dodpage',
        technologies: getTechDetails(['Next.js', 'Tailwind CSS', 'Framer Motion', 'Aceternity UI', 'Vercel']),
        features: [
            'Open-source facilitation platform for communities, educators, and students running Dramas of Discrimination workshops',
            'Content and data portal for workshop materials, case studies, participant-generated charters, and the Manifesto of Inclusion',
            'Responsive reflection-oriented storytelling patterns powered by Tailwind CSS, Framer Motion, and an open GitHub plus Vercel workflow'
        ]
    },
    {
        slug: 'dev-diary',
        title: 'Dev Diary',
        screenshot: '/sumit-sute-homepage.jpg',
        roles: getRoleDetails(['Product Engineer', 'System Designer', 'Writer', 'Publisher']),
        description: `A personal publishing and engineering platform for essays, notes, knowledge capture, and experiments in agentic software systems.`,
        about: `Dev Diary is the system behind sumitsute.com: a personal publishing and engineering platform where I write long-form essays, post short notes, maintain concept entries, and document ongoing software experiments. Behind the scenes, it includes private capture and publishing workflows through a Telegram bot and CLI tools, distribution through a Telegram channel and RSS, and supporting infrastructure like metadata, sitemap generation, analytics, and lightweight interaction systems. The codebase is shaped to stay legible, maintainable, and agent-friendly as the site evolves.`,
        livelink: 'https://sumitsute.com/',
        githublink: 'https://github.com/sutesumit/sutesitev2',
        technologies: getTechDetails([
            'Next.js',
            'React',
            'TypeScript',
            'Tailwind CSS',
            'Supabase',
            'Radix UI',
            'Grammy',
            'Vitest',
            'Playwright',
            'MDX'
        ]),
        features: [
            'Unified publishing system for bloqs, bytes, blips, and project pages',
            'Private content workflows exposed through Telegram and terminal-friendly entry points',
            'Dynamic RSS and sitemap generation from canonical content sources',
            'Per-page metadata and JSON-LD for machine-readable distribution',
            'Supabase-backed views, claps, and short-form publishing flows',
            'Architecture designed for maintainability and agent-assisted development'
        ]
    }
]
