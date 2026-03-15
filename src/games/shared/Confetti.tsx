'use client'

import React, { useMemo } from 'react'
import { motion as m } from 'motion/react'

interface ConfettiProps {
  emoji?: string
}

const Confetti: React.FC<ConfettiProps> = ({ emoji = '🎉' }) => {
  const particles = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 1.5 + Math.random() * 25,
      rotation: Math.random() * 360,
      scale: 0.8 + Math.random() * 0.4,
    }))
  }, [])

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
      {particles.map((particle) => (
        <m.span
          key={particle.id}
          className="absolute text-2xl"
          style={{
            left: `${particle.x}%`,
            top: '-20px',
            rotate: `${particle.rotation}deg`,
            scale: particle.scale,
          }}
          initial={{ opacity: 1, y: -20 }}
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
