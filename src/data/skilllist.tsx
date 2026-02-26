import { FaCss3 } from 'react-icons/fa';
import { 
    SiFigma, SiJavascript, SiHtml5, SiTypescript, SiPython, SiReact, 
    SiNextdotjs, SiNodedotjs, SiExpress, SiTailwindcss, SiFramer, 
    SiMongodb, SiRedux, SiShadcnui, SiRadixui, 
    SiSupabase, SiAwslambda, SiServerless, SiAmazonalexa, 
} from 'react-icons/si';
import { RiClaudeLine, RiGeminiLine } from 'react-icons/ri';
import { BiLogoPostgresql } from 'react-icons/bi';
import { FaGitAlt } from 'react-icons/fa6';

export const skillList = {
    "languages": [
        { name: 'JavaScript', icon: <SiJavascript /> },
        { name: 'TypeScript', icon: <SiTypescript /> },
        { name: 'Python', icon: <SiPython /> },
        { name: 'HTML', icon: <SiHtml5 /> },
        { name: 'CSS', icon: <FaCss3 /> },
    ],
    "frontend": [
        { name: 'Next.js', icon: <SiNextdotjs /> },
        { name: 'React', icon: <SiReact /> },
        { name: 'Redux', icon: <SiRedux /> },
        { name: 'Tailwind CSS', icon: <SiTailwindcss /> },
        { name: 'Framer Motion', icon: <SiFramer /> },
        { name: 'shadcn/ui', icon: <SiShadcnui /> },
        { name: 'Aceternity UI', icon: null },
        { name: 'Radix UI', icon: <SiRadixui /> },
        // { name: 'Lucide Icons', icon: <SiLucide /> },
        // { name: 'Tabler Icons', icon: null },
        // { name: 'React Icons', icon: <SiReact /> },
        // { name: 'Lottie React', icon: null },
        // { name: 'Rough Notation', icon: null },
        // { name: 'React PageFlip', icon: null },
        // { name: 'Fuse.js', icon: null },
        // { name: 'MDX', icon: <SiMdx /> },
        // { name: 'html2canvas', icon: null },
    ],
    "backend & cloud": [
        { name: 'Node.js', icon: <SiNodedotjs /> },
        { name: 'Express.js', icon: <SiExpress /> },
        { name: 'Supabase', icon: <SiSupabase /> },
        { name: 'MongoDB', icon: <SiMongodb /> },
        { name: 'PostgreSQL', icon: <BiLogoPostgresql /> },
        { name: 'AWS Lambda', icon: <SiAwslambda /> },
        { name: 'Serverless', icon: <SiServerless /> },
        { name: 'Alexa for Hospitality (A4H)', icon: <SiAmazonalexa /> },
    ],
    "tooling & design": [
        { name: 'Git', icon: <FaGitAlt /> },
        { name: 'Figma', icon: <SiFigma /> },
        // { name: 'ESLint', icon: <SiEslint /> },
        { name: 'Cursor', icon: null },
        { name: 'Claude Code', icon: <RiClaudeLine /> },
        { name: "Gemini CLI", icon: <RiGeminiLine />}
    ],
};
