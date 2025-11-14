import React from 'react'
import IntroText from './components/IntroText'
import IntroArt from './components/IntroArt'
import BloqTile from './components/BloqTile'

const page = () => {
  return (
    <article className="container blue-border mt-10 pb-10 h-auto items-center font-roboto-mono lowercase">
      <IntroArt />
      <IntroText />
      <div
        className='all-tiles grid grid-cols-2 px-10 gap-5'
      >
        {Array.from({ length: 3 }).map((_, i) => (
          <BloqTile key={i}/>
        ))}
      </div>
    </article>
  )
}

export default page
