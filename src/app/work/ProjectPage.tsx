import React from 'react'
import Link from 'next/link'
import { projects } from './info'
import { FaGithub } from "react-icons/fa";
import { IoGameControllerOutline } from 'react-icons/io5';

interface RoleDetails {
    name: string;
    description?: string; // Add any additional properties relevant to roles
  }
  
  interface TechDetails {
    name: string;
    category?: string; // Add any additional properties relevant to technologies
  }

  interface ProjectProps {
    title: string;
    locallink: string;
    roles: RoleDetails[]; // Assuming getRoleDetails returns an array of RoleDetails
    description: string;
    about: string;
    livelink: string;
    githublink: string;
    technologies: TechDetails[]; // Assuming getTechDetails returns an array of TechDetails
  }
  

const ProjectPage = ({project}: {project: ProjectProps}) => {
  return (
    <article className="p-10 container h-auto items-center font-roboto-mono lowercase">
        <ul className="project-title project-list list-style-none">
            <li className='project-item  text-blue-900 dark:text-blue-400'><Link href={project.locallink}>{project.title}</Link></li>
            <div className='p-2'>{project.about}</div>                
        </ul>

        <div className="project-links flex gap-2">
          <a 
            className='tab flex items-center gap-1 shadow-[3px_3px_0px_0px_rgba(0,_0,_0,_0.1)] dark:shadow-[3px_3px_0px_0px_rgba(255,_255,_255,_0.1)]' 
            href={project.livelink}
            target="_blank"
          >
            <IoGameControllerOutline />
            Live
          </a>
          <a 
            className='tab flex items-center gap-1 shadow-[3px_3px_0px_0px_rgba(0,_0,_0,_0.1)] dark:shadow-[3px_3px_0px_0px_rgba(255,_255,_255,_0.1)]'
            href={project.githublink} 
            target="_blank"
          >                    
            <FaGithub />
            Repo
          </a>
        </div>

        <div className="project-list p-1 my-2 grid grid-cols-1 md:grid-cols-2 items-center border-[1px] rounded-sm border-slate-300 dark:border-slate-700">
            <div className="col-span-2 text-center text-sm pb-2"><Link href='/work' className='nav-tab pt-1'>work</Link></div>
          {projects.map((project, index) => (
            <div key={index} className='project-item text-blue-900 dark:text-blue-400'><Link href={project.locallink}>{project.title}</Link></div>                
          ))}
        </div>
    </article>
  )
}

export default ProjectPage
