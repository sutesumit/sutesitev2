import { FaCss3 } from 'react-icons/fa';
import { 
    SiFigma, SiJavascript, SiHtml5, SiTypescript, SiPython, SiReact, 
    SiNextdotjs, SiNodedotjs, SiExpress, SiTailwindcss, SiFramer, 
    SiMongodb, SiRedux, SiShadcnui, SiRadixui, 
    SiSupabase, SiAwslambda, SiServerless, SiAmazonalexa, SiVitest, SiMdx, SiOpenai
} from 'react-icons/si';
import { RiClaudeLine, RiGeminiLine, RiVercelFill } from 'react-icons/ri';
import { BiLogoPostgresql } from 'react-icons/bi';
import { FaGitAlt, FaGithub, FaAws } from 'react-icons/fa6';

export const skillList = {
    "languages": [
        { name: 'JavaScript', icon: <SiJavascript /> },
        { name: 'TypeScript', icon: <SiTypescript /> },
        { name: 'Python', icon: <SiPython /> },
        { name: 'HTML', icon: <SiHtml5 /> },
        { name: 'CSS', icon: <FaCss3 /> },
    ],
    "frontend": [
        { name: 'React', icon: <SiReact /> },
        { name: 'Next.js', icon: <SiNextdotjs /> },
        { name: 'Tailwind CSS', icon: <SiTailwindcss /> },
        { name: 'Radix UI', icon: <SiRadixui /> },
        { name: 'shadcn/ui', icon: <SiShadcnui /> },
        { name: 'Aceternity UI', icon: null },
        { name: 'Framer Motion', icon: <SiFramer /> },
        { name: 'Redux', icon: <SiRedux /> },
        { name: 'MDX', icon: <SiMdx /> },
    ],
    "backend & cloud": [
        { name: 'Node.js', icon: <SiNodedotjs /> },
        { name: 'Express.js', icon: <SiExpress /> },
        { name: 'Supabase', icon: <SiSupabase /> },
        { name: 'PostgreSQL', icon: <BiLogoPostgresql /> },
        { name: 'MongoDB', icon: <SiMongodb /> },
        { name: 'Grammy', icon: null },
        { name: 'AWS Lambda', icon: <SiAwslambda /> },
        { name: 'Serverless', icon: <SiServerless /> },
        { name: 'Alexa for Hospitality (A4H)', icon: <SiAmazonalexa /> },
        { name: 'AWS', icon: <FaAws /> },
        { name: 'GitHub', icon: <FaGithub /> },
        { name: 'Vercel', icon: <RiVercelFill /> },
    ],
    "tooling & design": [
        { name: 'Git', icon: <FaGitAlt /> },
        { name: 'Figma', icon: <SiFigma /> },
        { name: 'Vitest', icon: <SiVitest /> },
        { name: 'Playwright', icon: null },
        { name: 'Cursor', icon: null },
        { name: 'Claude Code', icon: <RiClaudeLine /> },
        { name: "Gemini CLI", icon: <RiGeminiLine />},
        { name: 'Kilocode', icon: null },
        { name: 'Codex', icon: <SiOpenai /> },        
    ],
};
