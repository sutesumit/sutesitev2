
export interface ProjectProps {
    title: string;
    locallink: string;
    roles: string[]; // Assuming getRoleDetails returns an array of RoleDetails
    description: string;
    about: string;
    livelink: string;
    githublink: string;
    technologies: string[]; // Assuming getTechDetails returns an array of TechDetails
    features: string[];
  }
  

export const projects: ProjectProps[] = [
    {
        title: 'art.sumitsute.com',
        locallink: '/work/art',
        roles: ['End-to-end','Developer', 'UI Designer', 'Writer'],
        description: 'An interactive Next.js portfolio of Sumit Sute’s photographic art.',
        about: 'art.sumitsute.com is my portfolio website, showcasing my lens-based artistic practice over the past few years. My journey began in documentary photography, working with media, governments, and NGOs, before I moved into photo editing at a leading Indian news organization. Over time, my practice has evolved, deeply rooted in photography and the feminist principle that "the personal is political." This website, carefully built with web technologies, is an invitation to reflect, engage, and respond to my work.',
        livelink: 'https://www.art.sumitsute.com/',
        githublink: 'https://github.com/sutesumit/jaybhim_affirma',
        technologies: ['Next.js', 'Tailwind', 'Motion', 'Aceternity UI'],
        features: ['Feature 1', 'Feature 2', 'Feature 3']
    },
    {
        title: 'Dramas of Discrimination',
        locallink: '/work/dramas-of-discrimination',
        roles: ['End-to-end','Developer', 'UI Designer', 'Writer'],
        description: 'An open-source Next.js tool for Dramas of Discrimination workshops, enabling communities and students to foster inclusive academic and professional spaces.',
        about: 'This open-source web platform is designed to support the independent facilitation of Dramas of Discrimination workshops, fostering dialogue, reflection, and action for more inclusive academic and professional spaces. Developed by the Ambedkar Reading Circle, it serves as a facilitator’s guide, a resource repository for workshop materials, and a data portal for case studies and participant-generated charters of demands. Additionally, it contributes to a collective Manifesto of Inclusion, integrating insights rooted in constitutional values to drive systemic change.',
        livelink: 'https://www.dod.sumitsute.com/',
        githublink: 'https://github.com/sutesumit/dodpage',
        technologies: ['Next.js', 'Tailwind', 'Motion', 'Aceternity UI'],
        features: ['Feature 1', 'Feature 2', 'Feature 3']
    }
]