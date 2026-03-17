'use client'

import React, { useMemo } from 'react'
import { motion as m } from 'motion/react'

interface ConfettiProps {
  emoji?: string
}

const Confetti: React.FC<ConfettiProps> = ({ emoji = '🎉' }) => {
  const particles = useMemo(() => {
    return Array.from({ length: 100 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      startY: -30 - Math.random() * 100, // Varies from -130px to -30px
      delay: Math.random() * 0.8,
      duration: 2.5 + Math.random() * 18,
      rotation: Math.random() * 360,
      scale: 0.7 + Math.random() * 0.5,
    }))
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-10">
      {particles.map((particle) => (
        <m.span
          key={particle.id}
          className="absolute text-2xl"
          style={{
            left: `${particle.x}%`,
            top: particle.startY,
            rotate: `${particle.rotation}deg`,
            scale: particle.scale,
          }}
          initial={{ opacity: 1 }}
          animate={{ opacity: 0, y: '100vh' }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            ease: 'linear',
          }}
        >
          {emoji}
        </m.span>
      ))}
    </div>
  )
}

export default Confetti
