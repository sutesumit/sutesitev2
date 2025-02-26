import React from 'react';
import { FaCss3 } from 'react-icons/fa';
import { SiFigma, SiJavascript, SiHtml5, SiTypescript, SiPython, SiReact, SiNextdotjs, SiNodedotjs, SiExpress, SiTailwindcss, SiFramer, SiMongodb, SiDocker } from 'react-icons/si';
import { BiLogoPostgresql, BiTerminal } from 'react-icons/bi';
import { FaGitAlt } from 'react-icons/fa6';
import { VscVscode } from 'react-icons/vsc';
import { LuTextCursorInput } from 'react-icons/lu';
import { LiaBezierCurveSolid } from 'react-icons/lia';
import { GiSwissArmyKnife } from 'react-icons/gi';

export const contactInfo = {
    email: 'sumitsute@alumni.iitm.ac.in',
    phone: '+91 7204617420',
    location: 'Bengaluru, IN | Reading, UK',
    socialMedia: {
        personal: 'https://sumitsute.com',
        github: 'https://github.com/sutesumit',
        linkedin: 'https://www.linkedin.com/in/sumitsute/',
    },
};

export const skillList = {
    languages: [
        { name: 'JavaScript', icon: <SiJavascript /> },
        { name: 'TypeScript', icon: <SiTypescript /> },
        { name: 'Python', icon: <SiPython /> },
        { name: 'HTML', icon: <SiHtml5 /> },
        { name: 'CSS', icon: <FaCss3 /> },
    ],
    frameworks: [
        { name: 'React', icon: <SiReact /> },
        { name: 'Next.js', icon: <SiNextdotjs /> },
        { name: 'Node.js', icon: <SiNodedotjs /> },
        { name: 'Express.js', icon: <SiExpress /> },
        { name: 'Tailwind', icon: <SiTailwindcss /> },
        { name: 'Motion', icon: <SiFramer /> },
    ],
    databases: [
        { name: 'MongoDB', icon: <SiMongodb /> },
        { name: 'PostgreSQL', icon: <BiLogoPostgresql /> },
    ],
    tools: [
        { name: 'Git', icon: <FaGitAlt /> },
        { name: 'Docker', icon: <SiDocker /> },
        { name: 'VSCode', icon: <VscVscode /> },
        { name: 'Figma', icon: <SiFigma /> },
    ],
    stacks: [
        { name: 'MERN', icon: null },
        { name: 'Frontend', icon: null },
        { name: 'Backend', icon: null },
        { name: 'Fullstack', icon: null },
    ],
};

const roles = [
    { name: 'End-to-end', icon: <GiSwissArmyKnife /> },
    { name: 'Developer', icon: <BiTerminal /> },
    { name: 'UI Designer', icon: <LiaBezierCurveSolid /> },
    { name: 'Writer', icon: <LuTextCursorInput /> },
];

const getTechDetails = (techNames: string[]) => {
    return techNames.map((tech) => {
        const found = Object.values(skillList).flat().find((item) => item.name === tech);
        return found || { name: tech, icon: null };
    });
}

const getRoleDetails = (roleNames: string[]) => {
    return roleNames.map((role) => {
        const found = roles.find((item) => item.name === role);
        return found || { name: role, icon: null };
    });
}


export const projects = [
    {
        title: 'art.sumitsute.com',
        locallink: '/work/art',
        roles: getRoleDetails(['End-to-end','Developer', 'UI Designer', 'Writer']),
        description: 'An interactive Next.js portfolio of Sumit Sute’s photographic art.',
        about: 'art.sumitsute.com is my portfolio website, showcasing my lens-based artistic practice over the past few years. My journey began in documentary photography, working with media, governments, and NGOs, before I moved into photo editing at a leading Indian news organization. Over time, my practice has evolved, deeply rooted in photography and the feminist principle that "the personal is political." This website, carefully built with web technologies, is an invitation to reflect, engage, and respond to my work.',
        livelink: 'https://www.art.sumitsute.com/',
        githublink: 'https://github.com/sutesumit/jaybhim_affirma',
        technologies: getTechDetails(['Next.js', 'Tailwind', 'Motion', 'Aceternity UI'])
    },
    {
        title: 'Dramas of Discrimination',
        locallink: '/work/dramas-of-discrimination',
        roles: getRoleDetails(['End-to-end','Developer', 'UI Designer', 'Writer']),
        description: 'An open-source Next.js tool for Dramas of Discrimination workshops, enabling communities and students to foster inclusive academic and professional spaces.',
        about: 'This open-source web platform is designed to support the independent facilitation of Dramas of Discrimination workshops, fostering dialogue, reflection, and action for more inclusive academic and professional spaces. Developed by the Ambedkar Reading Circle, it serves as a facilitator’s guide, a resource repository for workshop materials, and a data portal for case studies and participant-generated charters of demands. Additionally, it contributes to a collective Manifesto of Inclusion, integrating insights rooted in constitutional values to drive systemic change.',
        livelink: 'https://www.dod.sumitsute.com/',
        githublink: 'https://github.com/sutesumit/dodpage',
        technologies: getTechDetails(['Next.js', 'Tailwind', 'Motion', 'Aceternity UI'])
    }
]

export const Education = {
    degree: 'MTech & BTech (Dual Degree)',
    institution: 'IIT Madras',
    year: '2018',
    location: 'Chennai, IN',
    bullets: ['Master of Technology in Product Design & Bachelor of Technology in Mechanical Engineering', 'Dual Degree Project: Robot Motion Planning Using Derivatives of Rapidly-Exploring Random Tree Algorithms', 'Minor in Social Entrepreneurship and Innovation'], 
}

export const certificates = [
    {
        title: 'Foundations of Generative AI',
        issuer: 'Udacity',
        year: '2025',
        link: 'https://www.udacity.com/certificate/e/eca4f43c-b7bc-11ef-a40d-87d817aca835'
    },
    {
        title: 'Front End Libraries (Bootstrap, Sass, React, Redux)',
        issuer: 'freeCodeCamp',
        year: '2023',
        link: 'https://www.freecodecamp.org/certification/sumitsute/front-end-libraries'
    },
    {
        title: 'Responsive Web Design',
        issuer: 'freeCodeCamp',
        year: '2023',
        link: 'https://www.freecodecamp.org/certification/sumitsute/responsive-web-design'
    },
    {
        title: 'JavaScript Algorithms and Data Structures',
        issuer: 'freeCodeCamp',
        year: '2023',
        link: 'https://www.freecodecamp.org/certification/sumitsute/javascript-algorithms-and-data-structures'
    },
    {
        title: 'Data Visualization',
        issuer: 'freeCodeCamp',
        year: '2023',
        link: 'https://www.freecodecamp.org/certification/sumitsute/data-visualization'
    },
    {
        title: 'Learn TypeScript',
        issuer: 'Scrimba',
        year: '2024',
        link: 'https://www.scrimba.com/'
    },
    {
        title: 'Intro to UI Design Fundamentals',
        issuer: 'Scrimba',
        year: '2024',
        link: 'https://www.scrimba.com/'
    }

]