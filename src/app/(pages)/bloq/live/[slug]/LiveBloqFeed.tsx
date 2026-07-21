"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Wifi, WifiOff } from "lucide-react";
import type { LiveEntry, LiveSession } from "@/lib/live-bloq/types";

interface LiveBloqFeedProps {
  session: LiveSession;
  initialEntries: LiveEntry[];
  slug: string;
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function formatTimeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return formatTimestamp(iso);
}

function maxSequence(entries: LiveEntry[]): number {
  if (entries.length === 0) return 0;
  return Math.max(...entries.map((e) => e.sequence));
}

export function LiveBloqFeed({
  session,
  initialEntries,
  slug,
}: LiveBloqFeedProps) {
  const isInitiallyLive = session.status === "active";
  // Live: DESC (newest first). Closed: keep server ASC (oldest first).
  const [entries, setEntries] = useState<LiveEntry[]>(
    isInitiallyLive ? [...initialEntries].reverse() : initialEntries,
  );
  const [liveStatus, setLiveStatus] = useState(session.status);
  const [connectionOk, setConnectionOk] = useState(true);
  const lastSequenceRef = useRef(maxSequence(initialEntries));
  const liveStatusRef = useRef(session.status);

  const isLive = liveStatus === "active";

  const poll = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/live-bloq/${slug}/entries?after=${lastSequenceRef.current}`,
      );
      if (!res.ok) {
        setConnectionOk(false);
        return;
      }

      setConnectionOk(true);
      const data = await res.json();
      if (data.entries && data.entries.length > 0) {
        setEntries((prev) => {
          const existingIds = new Set(prev.map((e) => e.id));
          const newEntries = data.entries.filter(
            (e: LiveEntry) => !existingIds.has(e.id),
          );
          if (newEntries.length === 0) return prev;
          // API returns ASC; reverse batch then prepend so newest stays at index 0.
          return [...[...newEntries].reverse(), ...prev];
        });
        const maxSeq = Math.max(
          ...data.entries.map((e: LiveEntry) => e.sequence),
        );
        if (maxSeq > lastSequenceRef.current) {
          lastSequenceRef.current = maxSeq;
        }
      }

      if (data.sessionStatus && data.sessionStatus !== "active") {
        if (liveStatusRef.current === "active") {
          setEntries((current) => [...current].reverse());
        }
        liveStatusRef.current = data.sessionStatus;
        setLiveStatus(data.sessionStatus);
      }
    } catch {
      setConnectionOk(false);
    }
  }, [slug]);

  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(poll, 30000);
    return () => clearInterval(interval);
  }, [isLive, poll]);

  return (
    <div className="space-y-4">
      {/* Status bar */}
      <div className="flex items-center justify-between flex-wrap pt-2 gap-2">
        <div className="flex items-center gap-3">
          {isLive ? (
            <div className="inline-flex items-center gap-2 rounded-sm bg-red-500/10 px-2.5 py-1 text-sm font-medium text-red-500">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-[1px] bg-red-400 opacity-75" />
                <span className="relative inline-flex h-full w-full rounded-[1px] bg-red-500" />
              </span>
              Live
            </div>
          ) : liveStatus === "closed" ? (
            <div className="inline-flex items-center gap-2 rounded-sm border border-slate-300 bg-slate-100 px-2.5 py-1 text-sm font-medium text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200">
              <span className="h-2 w-2 border border-slate-300 dark:border-slate-600" />
              Session ended
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 rounded-sm bg-amber-500/10 px-2.5 py-1 text-sm font-medium text-amber-600 dark:text-amber-400">
              <span className="h-2 w-2 rounded-[1px] bg-amber-500" />
              Cancelled
            </div>
          )}
          <span className="text-xs text-muted-foreground">
            {entries.length} {entries.length === 1 ? "entry" : "entries"}
          </span>
        </div>

        {isLive && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {connectionOk ? (
              <Wifi className="h-3 w-3 text-emerald-500" />
            ) : (
              <WifiOff className="h-3 w-3 text-amber-500" />
            )}
            <span>{connectionOk ? "Connected" : "Reconnecting..."}</span>
          </div>
        )}
      </div>

      {/* Entry list */}
      {entries.length > 0 ? (
        <ul className="relative space-y-0">
          {/* Timeline line */}
          <div
            className="absolute left-[7px] top-3 bottom-3 w-px bg-border"
            aria-hidden="true"
          />

          <AnimatePresence initial={false}>
            {entries.map((entry, i) => {
              const isLatest = isLive && i === 0; // Highlight newest entry (sorted descending)

              return (
                <motion.li
                  layout
                  key={entry.id}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="relative flex gap-4 pb-4 last:pb-0"
                >
                  {/* Entry content */}
                  <div
                    className={`flex-1 min-w-0 rounded-lg px-3 py-2 -ml-1 cursor-default transition-all duration-200 ease-out ${isLatest
                        ? "bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 hover:shadow-red-500/5"
                        : "bg-muted/30 hover:bg-muted/50"
                      }`}
                  >
                    <div className="flex items-baseline gap-2 mb-0.5">
                      <time
                        className="shrink-0 text-xs tabular-nums text-muted-foreground font-mono"
                        dateTime={entry.created_at}
                      >
                        {formatTimestamp(entry.created_at)}
                      </time>
                      {isLive && (
                        <span className="text-[10px] text-muted-foreground/60">
                          {formatTimeAgo(entry.created_at)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">
                      {entry.content}
                    </p>
                  </div>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <span className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground/40" />
          </div>
          <p className="text-sm text-muted-foreground">
            {isLive
              ? "Waiting for the first update..."
              : "No entries in this session."}
          </p>
          {isLive && (
            <p className="mt-1 text-xs text-muted-foreground/60">
              Updates will appear here automatically
            </p>
          )}
        </div>
      )}
    </div>
  );
}
