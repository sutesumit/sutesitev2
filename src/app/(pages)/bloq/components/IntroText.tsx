import React from 'react'

import TelegramChannelLink from '@/components/shared/TelegramChannelLink'

const IntroText = () => {
  return (
    <div className="px-5 py-4">
      <p className="">
        This is my <span className='highlight italic'>Bloq</span>spot, because every time I learn something new, I hit one. Here I turn those roadblocks into building blocks (or at least try to), and try to stay DRY by not repeating the same mistakes. It&apos;s messy, curious, and permanently under renovation. Stay connected on the <TelegramChannelLink className="" label="telegram channel" /> for latest bloqs.
      </p>
    </div>
  )
}

export default IntroText
