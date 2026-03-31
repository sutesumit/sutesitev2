'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import GamePopup from '@/games/shared/GamePopup'

const SHELF_LINES = [
  '       .--.                    .---.',
  '   .---|__|            .-.     |~~~|',
  '.--|===|--|_           |_|     |~~~|--.',
  "|  |===|  |'\\      .---!~|  .--|   |--|",
  "|%%|   |  |.'\\     |===| |--|%%|   |  |",
  "|%%|   |  |\\.'\\    |   | |__|  |   |  |",
  '|  |   |  | \\  \\   |===| |==|  |   |  |',
  "|  |   |__|  \\.'\\  |   |_|__|  |~~~|__|",
  "|  |===|--|   \\.'\\ |===|~|--|%%|~~~|--|",
  "^--^---'--^    `-' `---^-^--^--^---'--'",
] as const

const MAX_LEN = Math.max(...SHELF_LINES.map((line) => line.length))
const GRID = SHELF_LINES.map((line) => line.padEnd(MAX_LEN, ' ').split(''))
const WALKABLE_BY_ROW: Record<number, number[]> = {}

for (let row = 0; row < GRID.length; row += 1) {
  for (let col = 0; col < GRID[row].length; col += 1) {
    if (GRID[row][col] !== ' ') {
      if (!WALKABLE_BY_ROW[row]) {
        WALKABLE_BY_ROW[row] = []
      }
      WALKABLE_BY_ROW[row].push(col)
    }
  }
}

const WALKABLE_ROWS = Object.keys(WALKABLE_BY_ROW).map(Number)

const GAME_CONFIG = {
  initialBugCount: 5,
  maxMissBursts: 48,
  moveIntervalMs: 200,
  squashDurationMs: 280,
  bugSpeed: {
    minimumTicksPerMove: 1,
    randomSpeedVariantCount: 3,
  },
  movement: {
    baseReverseChance: 0.06,
    reverseChanceIncreaseByProgress: 0.28,
  },
  achievement: {
    maxMissesForSharpAim: 5,
  },
} as const

const CURSOR_CONFIG = {
  emoji: '🔨',
  hotSpotX: 4,
  hotSpotY: 26,
  svgWidth: 32,
  svgHeight: 32,
  glyphX: 2,
  glyphY: 26,
  glyphFontSize: 22,
} as const

const SHELF_RENDER_CONFIG = {
  cellWidthCh: 1,
  lineHeight: 1,
  shelfFontSizePx: 14,
  surfacePaddingPx: 32,
} as const

const BUG_RENDER_CONFIG = {
  idleFontSizePx: 13,
  squashingFontSizePx: 15,
  idleTopOffsetPx: -4,
  squashingTopOffsetPx: -1,
  squashScale: 1.1,
  facingLeftScaleX: -1,
  facingRightRotationDeg: 14,
  facingLeftRotationDeg: -14,
  wiggleAnimationMs: 550,
  wiggleStartRotationDeg: -10,
  wiggleMidRotationDeg: 10,
  wiggleMidScale: 1.08,
  popAnimationMs: 280,
  popStartScale: 1.4,
  popEndScale: 0.45,
  hoverJitterAnimationMs: 180,
  hoverJitterOffsetPx: 1,
} as const

const SPLAT_RENDER_CONFIG = {
  topOffsetPx: -1,
  animationMs: 280,
  startOpacity: 0.3,
  startScale: 1.4,
  endScale: 1,
} as const

const MISS_BURST_CONFIG = {
  newestOpacity: 0.58,
  trailOpacityStart: 0.42,
  trailOpacityDropPerBurst: 0.03,
  minimumOpacity: 0.14,
  zIndex: 1,
  animationMs: 320,
  startScale: 0.8,
  endScale: 1,
  riseDistancePx: 8,
} as const

const CELL_STYLE: React.CSSProperties = {
  display: 'inline-block',
  width: `${SHELF_RENDER_CONFIG.cellWidthCh}ch`,
  lineHeight: SHELF_RENDER_CONFIG.lineHeight,
}

