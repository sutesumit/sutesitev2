"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion as m } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SiGithub } from "react-icons/si";
import { CardBackground } from "@/components/shared/CardBackground";
import { GITHUB_PROFILES } from "@/data/github";
import GamePopup from "@/games/shared/GamePopup";
import type { ContributionMonthResponse } from "@/services/github";
import { useHeatmapGame } from "./hooks/useHeatmapGame";
import { buildMonthGrid, densityLevel, toKey, toMonthKey } from "./utils";

const ACHIEVEMENT_THRESHOLD = 27;
const SYMBOLS = ["\u00A0", "\u2727", "\u2732", "\u2737", "\u2743", "\u2741"];
const SPINNER = ["\u280B", "\u2819", "\u2839", "\u2838", "\u283C", "\u2834", "\u2826", "\u2827", "\u2807", "\u280F"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const LOADING_GLYPH = "\u00B7";
const EMPTY_GLYPH = "\u00A0";

const BOOT_STEPS = [
  { label: "initializing engine", duration: 280 },
  { label: "fetching remote timeline", duration: 800 },
  { label: "merging contributions", duration: 240 },
  { label: "done", duration: 160 },
];

async function fetchMonthActivity(year: number, month: number): Promise<ContributionMonthResponse> {
  const params = new URLSearchParams({
    year: String(year),
    month: String(month + 1),
  });

  const res = await fetch(`/api/github-activity?${params.toString()}`);
  const payload = await res.json();

  if (!res.ok) {
    throw new Error(
      typeof payload?.details === "string"
        ? payload.details
        : payload?.error || "Failed to fetch GitHub activity"
    );
  }

  return payload as ContributionMonthResponse;
}

export const ContributionHeatmap = ({ data: externalData = null }: { data?: Record<string, number> | null }) => {
  const [error, setError] = useState<string | null>(null);
  const [bootStep, setBootStep] = useState(-1);
  const [doneSteps, setDoneSteps] = useState<number[]>([]);
  const [spinIdx, setSpinIdx] = useState(0);
  const [booted, setBooted] = useState(false);
  const [isMonthLoading, setIsMonthLoading] = useState(false);
  const [monthsByKey, setMonthsByKey] = useState<Record<string, Record<string, number>>>({});
  const [retryNonce, setRetryNonce] = useState(0);
  const [tooltip, setTooltip] = useState<{ dateKey: string; count: number; x: number; y: number } | null>(null);
  const [transitionSnapshot, setTransitionSnapshot] = useState<{
    key: string;
    slots: ("gem" | "skull" | null)[];
  } | null>(null);

  const { state, actions, stats, isAtLatest, setData } = useHeatmapGame(externalData);
  const now = new Date();
  const todayKey = now.toISOString().slice(0, 10);
  const currentMonthKey = toMonthKey(state.year, state.month);
  const cachedMonthData = monthsByKey[currentMonthKey] ?? null;

  useEffect(() => {
    const id = setInterval(() => setSpinIdx((i) => (i + 1) % SPINNER.length), 80);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const initialYear = now.getFullYear();
    const initialMonth = now.getMonth();

    const runBoot = async () => {
      setBootStep(0);
      await new Promise((resolve) => setTimeout(resolve, 280));
      setDoneSteps((prev) => [...prev, 0]);

      setBootStep(1);
      try {
        const githubMonth = await fetchMonthActivity(initialYear, initialMonth);
        setMonthsByKey({ [githubMonth.monthKey]: githubMonth.data });
        setData(githubMonth.data);
        setDoneSteps((prev) => [...prev, 1]);
      } catch (bootError: unknown) {
        const message = bootError instanceof Error ? bootError.message : "Unknown error";
        setError(message);
        return;
      }

      setBootStep(2);
      await new Promise((resolve) => setTimeout(resolve, 240));
      setDoneSteps((prev) => [...prev, 2]);

      setBootStep(3);
      await new Promise((resolve) => setTimeout(resolve, 160));
      setDoneSteps((prev) => [...prev, 3]);

      setTimeout(() => {
        setBootStep(-1);
        setBooted(true);
      }, 120);
    };

    if (externalData) {
      const initialMonthKey = toMonthKey(initialYear, initialMonth);
      setMonthsByKey({ [initialMonthKey]: externalData });
      setData(externalData);
      setBooted(true);
      return;
    }

    void runBoot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalData]);

  useEffect(() => {
    if (!booted) {
      return;
    }

    if (cachedMonthData) {
      setError(null);
      setIsMonthLoading(false);
      setData(cachedMonthData);
      return;
    }

    let isCancelled = false;

    const loadMonth = async () => {
      setTooltip(null);
      setError(null);
      setIsMonthLoading(true);
      setData({});

      try {
        const monthPayload = await fetchMonthActivity(state.year, state.month);
        if (isCancelled) {
          return;
        }

        setMonthsByKey((prev) => ({
          ...prev,
          [monthPayload.monthKey]: monthPayload.data,
        }));
        setData(monthPayload.data);
      } catch (monthError: unknown) {
        if (isCancelled) {
          return;
        }

        const message = monthError instanceof Error ? monthError.message : "Unknown error";
        setError(message);
      } finally {
        if (!isCancelled) {
          setIsMonthLoading(false);
        }
      }
    };

    void loadMonth();

    return () => {
      isCancelled = true;
    };
  }, [booted, cachedMonthData, retryNonce, setData, state.month, state.year]);

  const weeks = buildMonthGrid(state.year, state.month);
  const achievement = {
    unlocked: state.isWin && state.score > ACHIEVEMENT_THRESHOLD,
    title: "Crystal Master!",
    emoji: "\uD83D\uDC8E",
  };
  const hint = !achievement.unlocked ? `Collect ${ACHIEVEMENT_THRESHOLD + 1}+ for Crystal Master \uD83D\uDC8E` : undefined;
  const boardCells = weeks.flat();

  useEffect(() => {
    if (!transitionSnapshot) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setTransitionSnapshot((current) => (current?.key === transitionSnapshot.key ? null : current));
    }, 420);

    return () => window.clearTimeout(timeoutId);
  }, [transitionSnapshot]);

  const captureTransitionSnapshot = () => {
    setTooltip(null);
    setIsMonthLoading(true);

    if (state.revealed.size === 0 && !(state.isGameOver && state.skullDay !== null)) {
      setTransitionSnapshot(null);
      return;
    }

    const slots = boardCells.map((day) => {
      if (day === null) {
        return null;
      }

      if (state.isGameOver && state.skullDay === day) {
        return "skull";
      }

      if (state.revealed.has(day)) {
        return "gem";
      }

      return null;
    });

    setTransitionSnapshot({
      key: `${currentMonthKey}-${Date.now()}`,
      slots,
    });
  };

  const handlePrevMonth = () => {
    captureTransitionSnapshot();
    actions.prevMonth();
  };

  const handleNextMonth = () => {
    captureTransitionSnapshot();
    actions.nextMonth();
  };

  const handleRetryMonth = () => {
    setRetryNonce((prev) => prev + 1);
  };

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
              <SiGithub />
              {profile}
            </a>
          ))}
        </div>

        {!booted && (
          <div className="text-[11px] leading-loose tracking-wide min-h-[100px] text-slate-600 dark:text-slate-400">
            {BOOT_STEPS.map(({ label }, i) => {
              const running = bootStep === i;
              const finished = doneSteps.includes(i);

              if (!running && !finished) {
                return null;
              }

              return (
                <div key={i} className="flex gap-2 items-center">
                  <span className="opacity-50">$</span>
                  <span className="w-4 text-blue-600 dark:text-blue-400">
                    {running && !error ? SPINNER[spinIdx] : finished ? "\u2713" : error && running ? "\u2717" : " "}
                  </span>
                  <span className={finished ? "text-slate-800 dark:text-slate-200" : "text-slate-600 dark:text-slate-500"}>
                    {label}
                  </span>
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
            {bootStep >= 0 && !error && (
              <span className="animate-[pulse_1s_step-end_infinite] text-blue-600 dark:text-blue-400">{"\u2588"}</span>
            )}
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
                onClick={handlePrevMonth}
                disabled={isMonthLoading}
                className={`w-8 h-8 flex items-center justify-center transition-colors ${
                  isMonthLoading
                    ? "opacity-30 cursor-default text-slate-400"
                    : "hover:bg-slate-100/80 dark:hover:bg-slate-900/80 cursor-pointer text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                <ChevronLeft size={16} />
              </button>

              <div className="flex flex-col items-center py-1">
                <span className="text-xs font-bold tracking-widest uppercase text-blue-600 dark:text-blue-400">
                  {MONTHS[state.month]} {state.year}
                </span>
                {/* {isMonthLoading && (
                  <span className="text-[9px] tracking-[0.25em] uppercase text-slate-500 dark:text-slate-400">
                    [ loading {currentMonthKey} ]
                  </span>
                )} */}
              </div>

              <button
                onClick={handleNextMonth}
                disabled={isAtLatest || isMonthLoading}
                className={`w-8 h-8 flex items-center justify-center transition-colors ${
                  isAtLatest || isMonthLoading
                    ? "opacity-30 cursor-default text-slate-400"
                    : "hover:bg-slate-100/80 dark:hover:bg-slate-900/80 cursor-pointer text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="relative">
              <m.div
                className="grid grid-cols-7 grid-rows-6 gap-0.5 md:gap-1 my-1 mx-auto"
                animate={state.isGameOver && !isMonthLoading ? { y: 300, opacity: 0, rotate: 5 } : { y: 0, opacity: 1, rotate: 0 }}
                transition={{ duration: 1.2, ease: "backIn" }}
              >
                {boardCells.map((day, idx) => {
                  const isPlaceholder = day === null;
                  const dateKey = isPlaceholder ? null : toKey(state.year, state.month, day);
                  const count = dateKey ? state.data[dateKey] ?? 0 : 0;
                  const lv = densityLevel(count);
                  const isToday = dateKey === todayKey;
                  const isRevealed = day !== null && state.revealed.has(day);
                  const isSkull = day !== null && day === state.skullDay;
                  const isActuallyRevealed = isRevealed || (state.isGameOver && isSkull);
                  const innerVisible = !isPlaceholder && !isActuallyRevealed;
                  const centerGlyph = isPlaceholder
                    ? EMPTY_GLYPH
                    : isMonthLoading
                      ? LOADING_GLYPH
                      : SYMBOLS[lv] ?? EMPTY_GLYPH;
                  const transitionGlyph = transitionSnapshot?.slots[idx] ?? null;

                  return (
                    <div
                      key={idx}
                      className={`w-8 h-8 border border-slate-200/30 dark:border-slate-800/30 relative flex items-center justify-center text-[10px] sm:text-xs md:text-sm select-none transition-colors group ${
                        isMonthLoading && !isPlaceholder
                          ? "cursor-progress"
                          : !isPlaceholder
                            ? "cursor-crosshair hover:bg-slate-100/80 dark:hover:bg-slate-900/80"
                            : ""
                      } ${isToday ? "ring-1 ring-blue-500/50" : ""}`}
                      onClick={isMonthLoading || isPlaceholder ? undefined : () => actions.handleDayClick(day)}
                      onMouseEnter={(e) =>
                        !isMonthLoading &&
                        !isPlaceholder &&
                        !state.isGameOver &&
                        !isRevealed &&
                        dateKey &&
                        setTooltip({ dateKey, count, x: e.clientX, y: e.clientY })
                      }
                      onMouseLeave={() => setTooltip(null)}
                    >
                      <m.div
                        className="absolute inset-0 flex items-center justify-center pointer-events-none"
                        animate={{
                          opacity: innerVisible ? 1 : 0,
                          y: innerVisible ? 0 : 20,
                          rotate: innerVisible ? 0 : (idx % 2 === 0 ? 15 : -15),
                        }}
                        transition={{ duration: 0.4, delay: innerVisible ? idx * 0.008 : 0, ease: "backIn" }}
                      >
                        <span className="opacity-50">[</span>
                        <AnimatePresence mode="wait" initial={false}>
                          <m.span
                            key={`${currentMonthKey}-${isMonthLoading ? "loading" : "loaded"}-${idx}-${centerGlyph}`}
                            initial={{ opacity: 0, y: 2 }}
                            animate={{
                              opacity: 1,
                              y: 0,
                              scale: isMonthLoading && !isPlaceholder ? [1, 1.08, 1] : 1,
                            }}
                            exit={{ opacity: 0, y: -2 }}
                            transition={{
                              duration: 0.18,
                              delay: idx * 0.004,
                              ease: "easeOut",
                              scale: {
                                duration: 0.9,
                                repeat: isMonthLoading && !isPlaceholder ? Infinity : 0,
                                ease: "easeInOut",
                              },
                            }}
                            className={`font-bold ${
                              isMonthLoading
                                ? "text-slate-400 dark:text-slate-500"
                                : "text-blue-900 dark:text-blue-300"
                            }`}
                          >
                            {isMonthLoading && !isPlaceholder ? LOADING_GLYPH : centerGlyph}
                          </m.span>
                        </AnimatePresence>
                        <span className="opacity-50">]</span>
                      </m.div>

                      {!isMonthLoading && isRevealed && !isSkull && (
                        <m.div
                          initial={{ scale: 0, opacity: 0, rotate: -360 }}
                          animate={{ scale: 1, opacity: 1, rotate: 720 }}
                          transition={{
                            rotate: { duration: 1, type: "spring", stiffness: 100, damping: 20 },
                            scale: { duration: 1, type: "spring", stiffness: 100, damping: 20 },
                            opacity: { duration: 1 },
                          }}
                          className="absolute inset-0 flex items-center justify-center text-blue-700 dark:text-blue-400 text-lg pointer-events-none group"
                        >
                          <m.span
                            animate={{ rotate: 360 }}
                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                            className="inline-block group-hover:[animation-play-state:paused]"
                          >
                            {"\uD83D\uDC8E"}
                          </m.span>
                        </m.div>
                      )}

                      {!isMonthLoading && state.isGameOver && isSkull && (
                        <m.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="absolute inset-0 flex items-center justify-center text-lg pointer-events-none"
                        >
                          {"\uD83D\uDC80"}
                        </m.div>
                      )}

                      <AnimatePresence>
                        {transitionGlyph === "gem" && transitionSnapshot && (
                          <m.div
                            key={`transition-gem-${transitionSnapshot.key}-${idx}`}
                            initial={{ scale: 1, opacity: 1, rotate: 0 }}
                            animate={{ scale: 1, opacity: 1, rotate: 0 }}
                            exit={{ y: -24, scale: 0.3, opacity: 0, rotate: 180 }}
                            transition={{ duration: 0.36, ease: "easeInOut" }}
                            className="absolute inset-0 flex items-center justify-center text-blue-700 dark:text-blue-400 text-lg pointer-events-none"
                          >
                            {"\uD83D\uDC8E"}
                          </m.div>
                        )}
                        {transitionGlyph === "skull" && transitionSnapshot && (
                          <m.div
                            key={`transition-skull-${transitionSnapshot.key}-${idx}`}
                            initial={{ scale: 1, opacity: 1 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ y: 24, scale: 0.5, opacity: 0, rotate: -90 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="absolute inset-0 flex items-center justify-center text-lg pointer-events-none"
                          >
                            {"\uD83D\uDC80"}
                          </m.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </m.div>

              <GamePopup
                isOpen={!isMonthLoading && state.isGameOver}
                type={state.isWin ? "win" : "lose"}
                emoji={state.isWin ? "\uD83D\uDC8E" : "\uD83D\uDC80"}
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
              {error ? (
                <div className="flex flex-col items-center gap-2">
                  <span className="text-red-500/80">[ERROR]: {error}</span>
                  <button
                    onClick={handleRetryMonth}
                    className="text-[9px] underline cursor-pointer hover:text-red-400"
                  >
                    [ retry_month ]
                  </button>
                </div>
              ) : isMonthLoading ? (
                <span>
                  syncing <span className="text-slate-800 dark:text-slate-200 font-bold">{currentMonthKey}</span>
                  <span className="animate-[pulse_1s_step-end_infinite] text-blue-600 dark:text-blue-400 ml-1">_</span>
                </span>
              ) : (
                <>
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
                </>
              )}
            </div>
          </m.div>
        )}
      </m.div>

      {tooltip && !isMonthLoading && (
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
