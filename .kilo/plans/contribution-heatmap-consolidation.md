# Contribution Heatmap Consolidation Plan

## Summary
Consolidate two duplicate contribution heatmap implementations by keeping the modular games version and adding the missing tooltip feature from the work page version.

## Files Involved
- `src/games/contribution-heatmap/index.tsx` - **MODIFY** (add tooltip)
- `src/app/(pages)/work/components/ContributionHeatmap.tsx` - **DELETE** (duplicate)

## Implementation Steps

### Step 1: Add Tooltip to Games Version
File: `src/games/contribution-heatmap/index.tsx`

1. Add tooltip state after existing state declarations:
```tsx
const [tooltip, setTooltip] = useState<{ dateKey: string; count: number; x: number; y: number } | null>(null);
```

2. Add mouse event handlers to the day cell div (around line 203-206):
```tsx
onMouseEnter={(e) => !state.isGameOver && !isRevealed && setTooltip({ dateKey, count, x: e.clientX, y: e.clientY })}
onMouseLeave={() => setTooltip(null)}
```

3. Add tooltip component after the closing `</m.div>` tag (before the final `</>`):
```tsx
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
```

### Step 2: Delete Duplicate File
Delete: `src/app/(pages)/work/components/ContributionHeatmap.tsx`

Note: The work page (`src/app/(pages)/work/page.tsx`) already imports from `@/games/contribution-heatmap`, so no import changes needed.

## Features Retained (from games version)
- Win/lose logic with WIN_THRESHOLD = 20
- Achievement system (Crystal Master at 27 crystals)
- Smart skull placement using `findSecondHighestDay`
- Modular architecture with hooks and utils
- GamePopup with confetti support
- Proper TypeScript types

## Feature Added (from work version)
- Tooltip showing date and commit count on hover
