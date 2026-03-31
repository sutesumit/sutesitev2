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
const INITIAL_BUG_COUNT = 8
const MAX_MISS_BURSTS = 48
const MOVE_MS = 150
const SQUASH_MS = 280
const CELL_STYLE: React.CSSProperties = {
  display: 'inline-block',
  width: '1ch',
  lineHeight: 1,
}

const makeCursor = (emoji: string, hotSpotX: number, hotSpotY: number): string => {
  if (typeof window === 'undefined' || typeof btoa === 'undefined') {
    return 'crosshair'
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><text x="2" y="26" font-size="22">${emoji}</text></svg>`

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

  while (bugs.length < INITIAL_BUG_COUNT) {
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
      speed: Math.floor(Math.random() * 3) + 1,
      tick: 0,
      alive: true,
      squashing: false,
    })
    nextBugId += 1
  }

  return bugs
}

const stepBugs = (bugs: Bug[], kills: number): Bug[] => {
  const progress = kills / INITIAL_BUG_COUNT
  const reverseChance = 0.06 + progress * 0.28

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
    setCursor(makeCursor('🔨', 4, 26))
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
    }, MOVE_MS)

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
          opacity: Math.max(0.14, 0.42 - depth * 0.03),
          zIndex: 1,
        }
      })

      return [
        ...nextBursts,
        {
          id: burstId,
          x: event.clientX - bounds.left,
          y: event.clientY - bounds.top,
          opacity: 0.58,
          zIndex: 1,
        },
      ].slice(-MAX_MISS_BURSTS)
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
    }, SQUASH_MS)
    squashTimeoutsRef.current.push(timeoutId)
  }, [status])

  const achievement = {
    unlocked: status === 'won' && wrongHits < INITIAL_BUG_COUNT,
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
        className="relative overflow-x-scroll inline-block max-w-full overflow-hidden p-8"
        style={{ cursor: status === 'playing' ? cursor : 'default' }}
      >
        <pre
          aria-hidden="true"
          className="font-mono text-[14px] leading-[1] text-slate-700 dark:text-slate-300"
          style={{
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
                        className="absolute left-1/2 top-0 bg-transparent p-0 leading-none"
                        style={{
                          border: 'none',
                          cursor: 'inherit',
                          width: '1ch',
                          transform: 'translateX(-50%)',
                        }}
                      >
                        <span
                          className={bug.squashing ? 'animate-[shelf-bug-pop_0.28s_ease-out_forwards]' : 'animate-[shelf-bug-wiggle_0.55s_ease-in-out_infinite]'}
                          style={{
                            display: 'inline-block',
                            fontSize: bug.squashing ? 15 : 13,
                            lineHeight: 1,
                            pointerEvents: 'none',
                            position: 'relative',
                            top: bug.squashing ? -1 : -4,
                            transform: bug.squashing
                              ? 'scale(1.1)'
                              : `${bug.dir === -1 ? 'scaleX(-1) ' : ''}rotate(${bug.dir === 1 ? 14 : -14}deg)`,
                            transformOrigin: 'center',
                          }}
                        >
                          {bug.squashing ? '💥' : '🐞'}
                        </span>
                      </button>
                    ) : (
                      <span
                        className="absolute left-1/2 top-0 animate-[shelf-splat-settle_0.28s_ease-out_forwards] leading-none pointer-events-none"
                        style={{
                          transform: 'translateX(-50%)',
                          top: -1,
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
            className="pointer-events-none absolute animate-[shelf-miss-puff_0.32s_ease-out_forwards]"
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
          score={{ label: 'Bugs squashed', value: kills }}
          onRestart={resetGame}
          achievement={achievement}
          showConfetti={achievement.unlocked}
          hint={achievement.unlocked ? undefined : `Keep misses under ${INITIAL_BUG_COUNT} for Sharp Aim 🎯`}
        />
      </div>

      <style>{`
        @keyframes shelf-bug-wiggle {
          0%, 100% { transform: rotate(-10deg) scale(1); }
          50% { transform: rotate(10deg) scale(1.08); }
        }

        @keyframes shelf-bug-pop {
          0% { transform: scale(1.4); opacity: 1; }
          100% { transform: scale(0.45); opacity: 0; }
        }

        @keyframes shelf-miss-puff {
          0% { transform: translate(-50%, -50%) scale(0.8); }
          100% { transform: translate(-50%, calc(-50% - 8px)) scale(1); }
        }

        @keyframes shelf-splat-settle {
          0% { opacity: 0.3; transform: translateX(-50%) scale(1.4); }
          100% { opacity: 1; transform: translateX(-50%) scale(1); }
        }
      `}</style>
    </div>
  )
}

export default AsciiShelf
