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
        {/* <p>From working as an artist to now building software at <Link target="_blank" className='border-[1px] border-opacity-25 dark:border-opacity-25 bg-blue-100 dark:bg-blue-950 border-blue-900 dark:border-blue-400 rounded-sm px-1' href='https://beneathatree.com/'>beneathAtree</Link>, my creative practice continues to shape how I write and think about code.</p>
        <br/> */}
        <p>Before I ever wrote a line of JavaScript, I told stories through visuals, writing, and design experiments — from documenting atrocities and resilience for The Wire to shaping the visuals for the headlines at Hindustan Times. Later, at Fields of View, I combined art, data, and design to make policymaking playful and participatory, and at the Ambedkar Reading Circle, I merged systems thinking, theatre of the oppressed and code to create Dramas of Discrimination, an open-source toolkit for inclusive practices.</p>
        <br/>
        <p>Today, as a developer at <Link target="_blank" className='border-[1px] border-opacity-25 dark:border-opacity-25 bg-blue-100 dark:bg-blue-950 border-blue-900 dark:border-blue-400 rounded-sm px-1' href='https://beneathatree.com/'>beneathAtree</Link>, I continue to draw from the same creative instincts. And my interactive digital art continues to explore the intersection of personal archives, inherited emotions, and the political — imagining the web as a space for artistic expression and self-reflection.</p>
        <br/>
        <p>Side projects I am currently working on:</p>
        <ul className="project-list text-blue-900 dark:text-blue-400">
          <li className='project-item'><Link href="/work/art">art.sumitsute.com</Link></li>
          <li className='project-item'><Link href="/work/dramas-of-discrimination">Dramas of Discrimination</Link></li>
        </ul>
        <br/> 
        
      </div>
    </article>
  );
}
