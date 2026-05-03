import React, { useMemo } from 'react'
import { AnimatePresence, motion as m } from 'framer-motion'

const sunPath = "M11 15C13.2091 15 15 13.2091 15 11C15 8.79086 13.2091 7 11 7C8.79086 7 7 8.79086 7 11C7 13.2091 8.79086 15 11 15Z"
const moonPath = "M11 15C13.2091 15 15 13.2091 15 11C10.3643 13.1535 9.59148 10.4046 11 7C8.79086 7 7 8.79086 7 11C7 13.2091 8.79086 15 11 15Z"

const rayVariants = {
  hidden: { opacity: 0, pathLength: 0 },
  visible: {
    opacity: 1,
    pathLength: 1,
    transition: { duration: 0.3, ease: 'easeInOut' as const },
  },
}

const ThemeIcon = ({ theme }: { theme: string | undefined }) => {
  const currentPath = useMemo(() => (theme === 'dark' ? sunPath : moonPath), [theme])
  const isDark = theme === 'dark'

  return (
    <m.svg
      className="relative overflow-visible"
      width="16"
      height="16"
      viewBox="0 0 22 22"
      fill="currentColor"
      stroke="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      initial={false}
      animate={{
        scale: isDark ? 1.1 : 1.5,
        opacity: 1,
        rotate: isDark ? 0 : 180,
        transition: { duration: 0.3, ease: 'easeInOut' },
      }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <m.path
          key={currentPath}
          stroke="currentColor"
          strokeWidth="1"
          d={currentPath}
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.85, opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
        />
      </AnimatePresence>
      <AnimatePresence>
        {isDark && (
          <m.g
            key="rays"
            strokeWidth="2"
            variants={rayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <m.path d="M11 1V3" />
            <m.path d="M18.07 3.93L16.66 5.34" />
            <m.path d="M19 11H21" />
            <m.path d="M16.66 16.66L18.07 18.07" />
            <m.path d="M11 19V21" />
            <m.path d="M5.34 16.66L3.93 18.07" />
            <m.path d="M1 11H3" />
            <m.path d="M3.93 3.93L5.34 5.34" />
          </m.g>
        )}
      </AnimatePresence>
    </m.svg>
  )
}

export default ThemeIcon
