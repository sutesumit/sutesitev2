import Link from 'next/link'
import { projects, skillList } from './info'
import { TvMinimalPlay, CodeXml } from 'lucide-react'

export default function Home() {

  return (
    <article className="p-10 container h-auto items-center font-roboto-mono lowercase">
      <div className="pt-5">
        <div className='page-title'>
          <div className="flex flex-wrap items-center gap-1">
            {skillList.languages.map((skill, index) => (
              <span className='tab' key={index}>{skill}</span>
            ))}
            {skillList.frameworks.map((skill, index) => (
              <span className='tab' key={index}>{skill}</span>
            ))}
            {skillList.databases.map((skill, index) => (
              <span className='tab' key={index}>{skill}</span>
            ))}
            {skillList.tools.map((skill, index) => (
              <span className='tab' key={index}>{skill}</span>
            ))}
            {skillList.stacks.map((skill, index) => (
              <span className='tab' key={index}>{skill}</span>
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
                    className='tab flex items-center gap-1 text-blue-900 dark:text-blue-400 shadow-[3px_3px_0px_0px_rgba(0,_0,_0,_0.1)] dark:shadow-[3px_3px_0px_0px_rgba(255,_255,_255,_0.1)]' 
                    href={project.livelink}
                    target="_blank"
                  >
                    <TvMinimalPlay height={15} width={15} />
                    Live
                  </a>
                  <a 
                    className='tab flex items-center gap-1 text-blue-900 dark:text-blue-400 shadow-[3px_3px_0px_0px_rgba(0,_0,_0,_0.1)] dark:shadow-[3px_3px_0px_0px_rgba(255,_255,_255,_0.1)]'
                    href={project.githublink} 
                    target="_blank"
                  >
                    <CodeXml height={15} width={15} />
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
