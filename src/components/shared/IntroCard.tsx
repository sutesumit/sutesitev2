'use client'

import React from 'react'
import { motion as m } from 'framer-motion'
import { CardBackground } from '@/components/shared/CardBackground'
import { cn } from '@/lib/utils'

interface IntroCardProps {
  children: React.ReactNode
  className?: string
}

const IntroCard = ({ children, className }: IntroCardProps) => {
  return (
    <m.div 
      initial="rest"
      whileHover="hover"
      animate="rest"
      className={cn(
        "relative overflow-hidden blue-border h-auto items-center font-roboto-mono",
        className
      )}
    >
      <CardBackground />
      {children}
    </m.div>
  )
}

export default IntroCard
