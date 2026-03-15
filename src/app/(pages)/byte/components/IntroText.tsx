import React from 'react'
import AsciiByteGame from './AsciiByteGame'

const IntroText = () => {
  return (
    <div className="px-5 py-6">
      <div className="flex flex-col items-center gap-6">
        <AsciiByteGame />
        <p className="">
          Some thoughts don&apos;t need essays. They just need somewhere to land.
          Bytes are the small ones: thoughts that appear mid-commute, mid-debug, mid-coffee.
          I post them from <span className="highlight">telegram</span> or the <span className="highlight">terminal</span>, whichever is open, and whichever I&apos;m probably procrastinating in when the brain buffer overflows.
        </p>
      </div>
    </div>
  )
}

export default IntroText
