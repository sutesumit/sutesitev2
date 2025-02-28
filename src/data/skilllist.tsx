import { FaCss3 } from 'react-icons/fa';
import { SiFigma, SiJavascript, SiHtml5, SiTypescript, SiPython, SiReact, SiNextdotjs, SiNodedotjs, SiExpress, SiTailwindcss, SiFramer, SiMongodb } from 'react-icons/si';
import { BiLogoPostgresql } from 'react-icons/bi';
import { FaGitAlt } from 'react-icons/fa6';

export const skillList = {
    languages: [
        { name: 'JavaScript', icon: <SiJavascript /> },
        { name: 'TypeScript', icon: <SiTypescript /> },
        { name: 'Python', icon: <SiPython /> },
        { name: 'HTML', icon: <SiHtml5 /> },
        { name: 'CSS', icon: <FaCss3 /> },
    ],
    frontend: [
        { name: 'React', icon: <SiReact /> },
        { name: 'Tailwind', icon: <SiTailwindcss /> },
        { name: 'Motion', icon: <SiFramer /> },
    ],
    backend: [
        { name: 'Node.js', icon: <SiNodedotjs /> },
        { name: 'Express.js', icon: <SiExpress /> },
    ],
    databases: [
        { name: 'MongoDB', icon: <SiMongodb /> },
        { name: 'PostgreSQL', icon: <BiLogoPostgresql /> },
    ],
    tools: [
        { name: 'Next.js', icon: <SiNextdotjs /> },
        { name: 'Git', icon: <FaGitAlt /> },
        { name: 'Figma', icon: <SiFigma /> },
    ],
    stacks: [
        { name: 'MERN', icon: null },
        { name: 'Frontend', icon: null },
        { name: 'Backend', icon: null },
        { name: 'Fullstack', icon: null },
    ],
};