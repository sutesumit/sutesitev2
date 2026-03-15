'use client'

import React from 'react'
import { motion as m } from 'motion/react'
import type { GamePopupProps } from './types'
import Confetti from './Confetti'

const GamePopup: React.FC<GamePopupProps> = ({
  isOpen,
  emoji,
  score,
  onRestart,
  restartLabel = '[ Play Again ]',
  achievement,
  type,
}) => {
  return (
    <>
      {isOpen && (
        <m.div
          className="absolute inset-0 flex items-center justify-center z-20 pointer-events-auto bg-black/50 dark:bg-black/70"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {type === 'win' && <Confetti emoji={emoji} />}
          <m.div
            className="flex flex-col items-center gap-2 pointer-events-auto border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-6 py-4 font-mono"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <span className="text-4xl">{emoji}</span>
            {achievement?.unlocked && (
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                {achievement.emoji} {achievement.title}
              </span>
            )}
            <span className="text-[10px] text-slate-600 dark:text-slate-400">
              {score.label}: {score.value}
            </span>
            <button
              onClick={onRestart}
              className="text-[10px] uppercase tracking-widest text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 hover:bg-blue-200 dark:hover:bg-blue-950 px-4 py-2 transition-colors"
            >
              {restartLabel}
            </button>
          </m.div>
        </m.div>
      )}
    </>
  )
}

export default GamePopup
