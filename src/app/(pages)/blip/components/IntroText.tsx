import React from 'react'
import AsciiShelf from '@/games/ascii-shelf'
import TelegramChannelLink from '@/components/shared/TelegramChannelLink'

const IntroText = () => {
  return (
    <div className="px-5 py-6">
      <div className="flex flex-col items-center gap-6">
        <AsciiShelf />
        <p className="">
          <span className='highlight'>Blips</span> are a collection of terms, concepts, and definitions I&apos;ve run into and decided my future self shouldn&apos;t have to rediscover. Think of it as a personal wiki. A place to refine vocabulary, reduce ambiguity, and express intent more clearly when working with humans, code, or increasingly, agents. I add them through <span className='highlight'>Telegram</span> or the <span className="highlight">terminal</span> when a concept feels worth keeping. Join the <TelegramChannelLink className="" label="telegram channel" /> to follow along.
        </p>
      </div>
    </div>
  )
}

export default IntroText
