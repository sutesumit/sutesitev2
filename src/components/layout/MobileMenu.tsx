'use client'
import React, { useState } from 'react'
import { motion as m, AnimatePresence } from 'framer-motion'
import NavLink from './NavLink'
import { NAV_TABS } from '@/data/nav'

const springTransition = { type: 'spring' as const, stiffness: 260, damping: 25 }

const menuVariants = {
  closed: {
    opacity: 0,
    y: -10,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 30,
    },
  },
  open: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
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
    <m.svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 22 22"
      strokeLinecap="round"
      initial={false}
      animate={{ rotate: isOpen ? 180 : 0 }}
      transition={springTransition}
    >
      <m.path
        strokeWidth={2}
        d="M4 6 L20 6"
        initial={false}
        animate={{
          rotate: isOpen ? 45 : 0,
          x: isOpen ? 2 : 0,
          y: isOpen ? 6 : 0,
        }}
        style={{ originX: '50%', originY: '50%' }}
        transition={springTransition}
      />
      <m.path
        strokeWidth={2}
        d="M4 12 L20 12"
        initial={false}
        animate={{
          opacity: isOpen ? 0 : 1,
          scaleX: isOpen ? 0 : 1,
        }}
        style={{ originX: '50%', originY: '50%' }}
        transition={springTransition}
      />
      <m.path
        strokeWidth={2}
        d="M4 18 L20 18"
        initial={false}
        animate={{
          rotate: isOpen ? -45 : 0,
          x: isOpen ? 2 : 0,
          y: isOpen ? -6 : 0,
        }}
        style={{ originX: '50%', originY: '50%' }}
        transition={springTransition}
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
      <m.button
        className="opacity-50 hover:opacity-100"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
        whileTap={{ scale: 0.82 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
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
