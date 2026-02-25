import { ReactNode } from "react";
import { skillList } from "./skilllist";
import { BiTerminal } from 'react-icons/bi';
import { GiSwissArmyKnife } from 'react-icons/gi';
import { LiaBezierCurveSolid } from 'react-icons/lia';
import { LuTextCursorInput } from 'react-icons/lu';

const roles = [
    { name: 'End-to-end', icon: <GiSwissArmyKnife /> },
    { name: 'Developer', icon: <BiTerminal /> },
    { name: 'UI Designer', icon: <LiaBezierCurveSolid /> },
    { name: 'Writer', icon: <LuTextCursorInput /> },
];

const getRoleDetails = (roleNames: string[]) => {
    return roleNames.map((role) => {
        const found = roles.find((item) => item.name === role);
        return found || { name: role, icon: null };
    });
}

const getTechDetails = (techNames: string[]) => {
    return techNames.map((tech) => {
        const found = Object.values(skillList).flat().find((item) => item.name === tech);
        return found || { name: tech, icon: null };
    });
}

export interface RoleDetails {
    name: string;
    icon: ReactNode | null;
}

export interface TechDetails {
    name: string
    icon: ReactNode | null;
}

export interface ProjectProps {
    slug: string;
    title: string;
    screenshot?: string;
    roles: RoleDetails[];
    description: string;
    about: string;
    livelink: string;
    githublink: string;
    technologies: TechDetails[];
    features: string[];
  }
  

export const projects: ProjectProps[] = [
    {
        slug: 'art',
        title: 'art.sumitsute.com',
        screenshot: '/project1screenshot.gif',
        roles: getRoleDetails(['End-to-end','Developer', 'UI Designer', 'Writer']),
        description: 'An interactive Next.js portfolio of Sumit Sute’s photographic art.',
        about: 'art.sumitsute.com is my portfolio website, showcasing my lens-based artistic practice over the past few years. My journey began in documentary photography, working with media, governments, and NGOs, before I moved into photo editing at a leading Indian news organization. Over time, my practice has evolved, deeply rooted in photography and the feminist principle that "the personal is political." This website, carefully built with web technologies, is an invitation to reflect, engage, and respond to my work.',
        livelink: 'https://www.art.sumitsute.com/',
        githublink: 'https://github.com/sutesumit/jaybhim_affirma',
        technologies: getTechDetails(['Next.js', 'Tailwind', 'Motion', 'Aceternity UI']),
        features: ['Feature 1', 'Feature 2', 'Feature 3']
    },
    {
        slug: 'dramas-of-discrimination',
        title: 'Dramas of Discrimination',
        screenshot: '/project2screenshot.gif',
        roles: getRoleDetails(['End-to-end','Developer', 'UI Designer', 'Writer']),
        description: 'An open-source Next.js tool for Dramas of Discrimination workshops, enabling communities and students to foster inclusive academic and professional spaces.',
        about: 'This open-source web platform is designed to support the independent facilitation of Dramas of Discrimination workshops, fostering dialogue, reflection, and action for more inclusive academic and professional spaces. Developed by the Ambedkar Reading Circle, it serves as a facilitator’s guide, a resource repository for workshop materials, and a data portal for case studies and participant-generated charters of demands. Additionally, it contributes to a collective Manifesto of Inclusion, integrating insights rooted in constitutional values to drive systemic change.',
        livelink: 'https://www.dod.sumitsute.com/',
        githublink: 'https://github.com/sutesumit/dodpage',
        technologies: getTechDetails(['Next.js', 'Tailwind', 'Motion', 'Aceternity UI']),
        features: ['Feature 1', 'Feature 2', 'Feature 3']
    }
]