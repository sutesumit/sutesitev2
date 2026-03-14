"use client";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { cn } from "@/lib/utils";

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
}

const buildGrid = (): Cell[][] =>
  LOGO.map((segs) => {
    const row: Cell[] = [];
    for (const [text, ck] of segs)
      for (const ch of text) row.push({ ch, correct: ck, revealed: false });
    return row;
  });

const TOTAL_CELLS = LOGO.reduce(
  (sum, segs) => sum + segs.reduce((s, [t]) => s + t.length, 0),
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

export default function App() {
  const [grid, setGrid] = useState<Cell[][]>(buildGrid);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(1);
  const [comboDisplay, setComboDisplay] = useState<number | null>(null);
  const [particles, setParticles] = useState<ParticleData[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);

  const comboTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const particleId = useRef(0);

  useEffect(() => {
    if (started && !finished) {
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [started, finished]);

  const revealedCount = useMemo(() => grid.flat().filter((c) => c.revealed).length, [grid]);
  const pct = Math.round((revealedCount / TOTAL_CELLS) * 100);

  useEffect(() => {
    if (revealedCount >= TOTAL_CELLS && !finished) {
      setFinished(true);
    }
  }, [revealedCount, finished]);

  const resetCombo = useCallback(() => {
    setCombo(1);
    setComboDisplay(null);
  }, []);

  const handleClick = useCallback(
    (r: number, c: number, e: React.MouseEvent) => {
      if (grid[r][c].revealed) return;

      if (!started) setStarted(true);

      const cell = grid[r][c];
      const clientX = e.clientX;
      const clientY = e.clientY;

      setGrid((prev) => {
        const newGrid = [...prev];
        newGrid[r] = [...prev[r]];
        newGrid[r][c] = { ...prev[r][c], revealed: true };
        return newGrid;
      });

      setParticles((p) => [
        ...p,
        ...Array.from({ length: 7 }, () => ({
          id: ++particleId.current,
          x: clientX,
          y: clientY,
          color: COLORS[cell.correct].hex,
        })),
      ]);

      if (comboTimer.current) clearTimeout(comboTimer.current);
      setCombo((cb) => {
        const next = Math.min(cb + 1, 10);
        setScore((s) => s + 10 * next);
        if (next >= 3) setComboDisplay(next);
        return next;
      });
      comboTimer.current = setTimeout(resetCombo, 800);
    },
    [grid, started, resetCombo]
  );

  return (
    <div className="flex container mx-auto flex-col items-center justify-center select-none font-mono">
      {particles.map((p) => (
        <Particle
          key={p.id}
          x={p.x}
          y={p.y}
          color={p.color}
          onDone={() => setParticles((ps) => ps.filter((x) => x.id !== p.id))}
        />
      ))}

      <div className="flex flex-col gap-0 leading-none">
        {grid.map((row, r) => (
          <div key={r} className="flex">
            {row.map((cell, c) => (
              <span
                key={c}
                className={cn(
                  "inline-flex items-center justify-center w-[1ch] h-[1.2em] whitespace-pre cursor-pointer text-sm transition-all duration-1000 ease-in-out",
                  cell.revealed
                    ? cn(COLORS[cell.correct].tw, "hover:drop-shadow-[0_0_8px_currentColor]")
                    : "text-blue-500 hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.6)] hover:scale-125 hover:brightness-125"
                )}
                onMouseOver={cell.revealed ? undefined : (e) => handleClick(r, c, e)}
              >
                {cell.ch}
              </span>

            ))}
          </div>
        ))}
      </div>

      <div className="w-full h-[1px] bg-white/10 mt-4 overflow-hidden">
        <div
          className="h-full bg-blue-500 transition-[width] duration-200"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
