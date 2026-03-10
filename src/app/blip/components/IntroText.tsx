import React from 'react'
import AsciiLogo from './AsciiLogo'

const IntroText = () => {
  return (
    <div className="px-5 py-6">
      <div className="flex flex-col items-center gap-6">
        <AsciiLogo />
        <p className="">
          Some thoughts don’t need essays. They just need somewhere to land.
          Blips are the small ones: thoughts that appear mid-commute, mid-debug, mid-coffee.
          I post them from <span className="highlight">telegram</span> or the <span className="highlight">terminal</span>, whichever is open, and whichever I’m probably procrastinating in when the brain buffer overflows.
        </p>
      </div>
    </div>
  )
}

export default IntroText
