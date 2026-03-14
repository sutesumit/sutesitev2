import React from 'react'
import AsciiLogo from './AsciiLogo'

const IntroText = () => {
  return (
    <div className="px-5 py-6">
      <div className="flex flex-col items-center gap-6">
        <AsciiLogo />
        <p className="">
          <span className='highlight'>Blips</span> are a glossary of terms, concepts, and definitions I&apos;ve run into and decided my future self shouldn&apos;t have to rediscover. Think of it as a personal wiki. A place to refine vocabulary, reduce ambiguity, and express intent more clearly when working with humans, code, or increasingly, agents.
        </p>
      </div>
    </div>
  )
}

export default IntroText
