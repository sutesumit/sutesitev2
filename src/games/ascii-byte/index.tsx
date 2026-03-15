"use client";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { cn } from "@/lib/utils";
import GamePopup from "@/games/shared/GamePopup";
import { formatTime } from "@/games/shared/utils";

type ColorKey = "blue" | "yellow" | "yellowBright" | "red" | "redBright" | "white" | "gray";

const COLORS: Record<ColorKey, { hex: string; tw: string }> = {
  blue: { hex: "#3B82F6", tw: "text-blue-500" },
  yellow: { hex: "#EAB308", tw: "text-yellow-500" },
  yellowBright: { hex: "#FDE047", tw: "text-yellow-300" },
  red: { hex: "#EF4444", tw: "text-red-500" },
  redBright: { hex: "#F87171", tw: "text-red-400" },
  white: { hex: "#F9FAFB", tw: "text-slate-50" },
  gray: { hex: "#9CA3AF", tw: "text-slate-400" },
};

const CHARACTERS = ["{", "}", "[", "]", "<", ">", "/", "*", "+", "-", "&", "|", "!", ";", "?", "(", ")", "#", "$", "%", "^"];

const UNDO_TIMEOUT_START_MS = 2000;
const UNDO_TIMEOUT_END_MS = 800;

const LOGO: [string, ColorKey][][] = [
  [["██████╗ ", "yellow"], ["██╗  ██╗", "yellow"], ["████████╗", "red"], ["███████╗", "red"]],
  [["██╔══██╗", "yellow"], ["╚██╗██╔╝", "yellowBright"], ["╚══██╔══╝", "red"], ["██╔════╝", "redBright"]],
  [["██████╔╝", "yellowBright"], [" ╚████╔╝", "yellowBright"], ["   ██║   ", "redBright"], ["█████╗  ", "redBright"]],
  [["██╔══██╗", "white"], ["  ╚██╔╝ ", "yellowBright"], ["   ██║   ", "redBright"], ["██╔══╝  ", "red"]],
  [["╚█████╔╝", "white"], ["   ██║  ", "white"], ["   ██║   ", "red"], ["███████╗", "red"]],
  [[" ╚════╝ ", "gray"], ["   ╚═╝  ", "gray"], ["   ╚═╝   ", "red"], ["╚══════╝", "red"]],
];

interface Cell {
  ch: string;
  correct: ColorKey;
  revealed: boolean;
  isEmpty: boolean;
}

const buildGrid = (): Cell[][] =>
  LOGO.map((segs) => {
    const row: Cell[] = [];
    for (const [text, ck] of segs)
      for (const ch of text) row.push({ 
        ch, 
        correct: ck, 
        revealed: ch === ' ',
        isEmpty: ch === ' ' 
      });
    return row;
  });

const TOTAL_CELLS = LOGO.reduce(
  (sum, segs) => sum + segs.reduce((s, [t]) => s + [...t].filter(ch => ch !== ' ').length, 0),
  0
);

interface ParticleProps {
  x: number;
  y: number;
  color: string;
  onDone: () => void;
}

