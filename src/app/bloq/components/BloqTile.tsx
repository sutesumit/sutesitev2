'use client'
import React from 'react'
import { motion as m } from 'framer-motion'

const BloqTile = () => {


    return (
      <m.div
        className="
            relative overflow-hidden
            col-span-1 p-4 blue-border flex flex-col 
            transition-all duration-300 cursor-pointer
            "
        initial="rest"
        whileHover="hover"
        animate="rest"
      >
        <m.div
          variants={{
            rest: { scale: 0.2, opacity: 0, rotate: 0, y: -100 },
            hover: { scale: 3, opacity: 0.5, rotate: 45 },
          }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={`backdrop rounded-lg bg-blue-400 dark:bg-blue-900 inset-0 -z-10 absolute opacity-25`}
        ></m.div>

        {/* date */}
        <div className="text-xs opacity-50">
          {new Date().toLocaleDateString("en-US", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </div>

        {/* title */}
        <div className="font-medium pb-2">Blogs Title: Coming Soon!</div>

        {/* blurb */}
        <div className="text-xs line-clamp-4">
          A small preview of thoughts, learnings, and roadblocks that will soon
          turn into building blocks.
        </div>
      </m.div>
    );
}

export default BloqTile
