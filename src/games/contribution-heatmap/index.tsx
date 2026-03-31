"use client";

import { useState, useEffect } from "react";
import { motion as m } from "framer-motion";
import { CardBackground } from "@/components/shared/CardBackground";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SiGithub } from "react-icons/si";
import { GITHUB_PROFILES } from "@/data/github";
import GamePopup from "@/games/shared/GamePopup";
import { useHeatmapGame } from "./hooks/useHeatmapGame";
import { buildMonthGrid, toKey, densityLevel } from "./utils";

const ACHIEVEMENT_THRESHOLD = 27;

const SYMBOLS = ["\u00A0", "✧", "✲", "✷", "❃", "❁"];
const SPINNER = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const BOOT_STEPS = [
  { label: "initializing engine", duration: 280 },
  { label: "fetching remote timeline", duration: 800 },
  { label: "merging contributions", duration: 240 },
  { label: "done", duration: 160 },
];

export const ContributionHeatmap = ({ data: externalData = null }: { data?: Record<string, number> | null }) => {
  const [error, setError] = useState<string | null>(null);
  const [bootStep, setBootStep] = useState(-1);
  const [doneSteps, setDoneSteps] = useState<number[]>([]);
  const [spinIdx, setSpinIdx] = useState(0);
  const [booted, setBooted] = useState(false);
  const [tooltip, setTooltip] = useState<{ dateKey: string; count: number; x: number; y: number } | null>(null);

  const { state, actions, stats, isAtLatest } = useHeatmapGame(externalData);
  const now = new Date();
  const todayKey = now.toISOString().slice(0, 10);

  useEffect(() => {
    const id = setInterval(() => setSpinIdx((i) => (i + 1) % SPINNER.length), 80);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const runBoot = async () => {
      setBootStep(0);
      await new Promise(r => setTimeout(r, 280));
      setDoneSteps(p => [...p, 0]);

      setBootStep(1);
      try {
        const res = await fetch('/api/github-activity');
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Failed to fetch GitHub activity");
        }
        const githubData = await res.json();
        actions.setData(githubData);
        setDoneSteps(p => [...p, 1]);
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Unknown error";
        setError(message);
        return;
      }

      setBootStep(2);
      await new Promise(r => setTimeout(r, 240));
      setDoneSteps(p => [...p, 2]);

      setBootStep(3);
      await new Promise(r => setTimeout(r, 160));
      setDoneSteps(p => [...p, 3]);

      setTimeout(() => {
        setBootStep(-1);
        setBooted(true);
      }, 120);
    };

    if (externalData) {
      actions.setData(externalData);
      setBooted(true);
    } else {
      runBoot();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalData]);

  const weeks = buildMonthGrid(state.year, state.month);

  const achievement = {
    unlocked: state.isWin && state.score > ACHIEVEMENT_THRESHOLD,
    title: "Crystal Master!",
    emoji: "💎",
  };

  const hint = !achievement.unlocked 
    ? `Collect ${ACHIEVEMENT_THRESHOLD + 1}+ for Crystal Master 💎` 
    : undefined;

  return (
    <>
      <m.div 
        className="relative isolate p-5 overflow-hidden blue-border project-list flex flex-col font-mono text-xs w-full max-w-2xl"
        initial="rest"
        whileHover="hover"
        animate="rest"
      >
        <CardBackground />
        
        <div className="flex justify-between items-center text-[10px] text-slate-500 tracking-wider pb-1">
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
        </div>

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

        {booted && (
          <m.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center w-full"
          >
            <div className="flex justify-between items-center w-full max-w-sm border-b border-slate-200/50 dark:border-slate-800/50">
              <button
                onClick={actions.prevMonth}
                className="w-8 h-8 flex items-center justify-center hover:bg-slate-100/80 dark:hover:bg-slate-900/80 transition-colors cursor-pointer text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-bold tracking-widest uppercase text-blue-600 dark:text-blue-400">
                {MONTHS[state.month]} {state.year}
              </span>
              <button
                onClick={actions.nextMonth}
                disabled={isAtLatest}
                className={`w-8 h-8 flex items-center justify-center transition-colors ${
                  isAtLatest ? "opacity-30 cursor-default text-slate-400" : "hover:bg-slate-100/80 dark:hover:bg-slate-900/80 cursor-pointer text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="relative">
              <m.div 
                className="grid grid-cols-7 grid-rows-6 gap-0.5 md:gap-1 my-1 mx-auto"
                animate={state.isGameOver ? { y: 300, opacity: 0, rotate: 5 } : { y: 0, opacity: 1, rotate: 0 }}
                transition={{ duration: 1.2, ease: "backIn" }}
              >
                {weeks.flat().map((day, idx) => {
                  if (!day) return <div key={idx} className="w-8 h-8 border border-slate-200/30 dark:border-slate-800/30" />;
                  const dateKey = toKey(state.year, state.month, day);
                  const count = state.data[dateKey] ?? 0;
                  const lv = densityLevel(count);
                  const isToday = dateKey === todayKey;
                  const isRevealed = state.revealed.has(day);
                  const isSkull = day === state.skullDay;

                  return (
                    <div
                      key={idx}
                      className={`w-8 h-8 border border-slate-200/30 dark:border-slate-800/30 relative flex items-center justify-center text-[10px] sm:text-xs md:text-sm cursor-crosshair select-none transition-colors hover:bg-slate-100/80 dark:hover:bg-slate-900/80 group ${
                        isToday ? "ring-1 ring-blue-500/50" : ""
                      }`}
                      onClick={() => actions.handleDayClick(day)}
                      onMouseEnter={(e) => !state.isGameOver && !isRevealed && setTooltip({ dateKey, count, x: e.clientX, y: e.clientY })}
                      onMouseLeave={() => setTooltip(null)}
                    >
                      <m.div
                        className="flex items-center justify-center pointer-events-none"
                        animate={isRevealed || (state.isGameOver && isSkull) ? { y: -100, opacity: 0, rotate: 45, scale: 1.5 } : { y: 0, opacity: 1, rotate: 0, scale: 1 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      >
                        <span className="opacity-50">[</span>
                        <span className="font-bold text-blue-900 dark:text-blue-300">{SYMBOLS[lv]}</span>
                        <span className="opacity-50">]</span>
                      </m.div>

                      {isRevealed && !isSkull && (
                        <m.div 
                          initial={{ scale: 0, opacity: 0, rotate: -360 }}
                          animate={{ scale: 1, opacity: 1, rotate: 720 }}
                          transition={{ rotate: { duration: 1, type: "spring", stiffness: 100, damping: 20 }, scale: { duration: 1, type: "spring", stiffness: 100, damping: 20 }, opacity: { duration: 1 } }}
                          className="absolute inset-0 flex items-center justify-center text-blue-700 dark:text-blue-400 text-lg pointer-events-none group"
                        >
                          <m.span
                            animate={{ rotate: 360 }}
                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                            className="inline-block group-hover:[animation-play-state:paused]"
                          >
                            💎
                          </m.span>
                        </m.div>
                      )}

                      {state.isGameOver && isSkull && (
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

              <GamePopup
                isOpen={state.isGameOver}
                type={state.isWin ? "win" : "lose"}
                emoji={state.isWin ? "💎" : "💀"}
                scores={[{ label: "Crystals collected", value: state.score }]}
                onRestart={actions.restart}
                restartLabel={state.isWin ? "[ Win Again ]" : "[ Try Again ]"}
                achievement={achievement}
                showConfetti={achievement.unlocked}
                hint={hint}
              />
            </div>

            <hr className="w-full max-w-sm border-t border-slate-200/50 dark:border-slate-800/50" />

            <div className="text-[10px] pt-2 text-slate-500 dark:text-slate-400 tracking-wider text-center leading-relaxed">
              <span className="text-slate-800 dark:text-slate-200 font-bold">{GITHUB_PROFILES.length}</span>
              <span> profiles </span>
              <span className="opacity-50">&middot; </span>
              <span className="text-slate-800 dark:text-slate-200 font-bold">{stats.monthTotal.toLocaleString()}</span>
              <span> commits </span>
              <span className="opacity-50">&middot; </span>
              <span className="text-slate-800 dark:text-slate-200 font-bold">{stats.activeDays}</span>
              <span> days</span>
              {stats.peakDay !== null && (
                <span className="inline-block">
                  <span className="opacity-50"> &middot; </span>
                  <span>peak </span>
                  <span className="text-slate-800 dark:text-slate-200 font-bold">
                    day {stats.peakDay} ({stats.peakCount})
                  </span>
                  <span className="animate-[pulse_1s_step-end_infinite] text-blue-600 dark:text-blue-400 ml-1">_</span>
                </span>
              )}
            </div>
          </m.div>
        )}
      </m.div>
      
      {tooltip && (
        <div
          style={{ left: tooltip.x, top: tooltip.y }}
          className="fixed pointer-events-none transform -translate-x-1/2 -translate-y-full -mt-4 dark:bg-slate-900 bg-slate-50 border border-slate-300 dark:border-slate-600 dark:text-slate-300 text-slate-800 font-mono text-[10px] whitespace-pre px-3 py-1.5 z-[999] leading-relaxed tracking-wider"
        >
          <div className="flex flex-col items-center justify-center gap-0.5">
            <span>{tooltip.dateKey}</span>
            <span className="text-blue-400">{tooltip.count} commits</span>
          </div>
        </div>
      )}
    </>
  );
};
