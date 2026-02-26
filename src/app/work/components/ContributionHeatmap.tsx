"use client";

import { useState, useEffect } from "react";
import { motion as m } from "framer-motion";
import { CardBackground } from "@/components/shared/CardBackground";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SiGithub } from "react-icons/si";
import { GITHUB_PROFILES } from "@/data/github";

const SYMBOLS = ["\u00A0", "✧", "✲", "✷", "❃", "❁"];
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

const BOOT_STEPS = [
  { label: "initializing engine", duration: 280 },
  { label: "fetching remote timeline", duration: 800 }, // This will be dynamic now
  { label: "merging contributions", duration: 240 },
  { label: "done", duration: 160 },
];

export const ContributionHeatmap = ({ data: externalData = null }: { data?: Record<string, number> | null }) => {
  const [data, setData] = useState<Record<string, number>>(externalData || {});
  const [error, setError] = useState<string | null>(null);

  const now = new Date();
  const todayKey = now.toISOString().slice(0, 10);

  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [tooltip, setTooltip] = useState<{ dateKey: string; count: number; x: number; y: number } | null>(null);
  const [bootStep, setBootStep] = useState(-1);
  const [doneSteps, setDoneSteps] = useState<number[]>([]);
  const [spinIdx, setSpinIdx] = useState(0);
  const [booted, setBooted] = useState(false);

  // Game state
  const [skullDay, setSkullDay] = useState<number | null>(null);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [isGameOver, setIsGameOver] = useState(false);

  // Randomize skull when month/year changes
  useEffect(() => {
    const days = new Date(year, month + 1, 0).getDate();
    setSkullDay(Math.floor(Math.random() * days) + 1);
    setRevealed(new Set());
    setIsGameOver(false);
  }, [year, month]);

  const handleDayClick = (day: number) => {
    if (isGameOver || revealed.has(day)) return;

    if (day === skullDay) {
      setIsGameOver(true);
    } else {
      setRevealed((prev) => new Set(prev).add(day));
    }
  };

  useEffect(() => {
    const id = setInterval(() => setSpinIdx((i) => (i + 1) % SPINNER.length), 80);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const runBoot = async () => {
      // Step 0: Initializing
      setBootStep(0);
      await new Promise(r => setTimeout(r, 280));
      setDoneSteps(p => [...p, 0]);

      // Step 1: Fetching (Actual fetch)
      setBootStep(1);
      try {
        const res = await fetch('/api/github-activity');
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Failed to fetch GitHub activity");
        }
        const githubData = await res.json();
        setData(githubData);
        setDoneSteps(p => [...p, 1]);
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Unknown error";
        setError(message);
        return; // Stop boot on error
      }

      // Step 2: Merging (Wait for effect)
      setBootStep(2);
      await new Promise(r => setTimeout(r, 240));
      setDoneSteps(p => [...p, 2]);

      // Step 3: Done
      setBootStep(3);
      await new Promise(r => setTimeout(r, 160));
      setDoneSteps(p => [...p, 3]);

      setTimeout(() => {
        setBootStep(-1);
        setBooted(true);
      }, 120);
    };

    if (externalData) {
      setData(externalData);
      setBooted(true);
    } else {
      runBoot();
    }
  }, [externalData]);

  const isAtLatest = year === now.getFullYear() && month === now.getMonth();
  const prevMonth = () => (month === 0 ? (setYear((y) => y - 1), setMonth(11)) : setMonth((m) => m - 1));
  const nextMonth = () => {
    if (isAtLatest) return;
    if (month === 11) {
      setYear((y) => y + 1);
      setMonth(0);
    } else {
      setMonth((m) => m + 1);
    }
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

  // const levelColors = [
  //   "text-slate-300/30 dark:text-slate-600/30", 
  //   "text-blue-400 dark:text-blue-900", 
  //   "text-blue-500 dark:text-blue-700", 
  //   "text-blue-600 dark:text-blue-500", 
  //   "text-blue-700 dark:text-blue-400", 
  //   "text-blue-900 dark:text-blue-300", 
  // ];

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
        <div className="flex justify-between items-center text-[10px] text-slate-500 tracking-wider mb-4">
          {/* <span className="project-item">Across following profiles</span> */}
          {/* <span className="flex gap-2 items-center"> */}
            {GITHUB_PROFILES.map((profile) => (
              <a 
                key={profile}
                href={`https://github.com/${profile}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="tab flex items-center gap-1"
              >
                <SiGithub />{profile}
              </a>
            ))}
          {/* </span> */}
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
                  <span className="w-4 text-blue-600 dark:text-blue-400">
                    {running && !error ? SPINNER[spinIdx] : finished ? "✓" : error && running ? "✗" : " "}
                  </span>
                  <span className={finished ? "text-slate-800 dark:text-slate-200" : "text-slate-600 dark:text-slate-500"}>{label}</span>
                </div>
              );
            })}
            {error && (
              <div className="mt-4 p-3 border border-red-500/30 bg-red-500/5 text-red-500/80">
                <div className="flex items-start gap-2">
                  <span className="font-bold">[ERROR]:</span>
                  <span>{error}</span>
                </div>
                <button 
                  onClick={() => window.location.reload()}
                  className="mt-2 text-[9px] underline cursor-pointer hover:text-red-400"
                >
                  [ retry_connection ]
                </button>
              </div>
            )}
            {bootStep >= 0 && !error && <span className="animate-[pulse_1s_step-end_infinite] text-blue-600 dark:text-blue-400">█</span>}
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
                className="w-8 h-8 flex items-center justify-center hover:bg-slate-100/80 dark:hover:bg-slate-900/80 transition-colors cursor-pointer text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-bold tracking-widest uppercase text-blue-600 dark:text-blue-400">
                {MONTHS[month]} {year}
              </span>
              <button
                onClick={nextMonth}
                disabled={isAtLatest}
                className={`w-8 h-8 flex items-center justify-center transition-colors ${
                  isAtLatest ? "opacity-30 cursor-default text-slate-400" : "hover:bg-slate-100/80 dark:hover:bg-slate-900/80 cursor-pointer text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Grid */}
            <div className="relative">
              <m.div 
                className="grid grid-cols-7 grid-rows-6 gap-0.5 md:gap-1 mx-auto"
                animate={isGameOver ? { y: 300, opacity: 0, rotate: 5 } : { y: 0, opacity: 1, rotate: 0 }}
                transition={{ duration: 1.2, ease: "backIn" }}
              >
                {weeks.flat().map((day, idx) => {
                  if (!day) return <div key={idx} className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10" />;
                  const dateKey = toKey(year, month, day);
                  const count = data[dateKey] ?? 0;
                  const lv = densityLevel(count);
                  const isToday = dateKey === todayKey;
                  const isRevealed = revealed.has(day);
                  const isSkull = day === skullDay;

                  return (
                    <div
                      key={idx}
                      className={`w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 relative flex items-center justify-center text-[10px] sm:text-xs md:text-sm cursor-crosshair select-none transition-colors hover:bg-slate-100/80 dark:hover:bg-slate-900/80 ${
                        isToday ? "ring-1 ring-blue-500/50" : ""
                      }`}
                      onClick={() => handleDayClick(day)}
                      onMouseEnter={(e) => !isGameOver && setTooltip({ dateKey, count, x: e.clientX, y: e.clientY })}
                      onMouseLeave={() => setTooltip(null)}
                    >
                      {/* The Key Brackets & Symbol - Flies Away */}
                      <m.div
                        className="flex items-center justify-center pointer-events-none"
                        animate={isRevealed || (isGameOver && isSkull) ? { y: -100, opacity: 0, rotate: 45, scale: 1.5 } : { y: 0, opacity: 1, rotate: 0, scale: 1 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      >
                        <span className="opacity-30">[</span>
                        <span className="text-blue-900 dark:text-blue-300">{SYMBOLS[lv]}</span>
                        <span className="opacity-30">]</span>
                      </m.div>

                      {/* The Crystal - Zooms in from behind */}
                      {isRevealed && !isSkull && (
                        <m.div 
                          initial={{ scale: 0, opacity: 0, rotate: -360 }}
                          animate={{ scale: 1, opacity: 1, rotate: 720 }}
                          transition={{ duration: 1, type: "spring", stiffness: 100, damping: 20 }}
                          className="absolute inset-0 flex items-center justify-center text-blue-700 dark:text-blue-400 text-lg pointer-events-none"
                        >
                          ❄
                        </m.div>
                      )}

                      {/* The Skull */}
                      {isGameOver && isSkull && (
                        <m.div 
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="absolute inset-0 flex items-center justify-center text-lg pointer-events-none"
                        >
                          💀
                        </m.div>
                      )}
                    </div>
                  );
                })}
              </m.div>

              {isGameOver && (
                <m.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 flex flex-col items-center justify-center z-20"
                >
                  <m.div 
                    initial={{ scale: 0.8, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    className="dark:bg-slate-900 bg-slate-50 border border-slate-300 dark:border-slate-600 p-8 flex flex-col items-center"
                  >
                    <span className="text-4xl mb-6 animate-bounce">💀</span>
                    <button 
                      onClick={() => {
                        setRevealed(new Set());
                        setIsGameOver(false);
                        setSkullDay(Math.floor(Math.random() * new Date(year, month + 1, 0).getDate()) + 1);
                      }}
                      className="px-6 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-300 font-mono text-[10px] tracking-widest uppercase hover:bg-blue-200 dark:hover:bg-blue-950 transition-colors cursor-pointer"
                    >
                      [ Try Again ]
                    </button>
                  </m.div>
                </m.div>
              )}
            </div>

            {/* Hint */}
            {/* {!isGameOver && revealed.size === 0 && (
              <div className="mt-2 text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] animate-pulse">
                Find the crystals ❄ &middot; avoid the trap 💀
              </div>
            )} */}

            {/* Divider */}
            <hr className="w-full max-w-sm border-t border-slate-200/50 dark:border-slate-800/50 my-4" />

            {/* Stats */}
            <div className="text-[10px] text-slate-500 dark:text-slate-400 tracking-wider text-center leading-relaxed">
              <span className="text-slate-800 dark:text-slate-200 font-bold">{GITHUB_PROFILES.length}</span>
              <span> profiles </span>
              <span className="opacity-50">&middot; </span>
              <span className="text-slate-800 dark:text-slate-200 font-bold">{monthTotal.toLocaleString()}</span>
              <span> commits </span>
              <span className="opacity-50">&middot; </span>
              <span className="text-slate-800 dark:text-slate-200 font-bold">{activeDays}</span>
              <span> days</span>
              {peakDay !== null && (
                <span className="inline-block">
                  <span className="opacity-50"> &middot; </span>
                  <span>peak </span>
                  <span className="text-slate-800 dark:text-slate-200 font-bold">
                    day {peakDay} ({peakCount})
                  </span>
                  <span className="animate-[pulse_1s_step-end_infinite] text-blue-600 dark:text-blue-400 ml-1">_</span>
                </span>
              )}
            </div>
          </m.div>
        )}
      </m.div>
      
      {/* Tooltip */}
      {tooltip && (
        <div
          style={{ left: tooltip.x, top: tooltip.y }}
          className="fixed pointer-events-none transform -translate-x-1/2 -translate-y-full -mt-4 dark:bg-slate-900 bg-slate-50 border border-slate-300 dark:border-slate-600 dark:text-slate-300 text-slate-800 font-mono text-[10px] whitespace-pre px-3 py-1.5 z-[999] leading-relaxed tracking-wider"
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
