'use client'
import React, { useEffect } from 'react'
import dynamic from 'next/dynamic'
import bullets from './bullets'
import { motion as m } from 'motion/react'

const FallingLeaves = dynamic(() => import('../components/specific/FallingLeaves'), {
  ssr: false,
})

export default function Home() {

  const [ showHeart, setShowHeart ] = React.useState<boolean>(false)
  const [ mountHeart, setMountHeart ] = React.useState<boolean>(false)
  const heartText = " (and in my partner's heart! 💕)"

  useEffect(() => {
    setMountHeart(true)
  }, [])

  return (
    <article className="p-10 container h-auto items-center font-roboto-mono lowercase">
      <div className="h-[calc(100vh-10rem)] pt-5">
        <div className=''>
          <p className="font-bold">About</p>
        </div>
        <br/>
        <p onMouseEnter={() => setShowHeart(true)} onMouseLeave={() => setShowHeart(false)}>Before finding my rightful place in web development
          <span 
            className={` ${showHeart ? 'inline' : 'hidden'} ita`}
          >{
            mountHeart && (
            heartText.split("").map((letter, index) => (
            <m.span
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: showHeart ? 1 : 0, x: showHeart ? 0 : -20 }}
              transition={{ duration: 0.4, delay: index * 0.01 }}
            >
              {letter}
            </m.span>
            )))
          }
          </span>, 
          my path has taken me through mechanical engineering, editorial journalism, documentary photography, communication strategy, and community organizing. A common thread runs through all these experiences: the drive to create things that enhance and complement life.
        </p>
        <br/> 
        <p className="inline">Building backwards and retracing every step that led me here.</p><div className="inline"><FallingLeaves /></div>
        <ul className="life-line project-list p-2 pb-10">
          {bullets.map((bullet, index) => (
            <li 
              key={index}
              className='relative'
            >
              <span 
                className={`absolute h-full w-full left-2 opacity-0 hover:opacity-100 transition-all duration-300`}
              >
                {
                (bullet.icons).map((icon, index) => (
                  <m.span 
                    key={index}
                    className=""
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: index * 0.5 }}
                  >
                    <m.span>{icon}</m.span>
                  </m.span>
                ))
                }
              </span>
              <br/>
              {bullet.body}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
