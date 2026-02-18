"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  MouseEvent as ReactMouseEvent,
} from "react";
import { useTheme } from "next-themes";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Segment {
  x: number;
  y: number;
  isTip: boolean;
  angle: number;
}

interface Branch {
  id: number;
  segs: Segment[];
  depth: number;
}

interface Cell {
  x: number;
  y: number;
  char: string;
  color: string;
  isTip: boolean;
  depth: number;
}

interface Params {
  angleRange: number;
  lengthMin: number;
  lengthMax: number;
  spread: number;
  showParams: boolean;
}

interface Point {
  x: number;
  y: number;
}

/** Props you can pass when embedding SeedingPlantASCII into another page */
export interface SeedingPlantASCIIProps {
  /** Initial angle-spread in degrees (default: 35) */
  defaultAngleRange?: number;
  /** Minimum branch length in segments (default: 3) */
  defaultLengthMin?: number;
  /** Maximum branch length in segments (default: 8) */
  defaultLengthMax?: number;
  /** Number of branches to sprout per click (1–4, default: 2) */
  defaultSpread?: number;
  /** Whether the parameter panel starts open (default: false) */
  defaultShowParams?: boolean;
  /** Override the background colour of the whole component */
  backgroundColor?: string;
  /** Override the minimum height of the canvas area (default: "100vh") */
  minHeight?: string | number;
  /** Whether to show the header bar (default: true) */
  showHeader?: boolean;
  /** className forwarded to the root <div> */
  className?: string;
  /** style overrides forwarded to the root <div> */
  style?: React.CSSProperties;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CHARS = {
  trunk: ["│", "┃", "║", "▌", "▍"] as const,
  branch: ["─", "━", "═", "╌", "╍"] as const,
  tip: ["✦", "✧", "⊹", "⋆", "❋", "✿", "❀", "❁", "✱", "⁕"] as const,
  leaf: ["❧", "⁂", "❦", "✾", "❃"] as const,
  seed: "✿",
} as const;

const CELL_W = 14;
const CELL_H = 20;

// ─── Pure helpers ─────────────────────────────────────────────────────────────

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function randBetween(lo: number, hi: number): number {
  return lo + Math.random() * (hi - lo);
}

function angleBetween(ax: number, ay: number, bx: number, by: number): number {
  return Math.atan2(by - ay, bx - ax);
}

/** Maps a radian angle to the closest box-drawing character. */
function charForAngle(angleDeg: number): string {
  const a = ((angleDeg % 360) + 360) % 360;
  if (a < 22.5 || a >= 337.5) return "─";
  if (a < 67.5) return "╲";
  if (a < 112.5) return "│";
  if (a < 157.5) return "╱";
  if (a < 202.5) return "─";
  if (a < 247.5) return "╲";
  if (a < 292.5) return "│";
  return "╱";
}

/** Warm amber at roots → fresh green at tips. Adjusted for theme. */
function hslForDepth(depth: number, maxDepth: number, isDark: boolean): string {
  const t = depth / Math.max(1, maxDepth);
  const h = lerp(35, 130, t);
  const s = lerp(60, 80, t);
  const l = isDark ? lerp(55, 75, t) : lerp(35, 50, t);
  return `hsl(${h}, ${s}%, ${l}%)`;
}

/** Build the list of grid-snapped segments for a new branch. */
function generateSegments(
  x0: number,
  y0: number,
  angle: number,
  length: number,
  cellW: number,
  cellH: number
): Segment[] {
  const segs: Segment[] = [];
  let cx = x0;
  let cy = y0;
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);

