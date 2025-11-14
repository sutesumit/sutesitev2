import React from 'react'

const BloqTile = () => {
  return (
    <div 
        className='
            col-span-1 p-4 blue-border flex flex-col 
            transition-all duration-300

            bg-slate-950 hover:invert
            '
    >

        {/* date */}
        <div className='text-xs text-neutral-400 opacity-50'>
            {new Date().toLocaleDateString('en-US', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            })}
        </div>

        {/* title */}
        <div className='font-medium pb-2 text-neutral-700 dark:text-neutral-200'>
            Blogs Title: Coming Soon!
        </div>

        {/* blurb */}
        <div className='text-xs text-neutral-400 line-clamp-4'>
            A small preview of thoughts, learnings, and roadblocks that will soon turn into building blocks.
        </div>
    </div>
  )
}

export default BloqTile
