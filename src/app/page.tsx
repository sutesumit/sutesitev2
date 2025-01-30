'use client'
import Link from 'next/link'
import dynamic from 'next/dynamic'

const SeedingPlant = dynamic(() => import('./components/specific/SeedingPlant'), {
  ssr: false,
})

export default function Home() {
  return (
    <article className="p-10 container flex items-center h-screen font-roboto-mono lowercase">
      <div>
        <div className='flex'>
          <p>Hellos. Sumit Sute here.</p><SeedingPlant/>
        </div>
        <br/>
        <p>I&apos;m a full-stack developer, self-taught and deeply influenced by my practice as an artist.</p>
        <br/>
        <p>I create interactive digital art exploring the intersection of personal archives, inherited emotions, and the political.  My work, informed by the feminist principle that the personal is political, imagines web technologies as a medium for artistic expression and self-reflection.</p>
        <br/>
        <p>Projects I am currently working on:</p>
        <ul className="project-list text-blue-900 dark:text-blue-400">
          <li><Link href="https://www.art.sumitsute.com/" target="_blank">art.sumitsute.com</Link></li>
        </ul>
        <br/> 
        
      </div>
    </article>
  );
}
