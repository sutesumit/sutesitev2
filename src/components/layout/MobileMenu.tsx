'use client'
import React, { useState } from 'react'
import { motion as m, AnimatePresence } from 'framer-motion'
import NavLink from './NavLink'
import { NAV_TABS } from '@/data/nav'

// Spring physics shared by all three lines - softened for smoother feel
const springTransition = { type: "spring" as const, stiffness: 260, damping: 25 }

const menuVariants = {
  closed: {
    opacity: 0,
    y: -10,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 30,
    },
  },
  open: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 30,
      staggerChildren: 0.04,
      delayChildren: 0.05,
    },
  },
}

const itemVariants = {
  closed: { opacity: 0, scale: 0.95, y: 5 },
  open: { opacity: 1, scale: 1, y: 0 },
}

const MenuIcon = ({ isOpen }: { isOpen: boolean }) => {
  return (
    // Rotation: SVG spins 180° when open
    <m.svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 22 22"
      strokeLinecap="round"
      // animate={{ rotate: isOpen ? 180 : 0 }}
      transition={springTransition}
    >
      {/* Line 1 — morphs into top-left→bottom-right diagonal, stagger: 0ms */}
      <m.path
        strokeWidth={2}
        animate={{ d: isOpen ? "M6 6 L18 18" : "M4 6 L20 6" }}
        transition={{ ...springTransition, delay: 0 }}
      />
      {/* Line 2 — slowly converges into a point at the center and fades out */}
      <m.path
        strokeWidth={2}
        animate={{
          d: isOpen ? "M12 12 L12 12" : "M4 12 L20 12",
          // The line physically shrinks into the center while fading
          opacity: isOpen ? 0 : 1,
        }}
        transition={{
          // Slowly morph the path shape
          d: { type: "spring", stiffness: 200, damping: 28, delay: 0.04 },
          // Fade out only right as it gets extremely small
          opacity: { duration: 0.2, delay: isOpen ? 0.1 : 0 },
        }}
      />
      {/* Line 3 — morphs into bottom-left→top-right diagonal, stagger: 80ms */}
      <m.path
        strokeWidth={2}
        animate={{ d: isOpen ? "M6 18 L18 6" : "M4 18 L20 18" }}
        transition={{ ...springTransition, delay: 0.08 }}
      />
    </m.svg>
  )
}

const MobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false)

  const handleLinkClick = () => {
    setIsOpen(false)
  }

  return (
    <>
      {/* Scale pulse: brief press-down feedback on tap */}
      <m.button
        className="opacity-50 hover:opacity-100"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
        whileTap={{ scale: 0.82 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
      >
        <MenuIcon isOpen={isOpen} />
      </m.button>

      <AnimatePresence>
        {isOpen && (
          <m.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuVariants}
            className="absolute top-full left-0 right-0 border-b-2 border-slate-300 dark:border-slate-700 backdrop-blur-3xl bg-white/90 dark:bg-neutral-950/90"
          >
            <ul className="flex flex-col gap-3 items-center py-4">
              <m.li variants={itemVariants}>
                <NavLink href="/about" vertical onClick={handleLinkClick}>about</NavLink>
              </m.li>
              {NAV_TABS.map((tab) => (
                <m.li key={tab.href} variants={itemVariants}>
                  <NavLink href={tab.href} vertical onClick={handleLinkClick}>{tab.title}</NavLink>
                </m.li>
              ))}
            </ul>
          </m.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default MobileMenu
