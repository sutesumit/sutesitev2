import React from 'react';
import { FaCss3 } from 'react-icons/fa';
import { SiFigma, SiJavascript, SiHtml5, SiTypescript, SiPython, SiReact, SiNextdotjs, SiNodedotjs, SiExpress, SiTailwindcss, SiFramer, SiMongodb, SiDocker } from 'react-icons/si';
import { BiLogoPostgresql } from 'react-icons/bi';
import { FaGitAlt } from 'react-icons/fa6';
import { VscVscode } from 'react-icons/vsc';
import { TfiWrite } from 'react-icons/tfi';
import { LiaBezierCurveSolid } from 'react-icons/lia';
import { AiFillCode } from 'react-icons/ai';
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
        { name: 'MERN', icon: null }, // No standard icon available
        { name: 'Frontend', icon: null },
        { name: 'Backend', icon: null },
        { name: 'Fullstack', icon: null },
    ],
};

const roles = [
    { name: 'End-to-end', icon: <GiSwissArmyKnife /> },
    { name: 'Developer', icon: <AiFillCode /> },
    { name: 'UI Designer', icon: <LiaBezierCurveSolid /> },
    { name: 'Writer', icon: <TfiWrite /> },
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
        roles: getRoleDetails(['End-to-end','Developer', 'UI Designer']),
        description: 'A static website for my art portfolio.',
        livelink: 'https://www.art.sumitsute.com/',
        githublink: 'https://github.com/sutesumit/jaybhim_affirma',
        technologies: getTechDetails(['Next.js', 'Tailwind', 'Motion', 'Aceternity UI'])
    },
    {
        title: 'Dramas of Discrimination',
        roles: getRoleDetails(['End-to-end','Developer', 'UI Designer']),
        description: 'A web application for exploring the intersection of personal archives, inherited emotions, and the political.',
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