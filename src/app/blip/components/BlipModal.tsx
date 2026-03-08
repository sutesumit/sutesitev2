'use client'

import React, { useEffect, useCallback, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion as m, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Copy, Check } from 'lucide-react'
import type { Blip } from '@/types/blip'
import ClapsCounter from '@/components/shared/ClapsCounter'
import { BloqBackground } from '@/app/bloq/components/BloqCard/parts'

type BlipModalProps = {
  blips: Blip[]
}

function formatFullDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).toLowerCase()
}

const BlipModal = ({ blips }: BlipModalProps) => {
  const searchParams = useSearchParams()
  const router = useRouter()

  const rawParam = searchParams.get('blip')
  const activeBlip = rawParam ? blips.find((b) => String(b.blip_serial) === rawParam) ?? null : null

  const currentIndex = activeBlip ? blips.findIndex(b => b.id === activeBlip.id) : -1
  const newerBlip = currentIndex > 0 ? blips[currentIndex - 1] : null
  const olderBlip = currentIndex >= 0 && currentIndex < blips.length - 1 ? blips[currentIndex + 1] : null

  const close = useCallback(() => {
    router.push('/blip', { scroll: false })
  }, [router])

  const [isCopied, setIsCopied] = useState(false)
  const [isModalHovered, setIsModalHovered] = useState(false)

  const copyLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.href)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }, [])

  const [direction, setDirection] = useState(0)

  const goToNewer = useCallback(() => {
    if (newerBlip) {
      setDirection(-1)
      router.push(`/blip?blip=${newerBlip.blip_serial}`, { scroll: false })
    }
  }, [newerBlip, router])

  const goToOlder = useCallback(() => {
    if (olderBlip) {
      setDirection(1)
      router.push(`/blip?blip=${olderBlip.blip_serial}`, { scroll: false })
    }
  }, [olderBlip, router])

  // Keyboard navigation
  useEffect(() => {
    if (!activeBlip) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowLeft') goToNewer()
      if (e.key === 'ArrowRight') goToOlder()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [activeBlip, close, goToNewer, goToOlder])

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = activeBlip ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [activeBlip])

  return (
    <AnimatePresence>
      {activeBlip && (
        <m.div
          key="blip-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={close}
          aria-modal="true"
          role="dialog"
        >
          {/* Backdrop blur */}
          <div className="absolute inset-0 bg-white/90 dark:bg-black/90" />

          {/* Modal card */}
          <m.div
            key="blip-modal-card"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            onMouseEnter={() => setIsModalHovered(true)}
            onMouseLeave={() => setIsModalHovered(false)}
            className="relative w-full max-w-[65ch] rounded-md border-l-[2px] border-l-blue-500 !border-l-solid bg-white dark:bg-[#0a0a0a] shadow-2xl font-roboto-mono lowercase"
          >
            {/* Background container that clips to rounded corners but allows main card to be overflow-visible */}
            <m.div 
              className="absolute inset-0 rounded-md overflow-hidden pointer-events-none z-0"
              initial="rest"
              animate={isModalHovered ? "hover" : "rest"}
            >
              <BloqBackground />
            </m.div>
            {/* Header bar */}
            <div className="relative z-10 flex items-center justify-between px-4 py-2 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-end w-10 h-6 pr-2 shrink-0 border-r-[1px] border-r-blue-500 !border-l-solid opacity-50 relative overflow-hidden">
                <AnimatePresence mode="popLayout" custom={direction}>
                  <m.div
                    key={activeBlip.id}
                    custom={direction}
                    variants={{
                      enter: (dir: number) => ({ x: dir < 0 ? -50 : 50, opacity: 0 }),
                      center: { x: 0, opacity: 1 },
                      exit: (dir: number) => ({ x: dir < 0 ? 50 : -50, opacity: 0 })
                    }}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400"
                  >
                    # {activeBlip.blip_serial}
                  </m.div>
                </AnimatePresence>
              </div>
              <div className="flex items-center gap-3">
                {/* Copy permalink */}
                <button
                  onClick={copyLink}
                  title={isCopied ? "copied!" : "copy permalink"}
                  className={`transition-colors relative overflow-hidden flex items-center justify-center w-7 h-7 rounded-lg ${
                    isCopied ? "text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10" : "text-slate-400 dark:text-slate-600 hover:text-blue-500 hover:bg-slate-100 dark:hover:text-blue-400 dark:hover:bg-slate-800"
                  }`}
                  aria-label={isCopied ? "copied!" : "copy permalink"}
                >
                  <AnimatePresence mode="popLayout" initial={false}>
                    {isCopied ? (
                      <m.div
                        key="check"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                      >
                        <Check size={16} strokeWidth={2.5} />
                      </m.div>
                    ) : (
                      <m.div
                        key="copy"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                      >
                        <Copy size={16} strokeWidth={2} />
                      </m.div>
                    )}
                  </AnimatePresence>
                </button>
                {/* Close */}
                <button
                  onClick={close}
                  aria-label="close"
                  className="text-slate-400 dark:text-slate-600 hover:text-slate-700 dark:hover:text-slate-200 transition-colors text-base leading-none"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Content (includes inner chevrons and sliding text) */}
            <div className="relative px-2 py-5 flex items-center min-h-40">
              {/* Left Arrow (Newer) */}
              <div className="hover:cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full shrink-0 flex justify-center">
                {newerBlip && (
                  <button
                    onClick={(e) => { e.stopPropagation(); goToNewer(); }}
                    className="text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors p-1"
                    aria-label="newer blip"
                    title="newer blip"
                  >
                    <ChevronLeft size={16} strokeWidth={1.5} />
                  </button>
                )}
              </div>

              {/* Sliding Content */}
              <div className="flex-1 overflow-hidden relative px-2">
                <AnimatePresence mode="popLayout" custom={direction}>
                  <m.div
                    key={activeBlip.id}
                    custom={direction}
                    variants={{
                      enter: (dir: number) => ({ x: dir > 0 ? 50 : -50, opacity: 0 }),
                      center: { x: 0, opacity: 1 },
                      exit: (dir: number) => ({ x: dir < 0 ? 50 : -50, opacity: 0 })
                    }}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                  >
                    <p className="text-slate-800 dark:text-slate-200 leading-relaxed text-sm">
                      {activeBlip.content}
                    </p>
                  </m.div>
                </AnimatePresence>
              </div>

              {/* Right Arrow (Older) */}
              <div className="hover:cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full shrink-0 flex justify-center">
                {olderBlip && (
                  <button
                    onClick={(e) => { e.stopPropagation(); goToOlder(); }}
                    className="text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors p-1"
                    aria-label="older blip"
                    title="older blip"
                  >
                    <ChevronRight size={16} strokeWidth={1.5} />
                  </button>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="relative z-10 flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-800">
              <div className="relative overflow-hidden flex items-center h-5">
                <AnimatePresence mode="popLayout" custom={direction}>
                  <m.time
                    key={activeBlip.id}
                    custom={direction}
                    variants={{
                      enter: (dir: number) => ({ x: dir < 0 ? -50 : 50, opacity: 0 }),
                      center: { x: 0, opacity: 1 },
                      exit: (dir: number) => ({ x: dir < 0 ? 50 : -50, opacity: 0 })
                    }}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="text-xs text-slate-400 dark:text-slate-600 block"
                  >
                    {formatFullDate(activeBlip.created_at)}
                  </m.time>
                </AnimatePresence>
              </div>
              <ClapsCounter
                postId={activeBlip.id}
                postType="blip"
                interactive={true}
                className="text-xs text-slate-400 dark:text-slate-600"
              />
            </div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  )
}

export default BlipModal
