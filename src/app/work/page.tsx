import { projects, skillList } from '../../data/info'
import Link from 'next/link';
import LiveRepoLinks from '../components/shared/LiveRepoLinks';

export default function Home() {

  return (
    <article className="p-10 container h-auto items-center font-roboto-mono lowercase">
      {/* Skill List Section of the work page */}
        <div className='skill-list'>
          <div className='page-title py-3'>
            <p className="font-bold">Skills</p>
          </div>
          <div className="pl-8 flex flex-wrap items-center text-xs gap-1">
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
              <ul className="project-title project-list list-style-none">
                <li className='project-item  text-blue-900 dark:text-blue-400'><Link href={project.locallink}>{project.title}</Link></li>                
              </ul>
              <div className="project-info pl-8">
                <div className="project-description py-1">
                  <p>{project.description}</p>
                </div>
                <LiveRepoLinks livelink={project.livelink} repolink={project.githublink} />
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
