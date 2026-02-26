'use client'

import React from 'react'
import { motion as m } from 'framer-motion'
import { CardBackground } from '@/components/shared/CardBackground'

interface IntroCardProps {
  children: React.ReactNode
}

const IntroCard = ({ children }: IntroCardProps) => {
  return (
    <m.div 
      initial="rest"
      whileHover="hover"
      animate="rest"
      className="relative overflow-hidden blue-border mt-10 h-auto items-center font-roboto-mono"
    >
      <CardBackground />
      {children}
    </m.div>
  )
}

export default IntroCard
