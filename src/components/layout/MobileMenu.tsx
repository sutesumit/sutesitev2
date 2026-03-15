'use client'
import React, { useState } from 'react'
import { motion as m, AnimatePresence } from 'framer-motion'
import NavLink from './NavLink'
import { NAV_TABS } from '@/data/nav'

// Spring physics shared by all three lines
const springTransition = { type: "spring" as const, stiffness: 320, damping: 28 }

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
        animate={{ d: isOpen ? "M6 6L18 18" : "M4 6h16" }}
        transition={{ ...springTransition, delay: 0 }}
      />
      {/* Line 2 — slides right and fades out instead of just disappearing */}
      <m.path
        strokeWidth={2}
        animate={{
          opacity: isOpen ? 0 : 1,
          d: "M4 12h16",
          x: isOpen ? 6 : 0,
        }}
        transition={{ ...springTransition, delay: 0.04 }}
      />
      {/* Line 3 — morphs into bottom-left→top-right diagonal, stagger: 80ms */}
      <m.path
        strokeWidth={2}
        animate={{ d: isOpen ? "M6 18L18 6" : "M4 18h16" }}
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
