import { ReactNode } from "react";

export interface RoleDetails {
    name: string;
    icon: ReactNode | null;
}

export interface TechDetails {
    name: string;
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