const makeCursor = (emoji: string, hotSpotX: number, hotSpotY: number): string => {
  if (typeof window === 'undefined' || typeof btoa === 'undefined') {
    return 'crosshair'
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${CURSOR_CONFIG.svgWidth}" height="${CURSOR_CONFIG.svgHeight}"><text x="${CURSOR_CONFIG.glyphX}" y="${CURSOR_CONFIG.glyphY}" font-size="${CURSOR_CONFIG.glyphFontSize}">${emoji}</text></svg>`

  try {
    return `url("data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}") ${hotSpotX} ${hotSpotY}, auto`
  } catch {
    return 'crosshair'
  }
}

type Status = 'playing' | 'won'

interface Bug {
  id: number
  row: number
  col: number
  colIdx: number
  dir: 1 | -1
  speed: number
  tick: number
  alive: boolean
  squashing: boolean
}

interface MissBurst {
  id: number
  x: number
  y: number
  opacity: number
  zIndex: number
}

interface ShelfMark {
  id: number
  row: number
  col: number
}

let nextBugId = 0
let nextMissId = 0

const createInitialBugs = (): Bug[] => {
  const bugs: Bug[] = []
  const occupied = new Set<string>()

  while (bugs.length < GAME_CONFIG.initialBugCount) {
    const row = WALKABLE_ROWS[Math.floor(Math.random() * WALKABLE_ROWS.length)]
    const cols = WALKABLE_BY_ROW[row]
    const colIdx = Math.floor(Math.random() * cols.length)
    const col = cols[colIdx]
    const key = `${row},${col}`

    if (occupied.has(key)) {
      continue
    }

    occupied.add(key)
    bugs.push({
      id: nextBugId,
      row,
      col,
      colIdx,
      dir: Math.random() < 0.5 ? 1 : -1,
      speed:
        Math.floor(Math.random() * GAME_CONFIG.bugSpeed.randomSpeedVariantCount) +
        GAME_CONFIG.bugSpeed.minimumTicksPerMove,
      tick: 0,
      alive: true,
      squashing: false,
    })
    nextBugId += 1
  }

  return bugs
}

const stepBugs = (bugs: Bug[], kills: number): Bug[] => {
  const progress = kills / GAME_CONFIG.initialBugCount
  const reverseChance =
    GAME_CONFIG.movement.baseReverseChance +
    progress * GAME_CONFIG.movement.reverseChanceIncreaseByProgress

  return bugs.map((bug) => {
    if (!bug.alive || bug.squashing) {
      return bug
    }

    const nextBug = { ...bug, tick: bug.tick + 1 }
    if (nextBug.tick < nextBug.speed) {
      return nextBug
    }

    nextBug.tick = 0
    if (Math.random() < reverseChance) {
      nextBug.dir = (nextBug.dir * -1) as 1 | -1
    }

    const rowCols = WALKABLE_BY_ROW[nextBug.row]
    let nextColIdx = nextBug.colIdx + nextBug.dir
    if (nextColIdx < 0 || nextColIdx >= rowCols.length) {
      nextBug.dir = (nextBug.dir * -1) as 1 | -1
      nextColIdx = nextBug.colIdx + nextBug.dir
    }

    if (nextColIdx < 0 || nextColIdx >= rowCols.length) {
      return nextBug
    }

    const nextCol = rowCols[nextColIdx]
    const blocked = bugs.some(
      (candidate) =>
        candidate.id !== bug.id &&
        candidate.alive &&
        !candidate.squashing &&
        candidate.row === nextBug.row &&
        candidate.col === nextCol
    )

    if (!blocked) {
      nextBug.colIdx = nextColIdx
      nextBug.col = nextCol
    }

    return nextBug
  })
}

const AsciiShelf = () => {
  const [bugs, setBugs] = useState<Bug[]>([])
  const [kills, setKills] = useState(0)
  const [wrongHits, setWrongHits] = useState(0)
  const [status, setStatus] = useState<Status>('playing')
  const [missBursts, setMissBursts] = useState<MissBurst[]>([])
  const [splatMarks, setSplatMarks] = useState<ShelfMark[]>([])
  const [cursor, setCursor] = useState('crosshair')

  const surfaceRef = useRef<HTMLDivElement | null>(null)
  const bugsRef = useRef<Bug[]>([])
  const squashTimeoutsRef = useRef<number[]>([])

  useEffect(() => {
    bugsRef.current = bugs
  }, [bugs])

  useEffect(() => {
    setCursor(
      makeCursor(
        CURSOR_CONFIG.emoji,
        CURSOR_CONFIG.hotSpotX,
        CURSOR_CONFIG.hotSpotY
      )
    )
  }, [])

  useEffect(() => {
    return () => {
      for (const timeoutId of squashTimeoutsRef.current) {
        window.clearTimeout(timeoutId)
      }
      squashTimeoutsRef.current = []
    }
  }, [])

  const resetGame = useCallback(() => {
    for (const timeoutId of squashTimeoutsRef.current) {
      window.clearTimeout(timeoutId)
    }
    squashTimeoutsRef.current = []
    nextBugId = 0
    nextMissId = 0
    setBugs(createInitialBugs())
    setKills(0)
    setWrongHits(0)
    setMissBursts([])
    setSplatMarks([])
    setStatus('playing')
  }, [])

  useEffect(() => {
    resetGame()
  }, [resetGame])

  useEffect(() => {
    if (status !== 'playing') {
      return undefined
    }

    const intervalId = setInterval(() => {
      setBugs((currentBugs) => stepBugs(currentBugs, kills))
    }, GAME_CONFIG.moveIntervalMs)

    return () => clearInterval(intervalId)
  }, [kills, status])

  const liveBugs = useMemo(
    () => bugs.filter((bug) => bug.alive),
    [bugs]
  )

  const remainingBugs = liveBugs.length

  useEffect(() => {
    if (bugs.length > 0 && remainingBugs === 0) {
      setStatus('won')
    }
  }, [bugs.length, remainingBugs])

  const handleMiss = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (status !== 'playing' || !surfaceRef.current) {
      return
    }

    const bounds = surfaceRef.current.getBoundingClientRect()
    const burstId = nextMissId
    nextMissId += 1

    setWrongHits((current) => current + 1)
    setMissBursts((current) => {
      const nextBursts = current.map((burst, index, all) => {
        const depth = all.length - index
        return {
          ...burst,
          opacity: Math.max(
            MISS_BURST_CONFIG.minimumOpacity,
            MISS_BURST_CONFIG.trailOpacityStart -
              depth * MISS_BURST_CONFIG.trailOpacityDropPerBurst
          ),
          zIndex: MISS_BURST_CONFIG.zIndex,
        }
      })

      return [
        ...nextBursts,
        {
          id: burstId,
          x: event.clientX - bounds.left,
          y: event.clientY - bounds.top,
          opacity: MISS_BURST_CONFIG.newestOpacity,
          zIndex: MISS_BURST_CONFIG.zIndex,
        },
      ].slice(-GAME_CONFIG.maxMissBursts)
    })
  }, [status])

  const handleSquash = useCallback((bugId: number) => {
    if (status !== 'playing') {
      return
    }

    const targetBug = bugsRef.current.find(
      (bug) => bug.id === bugId && bug.alive && !bug.squashing
    )

    if (!targetBug) {
      return
    }

    setBugs((currentBugs) =>
      currentBugs.map((bug) => {
        if (bug.id !== bugId || !bug.alive || bug.squashing) {
          return bug
        }

        return { ...bug, squashing: true }
      })
    )

    setKills((current) => current + 1)

    const timeoutId = window.setTimeout(() => {
      setBugs((currentBugs) =>
        currentBugs.map((bug) =>
          bug.id === bugId ? { ...bug, alive: false, squashing: false } : bug
        )
      )
      setSplatMarks((current) => [
        ...current,
        {
          id: bugId,
          row: targetBug.row,
          col: targetBug.col,
        },
      ])
    }, GAME_CONFIG.squashDurationMs)
    squashTimeoutsRef.current.push(timeoutId)
  }, [status])

  const achievement = {
    unlocked:
      status === 'won' &&
      wrongHits < GAME_CONFIG.achievement.maxMissesForSharpAim,
    title: 'Sharp Aim',
    emoji: '🎯',
  }

  const bugMap = useMemo(() => {
    const map = new Map<string, Bug>()

    for (const bug of liveBugs) {
      map.set(`${bug.row},${bug.col}`, bug)
    }

    return map
  }, [liveBugs])

  const splatMap = useMemo(() => {
    const map = new Map<string, ShelfMark>()

    for (const splat of splatMarks) {
      map.set(`${splat.row},${splat.col}`, splat)
    }

    return map
  }, [splatMarks])

  return (
    <div className="flex items-center justify-center w-full">
      <div
        ref={surfaceRef}
        onClick={handleMiss}
        className="relative overflow-x-scroll inline-block max-w-full overflow-hidden"
        style={{
          cursor: status === 'playing' ? cursor : 'default',
          padding: SHELF_RENDER_CONFIG.surfacePaddingPx,
        }}
      >
        <pre
          aria-hidden="true"
          className="font-mono text-slate-700 dark:text-slate-300"
          style={{
            fontSize: SHELF_RENDER_CONFIG.shelfFontSizePx,
            lineHeight: SHELF_RENDER_CONFIG.lineHeight,
            letterSpacing: 0,
            margin: 0,
            padding: 0,
            whiteSpace: 'pre',
            wordSpacing: 0,
            WebkitFontSmoothing: 'none',
            MozOsxFontSmoothing: 'unset',
          }}
        >
          {GRID.map((row, rowIndex) => (
            <span key={rowIndex}>
              {row.map((character, colIndex) => {
                const bug = bugMap.get(`${rowIndex},${colIndex}`)
                const splat = splatMap.get(`${rowIndex},${colIndex}`)

                if (!bug && !splat) {
                  return (
                    <span key={colIndex} style={CELL_STYLE}>
                      {character}
                    </span>
                  )
                }

                return (
                  <span
                    key={colIndex}
                    style={{
                      ...CELL_STYLE,
                      overflow: 'visible',
                      position: 'relative',
                    }}
                  >
                    <span style={{ visibility: 'hidden' }}>{character}</span>
                    {bug ? (
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()
                          handleSquash(bug.id)
                        }}
                        aria-label="Squash bug"
                        className="group absolute left-1/2 top-0 bg-transparent p-0 leading-none"
                        style={{
                          border: 'none',
                          cursor: 'inherit',
                          width: `${SHELF_RENDER_CONFIG.cellWidthCh}ch`,
                          transform: 'translateX(-50%)',
                        }}
                      >
                        <span
                          className={
                            bug.squashing
                              ? ''
                              : `inline-block rotate-90 group-hover:brightness-200 group-hover:animate-[shelf-bug-jitter_${BUG_RENDER_CONFIG.hoverJitterAnimationMs}ms_linear_infinite]`
                          }
                        >
                          <span
                            className={
                              bug.squashing
                                ? `animate-[shelf-bug-pop_${BUG_RENDER_CONFIG.popAnimationMs}ms_ease-out_forwards]`
                                : `animate-[shelf-bug-wiggle_${BUG_RENDER_CONFIG.wiggleAnimationMs}ms_ease-in-out_infinite]`
                            }
                            style={{
                              display: 'inline-block',
                              fontSize: bug.squashing
                                ? BUG_RENDER_CONFIG.squashingFontSizePx
                                : BUG_RENDER_CONFIG.idleFontSizePx,
                              lineHeight: SHELF_RENDER_CONFIG.lineHeight,
                              pointerEvents: 'none',
                              position: 'relative',
                              top: bug.squashing
                                ? BUG_RENDER_CONFIG.squashingTopOffsetPx
                                : BUG_RENDER_CONFIG.idleTopOffsetPx,
                              transform: bug.squashing
                                ? `scale(${BUG_RENDER_CONFIG.squashScale})`
                                : `${bug.dir === -1 ? `scaleX(${BUG_RENDER_CONFIG.facingLeftScaleX}) ` : ''}rotate(${bug.dir === 1 ? BUG_RENDER_CONFIG.facingRightRotationDeg : BUG_RENDER_CONFIG.facingLeftRotationDeg}deg)`,
                              transformOrigin: 'center',
                            }}
                          >
                            {bug.squashing ? '💥' : '🐞'}
                          </span>
                        </span>
                      </button>
                    ) : (
                      <span
                        className={`absolute left-1/2 top-0 animate-[shelf-splat-settle_${SPLAT_RENDER_CONFIG.animationMs}ms_ease-out_forwards] leading-none pointer-events-none`}
                        style={{
                          transform: 'translateX(-50%)',
                          top: SPLAT_RENDER_CONFIG.topOffsetPx,
                        }}
                      >
                        💥
                      </span>
                    )}
                  </span>
                )
              })}
              {rowIndex < GRID.length - 1 ? '\n' : null}
            </span>
          ))}
        </pre>

        {missBursts.map((burst) => (
          <span
            key={burst.id}
            className={`pointer-events-none absolute animate-[shelf-miss-puff_${MISS_BURST_CONFIG.animationMs}ms_ease-out_forwards]`}
            style={{
              left: burst.x,
              opacity: burst.opacity,
              top: burst.y,
              transform: 'translate(-50%, -50%)',
              zIndex: burst.zIndex,
            }}
          >
            💨
          </span>
        ))}

        <GamePopup
          isOpen={status === 'won'}
          type="win"
          emoji="🐞"
          scores={[
            { label: 'Bugs squashed', value: kills },
            { label: 'Missed smashes', value: wrongHits },
          ]}
          onRestart={resetGame}
          achievement={achievement}
          showConfetti={achievement.unlocked}
          hint={
            achievement.unlocked
              ? undefined
              : `Keep misses under ${GAME_CONFIG.achievement.maxMissesForSharpAim} for Sharp Aim 🎯`
          }
        />
      </div>

      <style>{`
        @keyframes shelf-bug-wiggle {
          0%, 100% { transform: rotate(${BUG_RENDER_CONFIG.wiggleStartRotationDeg}deg) scale(1); }
          50% { transform: rotate(${BUG_RENDER_CONFIG.wiggleMidRotationDeg}deg) scale(${BUG_RENDER_CONFIG.wiggleMidScale}); }
        }

        @keyframes shelf-bug-pop {
          0% { transform: scale(${BUG_RENDER_CONFIG.popStartScale}); opacity: 1; }
          100% { transform: scale(${BUG_RENDER_CONFIG.popEndScale}); opacity: 0; }
        }

        @keyframes shelf-bug-jitter {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-${BUG_RENDER_CONFIG.hoverJitterOffsetPx}px); }
          75% { transform: translateX(${BUG_RENDER_CONFIG.hoverJitterOffsetPx}px); }
        }

        @keyframes shelf-miss-puff {
          0% { transform: translate(-50%, -50%) scale(${MISS_BURST_CONFIG.startScale}); }
          100% { transform: translate(-50%, calc(-50% - ${MISS_BURST_CONFIG.riseDistancePx}px)) scale(${MISS_BURST_CONFIG.endScale}); }
        }

        @keyframes shelf-splat-settle {
          0% { opacity: ${SPLAT_RENDER_CONFIG.startOpacity}; transform: translateX(-50%) scale(${SPLAT_RENDER_CONFIG.startScale}); }
          100% { opacity: 1; transform: translateX(-50%) scale(${SPLAT_RENDER_CONFIG.endScale}); }
        }
      `}</style>
    </div>
  )
}

export default AsciiShelf
