'use client'
import React from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { projects } from '../info'
import { IoGameControllerOutline } from 'react-icons/io5'
import { FaGithub } from "react-icons/fa";

const page = () => {
  const pathname = usePathname();
  return (
    <article className="p-10 container h-auto items-center font-roboto-mono lowercase">
        <div className="projects flex flex-col gap-3"> 
            {projects.map((project, index) => (
                (pathname === project.locallink) && (
                <div key={index} className="project">
                <div className="project-title project-list">
                    <Link href={project.locallink} className="project-item text-blue-900 dark:text-blue-400">{project.title}</Link>
                </div>
                <div className="project-info pl-8">
                    <div className="project-description py-1">
                    <p>{project.description}</p>
                    </div>
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
                    <div className="project-technologies flex gap-2">
                    {project.technologies.map((tech, index) => (
                        <span className='tab text-xs flex items-center gap-1 tech-keyword' key={index}>{tech.icon}{tech.name}</span>
                    ))}
                    </div>
                    <div className="project-roles flex gap-2">
                    {project.roles.map((role, index) => (
                        <span className='tab text-xs flex items-center gap-1 role-keyword' key={index}>{role.icon}{role.name}</span>
                    ))}
                    </div>
                </div>
                </div>)
            ))}          
        </div>
    </article>
  )
}

export default page
