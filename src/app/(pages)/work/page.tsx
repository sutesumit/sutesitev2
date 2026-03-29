import type { Metadata } from 'next';

import { ContributionHeatmap } from '@/games/contribution-heatmap';
import { projects } from '@/data/projectlist';
import { skillList } from '@/data/skilllist';
import { buildStaticMetadata } from '@/lib/metadata/builders';
import { buildWorkIndexSchema, renderJsonLd } from '@/lib/metadata/schema';

import { TechStackCard } from './components/TechStackCard';
import { WorkProjectCard } from './components/WorkProjectCard';

export const metadata: Metadata = buildStaticMetadata('work');

export default function Home() {
  return (
    <article className="py-10 px-2 sm:px-0 container h-auto font-roboto-mono lowercase flex flex-col gap-4">
      {renderJsonLd(buildWorkIndexSchema(projects))}
      <section className='heatmap'>
        <ContributionHeatmap />
      </section>
      <section className='skill-list'>
        <div className='page-title mb-2'>
          <p className="font-bold">Technologies</p>
        </div>
        <TechStackCard skillList={skillList as Record<string, {name: string, icon: React.ReactNode}[]>} />
      </section>

      <section className='works'>
        <div className='page-title mb-2'>
          <p className="font-bold">Works</p>
        </div>
        <div className="projects flex flex-col gap-2">
          {projects.map((project, index) => (
            <WorkProjectCard key={index} project={project} />
          ))}
        </div>
      </section>
    </article>
  );
}