function Particle({ x, y, color, onDone }: ParticleProps) {
  const char = useMemo(() => CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)], []);
  const [style, setStyle] = useState<React.CSSProperties>({
    position: "fixed",
    left: x,
    top: y,
    color: color,
    fontSize: "10px",
    fontWeight: "bold",
    pointerEvents: "none",
    zIndex: 9999,
    transform: "translate(-50%,-50%)",
    opacity: 1,
  });

  useEffect(() => {
    const angle = Math.random() * Math.PI * 2;
    const dist = 15 + Math.random() * 25;
    const dx = Math.cos(angle) * dist;
    const dy = Math.sin(angle) * dist;

    const t1 = setTimeout(() => {
      setStyle((s) => ({
        ...s,
        transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) rotate(${Math.random() * 90 - 45}deg)`,
        opacity: 0,
        transition: "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s ease-in 0.1s",
      }));
    }, 10);

    const t2 = setTimeout(onDone, 700);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [onDone]);

  return <div style={style}>{char}</div>;
}

interface ParticleData {
  id: number;
  x: number;
  y: number;
  color: string;
}

interface GameState {
  started: boolean;
  finished: boolean;
  elapsed: number;
  revealedCount: number;
  revealedOrder: string[];
  progressColor: ColorKey | null;
}

const MAX_PARTICLES = 100;

export default function AsciiByteGame() {
  const [grid, setGrid] = useState<Cell[][]>(buildGrid);
  const [particles, setParticles] = useState<ParticleData[]>([]);
  const [gameState, setGameState] = useState<GameState>({
    started: false,
    finished: false,
    elapsed: 0,
    revealedCount: 0,
    revealedOrder: [],
    progressColor: null,
  });

  const gridRef = useRef<Cell[][]>(grid);
  const gameStateRef = useRef<GameState>(gameState);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const particleIdRef = useRef(0);
  const pendingRevealsRef = useRef<Set<string>>(new Set());
  const rafRef = useRef<number | null>(null);

  gridRef.current = grid;
  gameStateRef.current = gameState;

  useEffect(() => {
    if (gameState.started && !gameState.finished) {
      timerRef.current = setInterval(() => {
        setGameState((prev) => ({ ...prev, elapsed: prev.elapsed + 1 }));
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState.started, gameState.finished]);

  useEffect(() => {
    if (gameState.revealedCount >= TOTAL_CELLS && !gameState.finished) {
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
      setGameState((prev) => ({ ...prev, finished: true }));
    }
  }, [gameState.revealedCount, gameState.finished]);

  const getUndoTimeout = useCallback(() => {
    const pct = gameStateRef.current.revealedCount / TOTAL_CELLS;
    return UNDO_TIMEOUT_START_MS - pct * (UNDO_TIMEOUT_START_MS - UNDO_TIMEOUT_END_MS);
  }, []);

  const undoLastCell = useCallback(() => {
    const current = gameStateRef.current;
    if (current.finished || current.revealedOrder.length === 0) return;

    const lastKey = current.revealedOrder[current.revealedOrder.length - 1];
    const [r, c] = lastKey.split(",").map(Number);

    setGrid((prevGrid) => {
      const cell = prevGrid[r]?.[c];
      if (!cell || !cell.revealed) return prevGrid;
      const newGrid = prevGrid.map((row) => [...row]);
      newGrid[r][c] = { ...cell, revealed: false };
      return newGrid;
    });

    setGameState((prev) => ({
      ...prev,
      revealedCount: Math.max(0, prev.revealedCount - 1),
      revealedOrder: prev.revealedOrder.slice(0, -1),
      progressColor: null,
    }));
  }, []);

  const startUndoTimer = useCallback(() => {
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    
    const current = gameStateRef.current;
    if (current.finished || current.revealedOrder.length === 0) return;

    undoTimerRef.current = setTimeout(() => {
      undoLastCell();
      startUndoTimer();
    }, getUndoTimeout());
  }, [undoLastCell, getUndoTimeout]);

  const flushPendingReveals = useCallback(() => {
    if (pendingRevealsRef.current.size === 0) {
      rafRef.current = null;
      return;
    }

    const pending = pendingRevealsRef.current;
    pendingRevealsRef.current = new Set();

    const currentGrid = gridRef.current;
    let hasChanges = false;
    const newGrid = currentGrid.map((row) => [...row]);
    const newParticles: ParticleData[] = [];
    let cellsRevealed = 0;
    const newlyRevealedKeys: string[] = [];

    pending.forEach((key) => {
      const [r, c] = key.split(",").map(Number);
      const cell = currentGrid[r]?.[c];
      if (cell && !cell.revealed && !cell.isEmpty) {
        hasChanges = true;
        newGrid[r][c] = { ...cell, revealed: true };
        cellsRevealed++;
        newlyRevealedKeys.push(key);

        for (let i = 0; i < 7; i++) {
          newParticles.push({
            id: ++particleIdRef.current,
            x: 0,
            y: 0,
            color: COLORS[cell.correct].hex,
          });
        }
      }
    });

    if (hasChanges) {
      setGrid(newGrid);

      if (newParticles.length > 0) {
        setParticles((prev) => {
          const combined = [...prev, ...newParticles];
          return combined.length > MAX_PARTICLES
            ? combined.slice(combined.length - MAX_PARTICLES)
            : combined;
        });
      }

      const lastKey = newlyRevealedKeys[newlyRevealedKeys.length - 1];
      const [lastR, lastC] = lastKey.split(",").map(Number);
      const lastCell = currentGrid[lastR]?.[lastC];

      setGameState((prev) => ({
        ...prev,
        started: prev.started || true,
        revealedCount: prev.revealedCount + cellsRevealed,
        revealedOrder: [...prev.revealedOrder, ...newlyRevealedKeys],
        progressColor: lastCell?.correct ?? prev.progressColor,
      }));

      startUndoTimer();
    }

    rafRef.current = null;
  }, [startUndoTimer]);

  const handleMouseOver = useCallback(
    (r: number, c: number, e: React.MouseEvent) => {
      const cell = gridRef.current[r]?.[c];
      if (cell?.revealed || cell?.isEmpty) return;

      const key = `${r},${c}`;
      if (pendingRevealsRef.current.has(key)) return;

      pendingRevealsRef.current.add(key);

      const clientX = e.clientX;
      const clientY = e.clientY;

      if (cell) {
        setGameState((prev) => ({ ...prev, progressColor: cell.correct }));
      }

      setParticles((prev) => {
        if (!cell) return prev;

        const newParticles: ParticleData[] = [];
        for (let i = 0; i < 7; i++) {
          newParticles.push({
            id: ++particleIdRef.current,
            x: clientX,
            y: clientY,
            color: COLORS[cell.correct].hex,
          });
        }

        const combined = [...prev, ...newParticles];
        return combined.length > MAX_PARTICLES
          ? combined.slice(combined.length - MAX_PARTICLES)
          : combined;
      });

      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(flushPendingReveals);
      }
    },
    [flushPendingReveals]
  );

  const restartGame = useCallback(() => {
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    
    setGrid(buildGrid());
    setParticles([]);
    setGameState({
      started: false,
      finished: false,
      elapsed: 0,
      revealedCount: 0,
      revealedOrder: [],
      progressColor: null,
    });
  }, []);

  const pct = Math.round((gameState.revealedCount / TOTAL_CELLS) * 100);

  const achievement = {
    unlocked: gameState.finished && gameState.elapsed < 60,
    title: "Speed Demon!",
    emoji: "⚡",
  };

  return (
    <div className="flex pt-4 container mx-auto flex-col items-center justify-center select-none font-mono">
      {particles.map((p) => (
        <Particle
          key={p.id}
          x={p.x}
          y={p.y}
          color={p.color}
          onDone={() => setParticles((ps) => ps.filter((x) => x.id !== p.id))}
        />
      ))}

      <div className="relative">
        <div className="flex flex-col gap-0 leading-none">
          {grid.map((row, r) => (
            <div key={r} className="flex">
              {row.map((cell, c) => (
                <span
                  key={c}
                  className={cn(
                    "inline-flex items-center justify-center w-[1ch] h-[1.2em] whitespace-pre text-sm transition-all duration-1000 ease-in-out",
                    cell.isEmpty
                      ? "cursor-default"
                      : cell.revealed
                        ? cn("cursor-pointer", COLORS[cell.correct].tw, "hover:drop-shadow-[0_0_8px_currentColor]")
                        : "cursor-pointer text-blue-500 hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.6)] hover:scale-125 hover:brightness-125"
                  )}
                  onMouseOver={cell.revealed || cell.isEmpty ? undefined : (e) => handleMouseOver(r, c, e)}
                >
                  {cell.ch}
                </span>
              ))}
            </div>
          ))}
        </div>

        <GamePopup
          isOpen={gameState.finished}
          type="win"
          emoji="🖱️"
          score={{ label: "You won in", value: formatTime(gameState.elapsed) }}
          onRestart={restartGame}
          achievement={achievement}
        />
      </div>

      <div className="w-full h-[1px] bg-white/10 mt-4 overflow-hidden">
        <div
          className="h-full transition-[width,background-color] duration-200"
          style={{ 
            width: `${pct}%`,
            backgroundColor: gameState.progressColor 
              ? COLORS[gameState.progressColor].hex 
              : "#3B82F6"
          }}
        />
      </div>
    </div>
  );
}
