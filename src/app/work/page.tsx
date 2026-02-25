import { projects } from '../../data/projectlist';
import { skillList } from '@/data/skilllist';
import { WorkProjectCard } from './components/WorkProjectCard';
import { TechStackCard } from './components/TechStackCard';

export default function Home() {

  return (
    <article className="px-6 py-12 container h-auto font-roboto-mono lowercase flex flex-col gap-4">
      {/* Skill List Section */}
      <section className='skill-list'>
        <div className='page-title mb-2'>
          <p className="font-bold">Technologies</p>
        </div>
        <TechStackCard skillList={skillList as any} />
      </section>
      
      {/* Project Section */}
      <section className='works'>
        <div className='page-title mb-2'>
          <p className="font-bold">Works</p>
        </div>
        <div className="projects flex flex-col gap-2">
          {projects.map((project, index) => (
            <WorkProjectCard key={index} project={project} index={index} />
          ))}          
        </div>
      </section>
    </article>
  );
}
