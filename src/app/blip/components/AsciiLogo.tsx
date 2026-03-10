"use client";

import { useState, useEffect } from "react";
import { motion as m } from "framer-motion";

const ROWS = [
  [
    { text: '█', color: '#eab308' }, { text: '█', color: '#eab308' }, { text: '█', color: '#eab308' }, { text: '█', color: '#eab308' }, { text: '█', color: '#eab308' }, { text: '█', color: '#eab308' }, { text: '╗', color: '#eab308' }, { text: ' ', color: '#eab308' },
    { text: '█', color: '#eab308' }, { text: '█', color: '#eab308' }, { text: '╗', color: '#eab308' }, { text: ' ', color: '#eab308' },
    { text: '█', color: '#ef4444' }, { text: '█', color: '#ef4444' }, { text: '╗', color: '#ef4444' },
    { text: '█', color: '#ef4444' }, { text: '█', color: '#ef4444' }, { text: '█', color: '#ef4444' }, { text: '█', color: '#ef4444' }, { text: '█', color: '#ef4444' }, { text: '█', color: '#ef4444' }, { text: '╗', color: '#ef4444' }, { text: ' ', color: '#ef4444' },
  ],
  [
    { text: '█', color: '#eab308' }, { text: '█', color: '#eab308' }, { text: '╔', color: '#eab308' }, { text: '═', color: '#eab308' }, { text: '═', color: '#eab308' }, { text: '█', color: '#eab308' }, { text: '█', color: '#eab308' }, { text: '╗', color: '#eab308' },
    { text: '█', color: '#fde047' }, { text: '█', color: '#fde047' }, { text: '║', color: '#fde047' }, { text: ' ', color: '#fde047' },
    { text: '█', color: '#ef4444' }, { text: '█', color: '#ef4444' }, { text: '║', color: '#ef4444' },
    { text: '█', color: '#f87171' }, { text: '█', color: '#f87171' }, { text: '╔', color: '#f87171' }, { text: '═', color: '#f87171' }, { text: '═', color: '#f87171' }, { text: '█', color: '#f87171' }, { text: '█', color: '#f87171' }, { text: '╗', color: '#f87171' },
  ],
  [
    { text: '█', color: '#fde047' }, { text: '█', color: '#fde047' }, { text: '█', color: '#fde047' }, { text: '█', color: '#fde047' }, { text: '█', color: '#fde047' }, { text: '█', color: '#fde047' }, { text: '╔', color: '#fde047' }, { text: '╝', color: '#fde047' },
    { text: '█', color: '#fde047' }, { text: '█', color: '#fde047' }, { text: '║', color: '#fde047' }, { text: ' ', color: '#fde047' },
    { text: '█', color: '#f87171' }, { text: '█', color: '#f87171' }, { text: '║', color: '#f87171' },
    { text: '█', color: '#f87171' }, { text: '█', color: '#f87171' }, { text: '█', color: '#f87171' }, { text: '█', color: '#f87171' }, { text: '█', color: '#f87171' }, { text: '█', color: '#f87171' }, { text: '╔', color: '#f87171' }, { text: '╝', color: '#f87171' },
  ],
  [
    { text: '█', color: '#ffffff' }, { text: '█', color: '#ffffff' }, { text: '╔', color: '#ffffff' }, { text: '═', color: '#ffffff' }, { text: '═', color: '#ffffff' }, { text: '█', color: '#ffffff' }, { text: '█', color: '#ffffff' }, { text: '╗', color: '#ffffff' },
    { text: '█', color: '#fde047' }, { text: '█', color: '#fde047' }, { text: '║', color: '#fde047' }, { text: ' ', color: '#fde047' },
    { text: '█', color: '#f87171' }, { text: '█', color: '#f87171' }, { text: '║', color: '#f87171' },
    { text: '█', color: '#ef4444' }, { text: '█', color: '#ef4444' }, { text: '╔', color: '#ef4444' }, { text: '═', color: '#ef4444' }, { text: '═', color: '#ef4444' }, { text: '═', color: '#ef4444' }, { text: '╝', color: '#ef4444' }, { text: ' ', color: '#ef4444' },
  ],
  [
    { text: '╚', color: '#ffffff' }, { text: '█', color: '#ffffff' }, { text: '█', color: '#ffffff' }, { text: '█', color: '#ffffff' }, { text: '█', color: '#ffffff' }, { text: '█', color: '#ffffff' }, { text: '╔', color: '#ffffff' }, { text: '╝', color: '#ffffff' },
    { text: '█', color: '#e5e7eb' }, { text: '█', color: '#e5e7eb' }, { text: '║', color: '#e5e7eb' }, { text: ' ', color: '#e5e7eb' },
    { text: '█', color: '#ef4444' }, { text: '█', color: '#ef4444' }, { text: '║', color: '#ef4444' },
    { text: '█', color: '#ef4444' }, { text: '█', color: '#ef4444' }, { text: '║', color: '#ef4444' }, { text: ' ', color: '#ef4444' }, { text: ' ', color: '#ef4444' }, { text: ' ', color: '#ef4444' }, { text: ' ', color: '#ef4444' }, { text: ' ', color: '#ef4444' },
  ],
  [
    { text: ' ', color: '#6b7280' }, { text: '╚', color: '#6b7280' }, { text: '═', color: '#6b7280' }, { text: '═', color: '#6b7280' }, { text: '═', color: '#6b7280' }, { text: '═', color: '#6b7280' }, { text: '╝', color: '#6b7280' }, { text: ' ', color: '#6b7280' },
    { text: '╚', color: '#6b7280' }, { text: '═', color: '#6b7280' }, { text: '╝', color: '#6b7280' }, { text: ' ', color: '#6b7280' },
    { text: '╚', color: '#ef4444' }, { text: '═', color: '#ef4444' }, { text: '╝', color: '#ef4444' },
    { text: '╚', color: '#ef4444' }, { text: '═', color: '#ef4444' }, { text: '╝', color: '#ef4444' }, { text: ' ', color: '#ef4444' }, { text: ' ', color: '#ef4444' }, { text: ' ', color: '#ef4444' }, { text: ' ', color: '#ef4444' }, { text: ' ', color: '#ef4444' },
  ],
];

