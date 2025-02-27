import { FaCss3 } from 'react-icons/fa';
import { SiFigma, SiJavascript, SiHtml5, SiTypescript, SiPython, SiReact, SiNextdotjs, SiNodedotjs, SiExpress, SiTailwindcss, SiFramer, SiMongodb, SiDocker } from 'react-icons/si';
import { BiLogoPostgresql } from 'react-icons/bi';
import { FaGitAlt } from 'react-icons/fa6';
import { VscVscode } from 'react-icons/vsc';

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