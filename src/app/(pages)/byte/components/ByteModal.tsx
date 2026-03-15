'use client'

import React, { useEffect, useCallback, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion as m, AnimatePresence } from 'framer-motion'
import { Link, Check, X } from 'lucide-react'
import type { Byte } from '@/types/byte'
import ByteCardContent from './ByteCardContent'
import TrackView from '@/components/shared/TrackView'

type ByteModalProps = {
  bytes: Byte[]
}

const ByteModal = ({ bytes }: ByteModalProps) => {
  const searchParams = useSearchParams()
  const router = useRouter()

  const rawParam = searchParams.get('byte')
  const activeByte = rawParam ? bytes.find((b) => String(b.byte_serial) === rawParam) ?? null : null

  const currentIndex = activeByte ? bytes.findIndex(b => b.id === activeByte.id) : -1
  const newerByte = currentIndex > 0 ? bytes[currentIndex - 1] : null
  const olderByte = currentIndex >= 0 && currentIndex < bytes.length - 1 ? bytes[currentIndex + 1] : null

  const close = useCallback(() => {
    router.push('/byte', { scroll: false })
  }, [router])

  const [isCopied, setIsCopied] = useState(false)
  const [isModalHovered, setIsModalHovered] = useState(false)

  const copyLink = useCallback(() => {
    if (activeByte) {
      navigator.clipboard.writeText(`${window.location.origin}/byte/${activeByte.byte_serial}`)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    }
  }, [activeByte])

  const [direction, setDirection] = useState(0)

  const goToNewer = useCallback(() => {
    if (newerByte) {
      setDirection(-1)
      router.push(`/byte?byte=${newerByte.byte_serial}`, { scroll: false })
    }
  }, [newerByte, router])

  const goToOlder = useCallback(() => {
    if (olderByte) {
      setDirection(1)
      router.push(`/byte?byte=${olderByte.byte_serial}`, { scroll: false })
    }
  }, [olderByte, router])

  useEffect(() => {
    if (!activeByte) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowLeft') goToNewer()
      if (e.key === 'ArrowRight') goToOlder()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [activeByte, close, goToNewer, goToOlder])

  useEffect(() => {
    document.body.style.overflow = activeByte ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [activeByte])

  return (
    <AnimatePresence>
      {activeByte && (
        <m.div
          key="byte-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={close}
          aria-modal="true"
          role="dialog"
        >
          <div className="absolute inset-0 bg-white/90 dark:bg-black/90" />

          <m.div
            key="byte-modal-card"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            onMouseEnter={() => setIsModalHovered(true)}
            onMouseLeave={() => setIsModalHovered(false)}
            className="relative w-full max-w-[65ch] overflow-hidden rounded-md border-l-[2px] border-l-blue-500 !border-l-solid bg-white dark:bg-[#0a0a0a] shadow-2xl font-roboto-mono lowercase"
          >
            <ByteCardContent
              byte={activeByte}
              newerByte={newerByte}
              olderByte={olderByte}
              isHovered={isModalHovered}
              direction={direction}
              onNewerClick={goToNewer}
              onOlderClick={goToOlder}
              renderHeaderRight={() => (
                <div className="flex items-center gap-3">
                  <button
                    onClick={copyLink}
                    title={isCopied ? "copied!" : "copy permalink"}
                    className={`transition-colors relative overflow-hidden flex items-center justify-center w-7 h-7 rounded-sm ${
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
                          <Link size={16} strokeWidth={2} />
                        </m.div>
                      )}
                    </AnimatePresence>
                  </button>
                  <button
                    onClick={close}
                    aria-label="close"
                    className="transition-colors relative overflow-hidden flex items-center justify-center w-7 h-7 rounded-sm text-slate-400 dark:text-slate-600 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <X size={16} strokeWidth={2} />
                  </button>
                </div>
              )}
            />
            {activeByte && <TrackView type="byte" identifier={activeByte.byte_serial} />}
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  )
}

export default ByteModal
