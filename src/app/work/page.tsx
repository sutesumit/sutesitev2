import { projects } from '../../data/projectlist';
import { skillList } from '@/data/skilllist';
import { WorkProjectCard } from './components/WorkProjectCard';

export default function Home() {

  return (
    <article className="p-10 container h-auto items-center font-roboto-mono lowercase">
      {/* Skill List Section of the work page */}
        <div className='skill-list'>
          <div className='page-title py-3'>
            <p className="font-bold">Technologies</p>
          </div>
          <div className="pl-8 flex flex-wrap items-center text-xs gap-1">
            {skillList.languages.map((skill, index) => (
              <span className='tab flex items-center gap-1 opacity-50 hover:opacity-100' key={index}>{skill.icon}{skill.name}</span>
            ))} 
            {skillList.frontend.map((framework, index) => (
              <span className='tab flex items-center gap-1 opacity-50 hover:opacity-100' key={index}>{framework.icon}{framework.name}</span>
            ))}
            {skillList.backend.map((framework, index) => (
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
            <WorkProjectCard key={index} project={project} index={index} />
          ))}          
        </div>
    </article>
  );
}