  for (let i = 0; i < length; i++) {
    const nx = cx + dx * cellW;
    const ny = cy + dy * cellH;
    segs.push({
      x: Math.round(nx / cellW) * cellW,
      y: Math.round(ny / cellH) * cellH,
      isTip: i === length - 1,
      angle,
    });
    cx = nx;
    cy = ny;
  }
  return segs;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * SeedingPlantASCII
 *
 * An interactive ASCII art plant that branches toward wherever the user clicks.
 *
 * @example
 * // Full-page usage
 * <SeedingPlantASCII />
 *
 * @example
 * // Embedded in an existing layout
 * <SeedingPlantASCII
 *   minHeight={600}
 *   showHeader={false}
 *   defaultSpread={3}
 *   backgroundColor="#050805"
 *   style={{ borderRadius: 12, overflow: "hidden" }}
 * />
 */
const SeedingPlantASCII: React.FC<SeedingPlantASCIIProps> = ({
  defaultAngleRange = 35,
  defaultLengthMin = 3,
  defaultLengthMax = 8,
  defaultSpread = 2,
  defaultShowParams = false,
  backgroundColor,
  minHeight = "100vh",
  showHeader = true,
  className,
  style,
}) => {
  const { theme, resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark" || theme === "dark";

  const containerRef = useRef<HTMLDivElement>(null);
  const nextId = useRef<number>(0);

  const [seed, setSeed] = useState<Point>({ x: 0, y: 0 });
  const [branches, setBranches] = useState<Branch[]>([]);
  const [mousePos, setMousePos] = useState<Point | null>(null);
  const [hint, setHint] = useState<boolean>(true);
  const [params, setParams] = useState<Params>({
    angleRange: defaultAngleRange,
    lengthMin: defaultLengthMin,
    lengthMax: defaultLengthMax,
    spread: defaultSpread,
    showParams: defaultShowParams,
  });

  // ── Initialise seed + trunk ────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return;
    const r = containerRef.current.getBoundingClientRect();
    const cx = Math.round(r.width / 2 / CELL_W) * CELL_W;
    const cy = Math.round((r.height * 0.85) / CELL_H) * CELL_H;
    setSeed({ x: cx, y: cy });

    const trunkSegs: Segment[] = Array.from({ length: 4 }, (_, i) => ({
      x: cx,
      y: cy - (i + 1) * CELL_H,
      isTip: i === 3,
      angle: -Math.PI / 2,
    }));
    setBranches([{ id: nextId.current++, segs: trunkSegs, depth: 0 }]);
  }, []);

  // ── Reset helper (re-exposed on params panel) ──────────────────────────────
  const handleReset = useCallback(() => {
    setSeed((s) => {
      setBranches([
        {
          id: nextId.current++,
          segs: Array.from({ length: 4 }, (_, i) => ({
            x: s.x,
            y: s.y - (i + 1) * CELL_H,
            isTip: i === 3,
            angle: -Math.PI / 2,
          })),
          depth: 0,
        },
      ]);
      setHint(true);
      return s;
    });
  }, []);

  // ── Grow toward click ──────────────────────────────────────────────────────
  const handleClick = useCallback(
    (e: ReactMouseEvent<HTMLDivElement>) => {
      if (!containerRef.current) return;
      setHint(false);

      const rect = containerRef.current.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;

      setBranches((prev) => {
        // Collect all live tips
        const tips: { seg: Segment; branch: Branch }[] = [];
        prev.forEach((b) => {
          const last = b.segs[b.segs.length - 1];
          if (last) tips.push({ seg: last, branch: b });
        });
        if (tips.length === 0) return prev;

        // Find the closest tip to the click
        let closest = tips[0];
        let minDist = Infinity;
        tips.forEach((t) => {
          const d = Math.hypot(t.seg.x - px, t.seg.y - py);
          if (d < minDist) {
            minDist = d;
            closest = t;
          }
        });

        const origin = closest.seg;
        const baseAngle = angleBetween(origin.x, origin.y, px, py);
        const { angleRange, lengthMin, lengthMax, spread } = params;
        const ar = (angleRange * Math.PI) / 180;
        const count = Math.max(1, Math.min(4, spread));

        const newBranches: Branch[] = Array.from({ length: count }, (_, i) => {
          const spreadOffset =
            count === 1 ? 0 : lerp(-ar / 2, ar / 2, i / (count - 1));
          const noise = randBetween(-ar * 0.2, ar * 0.2);
          const finalAngle = baseAngle + spreadOffset + noise;
          const length = Math.round(randBetween(lengthMin, lengthMax));
          return {
            id: nextId.current++,
            segs: generateSegments(origin.x, origin.y, finalAngle, length, CELL_W, CELL_H),
            depth: closest.branch.depth + 1,
          };
        });

        // De-tip the origin segment
        const updated = prev.map((b) => {
          if (b.id !== closest.branch.id) return b;
          return {
            ...b,
            segs: b.segs.map((s, i) =>
              i === b.segs.length - 1 ? { ...s, isTip: false } : s
            ),
          };
        });

        return [...updated, ...newBranches];
      });
    },
    [params]
  );

