import { projects, skillList } from './info'
import { FaGithub } from "react-icons/fa";
import { IoGameControllerOutline } from 'react-icons/io5';

export default function Home() {

  return (
    <article className="p-10 container h-auto items-center font-roboto-mono lowercase">
      {/* Skill List Section of the work page */}
        <div className='skill-list'>
          <div className='page-title py-3'>
            <p className="font-bold">Skills</p>
          </div>
          <div className="pl-8 flex flex-wrap items-center text-xs gap-1 cursor-pointer">
            {skillList.languages.map((skill, index) => (
              <span className='tab flex items-center gap-1 opacity-50 hover:opacity-100' key={index}>{skill.icon}{skill.name}</span>
            ))} 
            {skillList.frameworks.map((framework, index) => (
              <span className='tab flex items-center gap-1 opacity-50 hover:opacity-100' key={index}>{framework.icon}{framework.name}</span>
            ))}
            {skillList.databases.map((database, index) => (
              <span className='tab flex items-center gap-1 opacity-50 hover:opacity-100' key={index}>{database.icon}{database.name}</span>
            ))}
            {skillList.tools.map((tool, index) => (
              <span className='tab flex items-center gap-1 opacity-50 hover:opacity-100' key={index}>{tool.icon}{tool.name}</span>
            ))}
            {skillList.stacks.map((stack, index) => (
              <span className='tab flex items-center gap-1 opacity-50 hover:opacity-100' key={index}>{stack.icon}{stack.name}</span>
            ))}
          </div>
        </div>
        <br/>
        {/* Project Section of the work page */}
        <div className='page-title'>
          <p className="font-bold">Works</p>
        </div>
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
            </div>
          ))}          
        </div>
    </article>
  );
}
