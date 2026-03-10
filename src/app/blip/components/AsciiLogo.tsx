"use client";

import { useState } from "react";

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

export default function ASCII_LOGO() {
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});
  const [animating, setAnimating] = useState<Record<string, "to-color" | "to-blue">>({});

  const handleClick = (id: string) => {
    if (flipped[id] || animating[id]) return;
    setAnimating(prev => ({ ...prev, [id]: 'to-color' }));
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
        }
        .cell:hover { opacity: 0.7; }
        .cell.flipped { color: var(--tc); cursor: default; }
        .cell.flipped:hover { opacity: 1; }
        .cell.anim-to-color { animation: flipToColor 0.35s ease-in-out forwards; }
        .cell.anim-to-blue  { animation: flipToBlue  0.35s ease-in-out forwards; }
      `}</style>
      <pre style={{ fontFamily: 'monospace', lineHeight: 1.4, padding: '1rem', margin: 0 }}>
        {ROWS.map((row, r) => (
          <span key={r} style={{ display: 'block' }}>
            {row.map((cell, c) => {
              const id = `${r}-${c}`;
              const anim = animating[id];
              const isFlipped = !!flipped[id];
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
                  {cell.text}
                </span>
              );
            })}
          </span>
        ))}
      </pre>
    </div>
  );
}