  const handleMouseMove = useCallback(
    (e: ReactMouseEvent<HTMLDivElement>) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    },
    []
  );

  const handleMouseLeave = useCallback(() => setMousePos(null), []);

  // ── Build cell map ─────────────────────────────────────────────────────────
  const cells: Record<string, Cell> = {};
  const maxDepth = branches.reduce((m, b) => Math.max(m, b.depth), 0);

  branches.forEach((b) => {
    b.segs.forEach((s) => {
      const key = `${s.x},${s.y}`;
      const angleDeg = (s.angle * 180) / Math.PI;
      const ch = s.isTip
        ? CHARS.tip[Math.abs(Math.round(s.x + s.y)) % CHARS.tip.length]
        : charForAngle(angleDeg);
      cells[key] = {
        x: s.x,
        y: s.y,
        char: ch,
        color: hslForDepth(b.depth, maxDepth, isDark),
        isTip: s.isTip,
        depth: b.depth,
      };
    });
  });

  // Seed cell always on top
  cells[`${seed.x},${seed.y}`] = {
    x: seed.x,
    y: seed.y,
    char: CHARS.seed,
    color: isDark ? "hsl(50, 90%, 70%)" : "hsl(30, 80%, 45%)",
    isTip: false,
    depth: -1,
  };

  // ── Closest tip for hover line ─────────────────────────────────────────────
  const closestTip: Segment | null = (() => {
    if (!mousePos || branches.length === 0) return null;
    const tips = branches.flatMap((b) => b.segs.filter((s) => s.isTip));
    if (!tips.length) return null;
    return tips.reduce<Segment>((best, s) => {
      return Math.hypot(s.x - mousePos.x, s.y - mousePos.y) <
        Math.hypot(best.x - mousePos.x, best.y - mousePos.y)
        ? s
        : best;
    }, tips[0]);
  })();

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div
      className={className}
      style={{
        minHeight,
        background: backgroundColor || (isDark ? "#020617" : "#f8faf8"),
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Courier New', monospace",
        color: isDark ? "#94a3b8" : "#2a5a2a",
        userSelect: "none",
        transition: "background 0.3s, color 0.3s",
        ...style,
      }}
    >
      {/* ── Header ── */}
      {showHeader && (
        <div
          style={{
            padding: "16px 24px",
            borderBottom: isDark ? "1px solid #1a2a1a" : "1px solid #e0eee0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontSize: 13,
              letterSpacing: "0.3em",
              color: isDark ? "#3a5a3a" : "#6a8a6a",
              textTransform: "uppercase",
            }}
          >
            ❧ ascii.plant
          </span>
          <button
            onClick={() =>
              setParams((p) => ({ ...p, showParams: !p.showParams }))
            }
            style={{
              background: "none",
              border: isDark ? "1px solid #2a4a2a" : "1px solid #cce0cc",
              color: isDark ? "#4a7a4a" : "#4a7a4a",
              padding: "4px 12px",
              cursor: "pointer",
              fontSize: 11,
              letterSpacing: "0.2em",
              borderRadius: 2,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.background =
                isDark ? "#1a2a1a" : "#f0f8f0")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.background = "none")
            }
          >
            {params.showParams ? "hide params" : "params ⟩"}
          </button>
        </div>
      )}

      {/* ── Params panel ── */}
      {params.showParams && (
        <div
          style={{
            padding: "16px 24px",
            borderBottom: isDark ? "1px solid #1a2a1a" : "1px solid #e0eee0",
            display: "flex",
            gap: 32,
            flexWrap: "wrap",
            background: isDark ? "#0f172a" : "#f1f6f1",
            fontSize: 12,
            color: isDark ? "#94a3b8" : "#5a7a5a",
          }}
        >
          {(
            [
              { key: "angleRange", label: "angle spread °", min: 5, max: 90, step: 5 },
              { key: "lengthMin", label: "length min", min: 1, max: 10, step: 1 },
              { key: "lengthMax", label: "length max", min: 2, max: 20, step: 1 },
              { key: "spread", label: "branch count", min: 1, max: 4, step: 1 },
            ] as { key: keyof Omit<Params, "showParams">; label: string; min: number; max: number; step: number }[]
          ).map(({ key, label, min, max, step }) => (
            <label
              key={key}
              style={{ display: "flex", flexDirection: "column", gap: 6 }}
            >
              <span style={{ letterSpacing: "0.15em" }}>
                {label}:{" "}
                <strong style={{ color: isDark ? "#6aaa6a" : "#4a8a4a" }}>{params[key]}</strong>
              </span>
              <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={params[key] as number}
                onChange={(e) =>
                  setParams((p) => ({ ...p, [key]: Number(e.target.value) }))
                }
                style={{ accentColor: "#4a9a4a", width: 120 }}
              />
            </label>
          ))}

          <button
            onClick={handleReset}
            style={{
              background: "none",
              border: isDark ? "1px solid #2a4a2a" : "1px solid #cce0cc",
              color: isDark ? "#4a7a4a" : "#4a7a4a",
              padding: "4px 12px",
              cursor: "pointer",
              fontSize: 11,
              letterSpacing: "0.2em",
              borderRadius: 2,
              alignSelf: "flex-end",
            }}
          >
            ↺ reset
          </button>
        </div>
      )}

      {/* ── Canvas ── */}
      <div
        ref={containerRef}
        style={{
          flex: 1,
          position: "relative",
          overflow: "hidden",
          cursor: "crosshair",
          minHeight: 500,
        }}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Scanline overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            backgroundImage: isDark
              ? "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)"
              : "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(100,150,100,0.03) 2px, rgba(100,150,100,0.03) 4px)",
            zIndex: 10,
          }}
        />

        {/* Hover guide line */}
        {mousePos && closestTip && (
          <svg
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              width: "100%",
              height: "100%",
              zIndex: 5,
            }}
          >
            <line
              x1={closestTip.x}
              y1={closestTip.y}
              x2={mousePos.x}
              y2={mousePos.y}
              stroke={isDark ? "rgba(100,200,100,0.12)" : "rgba(40,100,40,0.15)"}
              strokeWidth="1"
              strokeDasharray="4 6"
            />
            <circle
              cx={mousePos.x}
              cy={mousePos.y}
              r="3"
              fill="none"
              stroke={isDark ? "rgba(100,200,100,0.3)" : "rgba(40,100,40,0.4)"}
              strokeWidth="1"
            />
          </svg>
        )}

        {/* ASCII cells */}
        {Object.values(cells).map((cell) => (
          <span
            key={`${cell.x},${cell.y}`}
            style={{
              position: "absolute",
              left: cell.x,
              top: cell.y,
              width: CELL_W,
              height: CELL_H,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: cell.isTip ? 14 : 13,
              color: cell.color,
              textShadow: cell.isTip
                ? isDark
                  ? `0 0 8px ${cell.color}, 0 0 16px ${cell.color}55`
                  : `0 0 4px ${cell.color}33`
                : isDark
                ? `0 0 4px ${cell.color}66`
                : "none",
              transition: "color 0.5s",
              animation: cell.isTip
                ? "seedingPlantASCII__pulse 2s ease-in-out infinite"
                : "seedingPlantASCII__fadeIn 0.3s ease-out",
              zIndex: 2,
            }}
          >
            {cell.char}
          </span>
        ))}

        {/* First-use hint */}
        {hint && (
          <div
            style={{
              position: "absolute",
              bottom: 40,
              left: "50%",
              transform: "translateX(-50%)",
              fontSize: 11,
              color: isDark ? "#2a4a2a" : "#6a8a6a",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              animation: "seedingPlantASCII__breathe 3s ease-in-out infinite",
              pointerEvents: "none",
              whiteSpace: "nowrap",
            }}
          >
            click anywhere to grow
          </div>
        )}

        {/* Stats */}
        <div
          style={{
            position: "absolute",
            bottom: 16,
            right: 24,
            fontSize: 10,
            color: isDark ? "#1e3a1e" : "#8a9a8a",
            letterSpacing: "0.2em",
          }}
        >
          {Object.keys(cells).length} cells · {branches.length} branches
        </div>
      </div>

      {/* Scoped keyframes — prefixed to avoid collisions */}
      <style>{`
        @keyframes seedingPlantASCII__pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.6; transform: scale(0.85); }
        }
        @keyframes seedingPlantASCII__fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes seedingPlantASCII__breathe {
          0%, 100% { opacity: 0.4; }
          50%       { opacity: 0.9; }
        }
      `}</style>
    </div>
  );
};

export default SeedingPlantASCII;