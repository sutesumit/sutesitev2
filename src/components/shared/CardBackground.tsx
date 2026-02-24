'use client'

import { motion as m } from 'framer-motion'

export const CardBackground = () => (
  <m.div
    variants={{
      rest: { scale: 1, opacity: 0, rotate: 0, y: -100 },
      hover: { scale: 6, opacity: 0.4, rotate: 45 },
    }}
    animate={undefined}
    transition={{ duration: 0.5, ease: "easeOut" }}
    className="backdrop flex rounded-lg bg-blue-400 dark:bg-blue-900 inset-0 -z-10 absolute opacity-25"
  />
)
