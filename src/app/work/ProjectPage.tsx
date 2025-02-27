import React from 'react'
import Link from 'next/link'
import LiveRepoLinks from '../components/shared/LiveRepoLinks';
import Accordian from '../components/shared/Accordian';
import { projects, ProjectProps } from './projectlist';


const ProjectPage = ({project}: { project: ProjectProps}) => {

  return (
    <article className="container p-10 h-auto items-center font-roboto-mono lowercase">

        <ul className="project-container project-list">
            <li className='project-item text-blue-900 dark:text-blue-400'><Link href={project.locallink}>{project.title}</Link></li>
        
            <div className='about-section my-2 md:pl-8'>
              <div className='project-description py-1'>{project.description}</div>
              <LiveRepoLinks livelink={project.livelink} repolink={project.githublink} />              
              <Accordian title='About'>{project.about}</Accordian>
              {/* <Accordian title="Features">
                {project.features.map((feature, index) => (
                  <div key={index}>{feature}</div>
                ))}
              </Accordian> */}
              <Accordian title='Tech Stack'>
                <div className='project-technologies flex gap-2'>
                  {project.technologies.map((tech, index) => (
                    <span className='tab text-xs flex items-center gap-1 tech-keyword' key={index}>{tech}</span>
                  ))}
                </div>
              </Accordian>
              <Accordian title='Roles'>
                <div className='project-roles flex gap-2'>
                  {project.roles.map((role, index) => (
                    <span className='tab text-xs flex items-center gap-1 role-keyword' key={index}>{role}</span>
                  ))}
                </div>
              </Accordian>
            </div>       

        </ul>

        

        <div className="project-list p-1 my-5 grid grid-cols-1 md:grid-cols-2 items-center border-t-[1px] border-dashed rounded-sm border-slate-300 dark:border-slate-700">
            <div className="col-span-2 md:text-center text-sm pb-2"><Link href='/work' className='nav-tab pt-1'>work</Link></div>
          {projects.map((project, index) => (
            <div key={index} className='project-item col-span-2 md:col-span-1 text-blue-900 dark:text-blue-400'><Link href={project.locallink}>{project.title}</Link></div>                
          ))}
        </div>
    </article>
  )
}

export default ProjectPage
