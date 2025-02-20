import Link from 'next/link'
import { projects, skillList } from './info'
import { MdOutlineLiveTv } from 'react-icons/md'
import { FaCode } from "react-icons/fa6";
import { FaGithubAlt } from "react-icons/fa";
import { FaGithub } from "react-icons/fa";

export default function Home() {

  return (
    <article className="p-10 container h-auto items-center font-roboto-mono lowercase">
      <div className="pt-5">
        <div className='skilll-list'>
          <div className="flex flex-wrap items-center gap-1 cursor-pointer">
            {skillList.languages.map((skill, index) => (
              <span className='tab opacity-50 hover:opacity-100' key={index}>{skill}</span>
            ))}
            {skillList.frameworks.map((framework, index) => (
              <span className='tab opacity-50 hover:opacity-100' key={index}>{framework}</span>
            ))}
            {skillList.databases.map((database, index) => (
              <span className='tab opacity-50 hover:opacity-100' key={index}>{database}</span>
            ))}
            {skillList.tools.map((tool, index) => (
              <span className='tab opacity-50 hover:opacity-100' key={index}>{tool}</span>
            ))}
            {skillList.stacks.map((stack, index) => (
              <span className='tab opacity-50 hover:opacity-100' key={index}>{stack}</span>
            ))}
          </div>
        </div>
        <br/>
        <div className='page-title'>
          <p className="font-bold">Works</p>
        </div>
        <br/>
        <div className="projects flex flex-col gap-3">
          {projects.map((project, index) => (
            <div key={index} className="project">
              <div className="project-title project-list">
                <p className="project-item text-blue-900 dark:text-blue-400">{project.title}</p>
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
                    <MdOutlineLiveTv />
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
                    <span className='tab tech-keyword' key={index}>{tech}</span>
                  ))}
                </div>
                <div className="project-roles flex gap-2">
                  {project.roles.map((role, index) => (
                    <span className='tab role-keyword' key={index}>{role}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}          
        </div>
       </div>
    </article>
  );
}
