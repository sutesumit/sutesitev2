"use client";

import { useState, useEffect, useRef } from "react";
import { motion as m } from "framer-motion";
import { CardBackground } from "@/components/shared/CardBackground";
import { ChevronLeft, ChevronRight } from "lucide-react";

const SYMBOLS = [" ", "·", "∘", "*", "◆", "●"];
const SPINNER = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function densityLevel(n: number) {
  if (n === 0) return 0;
  if (n <= 2) return 1;
  if (n <= 6) return 2;
  if (n <= 12) return 3;
  if (n <= 20) return 4;
  return 5;
}

function toKey(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function buildMonthGrid(year: number, month: number) {
  const first = new Date(year, month, 1).getDay();
  const total = new Date(year, month + 1, 0).getDate();
  const slots: (number | null)[] = [
    ...Array(first).fill(null),
    ...Array.from({ length: total }, (_, i) => i + 1),
  ];
  while (slots.length < 42) slots.push(null);
  return Array.from({ length: 6 }, (_, i) => slots.slice(i * 7, i * 7 + 7));
}

function generatePlaceholderData() {
  const out: Record<string, number> = {};
  const today = new Date();
  for (let i = 364; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const k = d.toISOString().slice(0, 10);
    const r = Math.random();
    out[k] =
      r < 0.28 ? 0
      : r < 0.5 ? Math.floor(Math.random() * 3) + 1
      : r < 0.72 ? Math.floor(Math.random() * 5) + 4
      : r < 0.88 ? Math.floor(Math.random() * 8) + 9
      : Math.floor(Math.random() * 10) + 18;
  }
  return out;
}

const BOOT_STEPS = [
  { label: "loading local cache", duration: 280 },
  { label: "fetching remote timeline", duration: 300 },
  { label: "merging contributions", duration: 240 },
  { label: "done", duration: 160 },
];

export const ContributionHeatmap = ({ data: externalData = null }: { data?: Record<string, number> | null }) => {
  const placeholderRef = useRef<Record<string, number> | null>(null);
  if (!placeholderRef.current) {
    placeholderRef.current = generatePlaceholderData();
  }
  
  const data = externalData ?? placeholderRef.current;

  const now = new Date();
  const todayKey = now.toISOString().slice(0, 10);

  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [tooltip, setTooltip] = useState<{ dateKey: string; count: number; x: number; y: number } | null>(null);
  const [bootStep, setBootStep] = useState(-1);
  const [doneSteps, setDoneSteps] = useState<number[]>([]);
  const [spinIdx, setSpinIdx] = useState(0);
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setSpinIdx((i) => (i + 1) % SPINNER.length), 80);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    let elapsed = 0;
    BOOT_STEPS.forEach(({ duration }, i) => {
      setTimeout(() => {
        setBootStep(i);
        setTimeout(() => {
          setDoneSteps((p) => [...p, i]);
          if (i === BOOT_STEPS.length - 1) {
            setTimeout(() => {
              setBootStep(-1);
              setBooted(true);
            }, 120);
          }
        }, duration);
      }, elapsed);
      elapsed += duration + 40;
    });
  }, []);

  const isAtLatest = year === now.getFullYear() && month === now.getMonth();
  const prevMonth = () => (month === 0 ? (setYear((y) => y - 1), setMonth(11)) : setMonth((m) => m - 1));
  const nextMonth = () => {
    if (isAtLatest) return;
    month === 11 ? (setYear((y) => y + 1), setMonth(0)) : setMonth((m) => m + 1);
  };

  const weeks = buildMonthGrid(year, month);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let monthTotal = 0,
    activeDays = 0,
    peakCount = 0,
    peakDay: number | null = null;

  for (let d = 1; d <= daysInMonth; d++) {
    const c = data[toKey(year, month, d)] ?? 0;
    monthTotal += c;
    if (c > 0) activeDays++;
    if (c > peakCount) {
      peakCount = c;
      peakDay = d;
    }
  }

  const levelColors = [
    "text-slate-300/30 dark:text-slate-600/30", 
    "text-blue-400 dark:text-blue-900", 
    "text-blue-500 dark:text-blue-700", 
    "text-blue-600 dark:text-blue-500", 
    "text-blue-700 dark:text-blue-400", 
    "text-blue-900 dark:text-blue-300", 
  ];

  return (
    <>
      <m.div 
        className="relative isolate p-5 overflow-hidden blue-border project-list flex flex-col font-mono text-xs w-full max-w-2xl"
        initial="rest"
        whileHover="hover"
        animate="rest"
      >
        <CardBackground />
        
        {/* Header */}
        <div className="flex justify-between items-center text-[10px] text-slate-500 tracking-wider mb-4 uppercase">
          <span className="project-item">contribution-scanner</span>
          <span className="flex gap-2">
            <span className="tab" title="Main GitHub Account">@primary</span>
            <span className="tab" title="Alt/Work Account">@secondary</span>
          </span>
        </div>

        {/* Boot */}
        {!booted && (
          <div className="text-[11px] leading-loose tracking-wide min-h-[100px] text-slate-600 dark:text-slate-400">
            {BOOT_STEPS.map(({ label }, i) => {
              const running = bootStep === i;
              const finished = doneSteps.includes(i);
              if (!running && !finished) return null;
              return (
                <div key={i} className="flex gap-2 items-center">
                  <span className="opacity-50">$</span>
                  <span className="w-4 text-blue-600 dark:text-blue-400">{running ? SPINNER[spinIdx] : "✓"}</span>
                  <span className={finished ? "text-slate-800 dark:text-slate-200" : "text-slate-600 dark:text-slate-500"}>{label}</span>
                </div>
              );
            })}
            {bootStep >= 0 && <span className="animate-[pulse_1s_step-end_infinite] text-blue-600 dark:text-blue-400">█</span>}
          </div>
        )}

        {/* Heatmap */}
        {booted && (
          <m.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center w-full"
          >
            {/* Nav */}
            <div className="flex justify-between items-center w-full max-w-sm mb-4 border-b border-slate-200/50 dark:border-slate-800/50 pb-2">
              <button
                onClick={prevMonth}
                className="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-100/80 dark:hover:bg-slate-900/80 transition-colors cursor-pointer text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-bold tracking-widest uppercase text-blue-600 dark:text-blue-400">
                {MONTHS[month]} {year}
              </span>
              <button
                onClick={nextMonth}
                disabled={isAtLatest}
                className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${
                  isAtLatest ? "opacity-30 cursor-default text-slate-400" : "hover:bg-slate-100/80 dark:hover:bg-slate-900/80 cursor-pointer text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-7 grid-rows-6 gap-0.5 md:gap-1 mx-auto">
              {weeks.flat().map((day, idx) => {
                if (!day) return <div key={idx} className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10" />;
                const dateKey = toKey(year, month, day);
                const count = data[dateKey] ?? 0;
                const lv = densityLevel(count);
                const isToday = dateKey === todayKey;

                return (
                  <div
                    key={idx}
                    className={`w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 flex items-center justify-center text-[10px] sm:text-xs md:text-sm cursor-crosshair select-none transition-colors hover:bg-slate-100/80 dark:hover:bg-slate-900/80 ${
                      isToday ? "ring-1 ring-blue-500/50" : ""
                    }`}
                    onMouseEnter={(e) => setTooltip({ dateKey, count, x: e.clientX, y: e.clientY })}
                    onMouseLeave={() => setTooltip(null)}
                  >
                    <span className="opacity-30">[</span>
                    <span className={levelColors[lv]}>{SYMBOLS[lv]}</span>
                    <span className="opacity-30">]</span>
                  </div>
                );
              })}
            </div>

            {/* Divider */}
            <hr className="w-full max-w-sm border-t border-slate-200/50 dark:border-slate-800/50 my-4" />

            {/* Stats */}
            <div className="text-[10px] text-slate-500 dark:text-slate-400 tracking-wider text-center leading-relaxed">
              <span className="opacity-50">$ </span>
              <span className="text-slate-800 dark:text-slate-200 font-bold">{monthTotal.toLocaleString()}</span>
              <span> commits </span>
              <span className="opacity-50">&middot; </span>
              <span className="text-slate-800 dark:text-slate-200 font-bold">{activeDays}</span>
              <span> active</span>
              {peakDay !== null && (
                <>
                  <span className="opacity-50"> &middot; </span>
                  <span>peak </span>
                  <span className="text-slate-800 dark:text-slate-200 font-bold">
                    day {peakDay} ({peakCount})
                  </span>
                </>
              )}
              <span className="animate-[pulse_1s_step-end_infinite] text-blue-600 dark:text-blue-400 ml-1">_</span>
            </div>
          </m.div>
        )}
      </m.div>
      
      {/* Tooltip */}
      {tooltip && (
        <div
          style={{ left: tooltip.x, top: tooltip.y }}
          className="fixed pointer-events-none transform -translate-x-1/2 -translate-y-full -mt-4 dark:bg-slate-900 bg-slate-50 dark:text-slate-300 text-slate-800 border border-slate-800 font-mono text-[10px] whitespace-pre px-3 py-1.5 z-[999] leading-relaxed tracking-wider"
        >
          <div className="flex flex-col gap-0.5">
            <span>{tooltip.dateKey}</span>
            <span className="text-blue-400">{tooltip.count} commits</span>
          </div>
        </div>
      )}
    </>
  );
};
