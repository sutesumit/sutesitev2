'use client'
import React from 'react'
import dynamic from 'next/dynamic'
import bullets from './bullets'

const FallingLeaves = dynamic(() => import('../components/specific/FallingLeaves'), {
  ssr: false,
})

export default function Home() {

  const [ showIcon, setShowIcon ] = React.useState(false)

  return (
    <article className="p-10 container h-auto items-center font-roboto-mono lowercase">
      <div className="h-[calc(100vh-10rem)] pt-5">
        <div className=''>
          <p className="font-bold">About</p>
        </div>
        <br/>
        <p>Before finding my rightful place in web development, my path has taken me through mechanical engineering, documentary photography, editorial journalism, communication strategy, and community organizing. A common thread runs through all these experiences: the drive to create things that enhance and complement life.</p>
        <br/> 
        <p className="inline">Building backwards and retracing every step that led me here.</p><div className="inline"><FallingLeaves /></div>
        <ul className="life-line project-list p-2 pb-10">
          {bullets.map((bullet, index) => (
            <li 
              key={index}
              className='relative'
            >
              <span className={`absolute h-full w-full left-2 opacity-0 hover:opacity-100 transition-all duration-300`}>{bullet.icons}</span>
              <br/>
              {bullet.body}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
