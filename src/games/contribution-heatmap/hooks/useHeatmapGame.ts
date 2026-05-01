import { useState, useEffect, useCallback, useMemo } from 'react';
import { HeatmapState, HeatmapStats } from '@/games/shared/types';
import { findSecondHighestDay } from '@/games/shared/utils';

const WIN_THRESHOLD = 20;

export function useHeatmapGame(externalData: Record<string, number> | null) {
  const [data, setData] = useState<Record<string, number>>(externalData || {});
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [month, setMonth] = useState(() => new Date().getMonth());
  const [skullDay, setSkullDay] = useState<number | null>(null);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [isGameOver, setIsGameOver] = useState(false);
  const [isWin, setIsWin] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const getSmartSkullDay = useCallback((data: Record<string, number>, year: number, month: number): number => {
    const smartDay = findSecondHighestDay(data, year, month);
    if (smartDay > 0) return smartDay;
    const days = new Date(year, month + 1, 0).getDate();
    return Math.floor(Math.random() * days) + 1;
  }, []);

  const restart = useCallback(() => {
    setRevealed(new Set());
    setIsGameOver(false);
    setIsWin(false);
    setIsPlaying(true);
    setSkullDay(getSmartSkullDay(data, year, month));
  }, [data, year, month, getSmartSkullDay]);

  useEffect(() => {
    setSkullDay(getSmartSkullDay(data, year, month));
    setRevealed(new Set());
    setIsGameOver(false);
    setIsWin(false);
    setIsPlaying(true);
  }, [year, month, data, getSmartSkullDay]);

  const handleDayClick = useCallback((day: number) => {
    if (isGameOver || revealed.has(day)) return;

    if (day === skullDay) {
      const won = revealed.size >= WIN_THRESHOLD;
      setIsGameOver(true);
      setIsWin(won);
      setIsPlaying(false);
    } else {
      const newRevealed = new Set(revealed);
      newRevealed.add(day);
      setRevealed(newRevealed);
    }
  }, [isGameOver, revealed, skullDay]);

  const prevMonth = useCallback(() => {
    if (month === 0) {
      setYear(y => y - 1);
      setMonth(11);
    } else {
      setMonth(m => m - 1);
    }
  }, [month]);

  const nextMonth = useCallback(() => {
    const now = new Date();
    const isAtLatest = year === now.getFullYear() && month === now.getMonth();
    if (isAtLatest) return;

    if (month === 11) {
      setYear(y => y + 1);
      setMonth(0);
    } else {
      setMonth(m => m + 1);
    }
  }, [year, month]);

  const stats: HeatmapStats = useMemo(() => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let monthTotal = 0;
    let activeDays = 0;
    let peakCount = 0;
    let peakDay: number | null = null;

    for (let d = 1; d <= daysInMonth; d++) {
      const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const c = data[dateKey] ?? 0;
      monthTotal += c;
      if (c > 0) activeDays++;
      if (c > peakCount) {
        peakCount = c;
        peakDay = d;
      }
    }

    return { monthTotal, activeDays, peakCount, peakDay };
  }, [data, year, month]);

  const state: HeatmapState = {
    isPlaying,
    isGameOver,
    isWin,
    score: revealed.size,
    moves: revealed.size,
    revealed,
    skullDay,
    year,
    month,
    data,
  };

  const actions = useMemo(() => ({
    handleDayClick,
    restart,
    prevMonth,
    nextMonth,
    setData,
  }), [handleDayClick, restart, prevMonth, nextMonth, setData]);

  const isAtLatest = useMemo(() => {
    const now = new Date();
    return year === now.getFullYear() && month === now.getMonth();
  }, [year, month]);

  return {
    state,
    actions,
    stats,
    isAtLatest,
    setData,
  };
}
