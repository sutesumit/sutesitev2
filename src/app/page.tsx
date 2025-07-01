'use client'
import Link from 'next/link'
import dynamic from 'next/dynamic'

const SeedingPlant = dynamic(() => import('../components/specific/SeedingPlant'), {
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
        <p>From working as an artist to now building software at <Link className='border-[1px] border-opacity-25 dark:border-opacity-25 bg-blue-100 dark:bg-blue-950 border-blue-900 dark:border-blue-400 rounded-sm px-1' href='https://beneathatree.com/'>beneathAtree</Link>, my creative practice continues to shape how I write and think about code.</p>
        <br/>
        <p>I create interactive digital art exploring the intersection of personal archives, inherited emotions, and the political.  My work, informed by the feminist principle that the personal is political, imagines web technologies as a medium for artistic expression and self-reflection.</p>
        <br/>
        <p>Projects I am currently working on:</p>
        <ul className="project-list text-blue-900 dark:text-blue-400">
          <li className='project-item'><Link href="/work/art">art.sumitsute.com</Link></li>
          <li className='project-item'><Link href="/work/dramas-of-discrimination">Dramas of Discrimination</Link></li>
        </ul>
        <br/> 
        
      </div>
    </article>
  );
}
