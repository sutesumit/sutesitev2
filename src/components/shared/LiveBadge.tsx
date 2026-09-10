import { cn } from "@/lib/utils";

export function LiveBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-500",
        className
      )}
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping bg-red-400 opacity-75" />
        <span className="relative inline-flex h-full w-full bg-red-500" />
      </span>
      Live
    </span>
  );
}