function getRandomTrap(): string {
  const r = Math.floor(Math.random() * ROWS.length);
  const c = Math.floor(Math.random() * ROWS[r].length);
  return `${r}-${c}`;
}

export default function ASCII_LOGO() {
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});
  const [animating, setAnimating] = useState<Record<string, "to-color" | "to-blue">>({});
  const [trapCell, setTrapCell] = useState<string>("");
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [isGameOver, setIsGameOver] = useState(false);
  const [showingEmoji, setShowingEmoji] = useState<Record<string, "sparkle" | "explosion">>({});

  useEffect(() => {
    setTrapCell(getRandomTrap());
  }, []);

  const restartGame = () => {
    setFlipped({});
    setAnimating({});
    setRevealed(new Set());
    setIsGameOver(false);
    setShowingEmoji({});
    setTrapCell(getRandomTrap());
  };

  const handleClick = (id: string) => {
    if (isGameOver || revealed.has(id) || flipped[id] || animating[id]) return;

    if (id === trapCell) {
      setShowingEmoji(prev => ({ ...prev, [id]: "explosion" }));
      setTimeout(() => {
        setIsGameOver(true);
      }, 600);
    } else {
      setRevealed(prev => new Set(prev).add(id));
      setShowingEmoji(prev => ({ ...prev, [id]: "sparkle" }));
      setTimeout(() => {
        setShowingEmoji(prev => {
          const n = { ...prev };
          delete n[id];
          return n;
        });
        setAnimating(prev => ({ ...prev, [id]: 'to-color' }));
      }, 400);
    }
  };

  const handleAnimationEnd = (id: string) => {
    const dir = animating[id];
    setAnimating(prev => {
      const n = { ...prev };
      delete n[id];
      return n;
    });
    setFlipped(prev => {
      const n = { ...prev };
      if (dir === 'to-color') n[id] = true;
      else delete n[id];
      return n;
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2rem' }}>
      <style>{`
        @keyframes flipToColor {
          0%   { transform: scaleX(1); color: #3b82f6; }
          49%  { transform: scaleX(0); color: #3b82f6; }
          50%  { transform: scaleX(0); color: var(--tc); }
          100% { transform: scaleX(1); color: var(--tc); }
        }
        @keyframes flipToBlue {
          0%   { transform: scaleX(1); color: var(--tc); }
          49%  { transform: scaleX(0); color: var(--tc); }
          50%  { transform: scaleX(0); color: #3b82f6; }
          100% { transform: scaleX(1); color: #3b82f6; }
        }
        .cell {
          display: inline-block;
          width: 1ch;
          cursor: pointer;
          color: #3b82f6;
          user-select: none;
          text-align: center;
          position: relative;
        }
        .cell:hover { opacity: 0.7; }
        .cell.flipped { color: var(--tc); cursor: default; }
        .cell.flipped:hover { opacity: 1; }
        .cell.anim-to-color { animation: flipToColor 0.35s ease-in-out forwards; }
        .cell.anim-to-blue  { animation: flipToBlue  0.35s ease-in-out forwards; }
      `}</style>
      <div style={{ position: 'relative' }}>
        <pre style={{ fontFamily: 'monospace', lineHeight: 1.4, padding: '1rem', margin: 0 }}>
          {ROWS.map((row, r) => (
            <span key={r} style={{ display: 'block' }}>
              {row.map((cell, c) => {
                const id = `${r}-${c}`;
                const anim = animating[id];
                const isFlipped = !!flipped[id];
                const emoji = showingEmoji[id];
                const cls = [
                  'cell',
                  isFlipped && !anim ? 'flipped' : '',
                  anim === 'to-color' ? 'anim-to-color' : '',
                  anim === 'to-blue' ? 'anim-to-blue' : ''
                ].filter(Boolean).join(' ');
                return (
                  <span
                    key={id}
                    className={cls}
                    style={{ '--tc': cell.color } as React.CSSProperties}
                    onClick={() => handleClick(id)}
                    onAnimationEnd={() => handleAnimationEnd(id)}
                  >
                    {emoji === "sparkle" ? (
                      <m.span
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
                      >
                        ✨
                      </m.span>
                    ) : emoji === "explosion" ? (
                      <m.span
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: [1, 1.5, 1], opacity: 1 }}
                        transition={{ duration: 0.5, times: [0, 0.5, 1] }}
                      >
                        💥
                      </m.span>
                    ) : (
                      cell.text
                    )}
                  </span>
                );
              })}
            </span>
          ))}
        </pre>

        {isGameOver && (
          <m.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center z-20"
            style={{ background: 'rgba(0,0,0,0.7)' }}
          >
            <m.div 
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-slate-900 border border-slate-600 p-8 flex flex-col items-center"
            >
              <span className="text-4xl mb-6 animate-bounce">💥</span>
              <button 
                onClick={restartGame}
                className="px-6 py-2 bg-slate-900 border border-slate-600 text-slate-300 font-mono text-[10px] tracking-widest uppercase hover:bg-blue-950 transition-colors cursor-pointer"
              >
                [ Try Again ]
              </button>
            </m.div>
          </m.div>
        )}
      </div>
    </div>
  );
}
