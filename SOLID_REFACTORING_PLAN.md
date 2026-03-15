# SOLID Refactoring Plan for src/games/

## Overview

Apply SOLID principles to refactor game components for better maintainability, testability, and extensibility.

## Current State Analysis

### Issues Identified

1. **Single Responsibility (S) Violations**
   - `ContributionHeatmap` (424 lines) mixes: game logic, API fetching, boot sequence, rendering, styling
   - `dry-keys-quest` components have scattered logic

2. **Open/Closed (O) Violations**
   - Game types hardcoded, difficult to extend new game modes
   - Confetti/GamePopup tightly coupled to specific game implementations

3. **Dependency Inversion (D) Violations**
   - Components depend on concrete implementations rather than abstractions
   - No use of interfaces for game engines

---

## Refactoring Plan

### Phase 1: Extract Core Game Abstractions

```
src/games/
├── core/                          # NEW: Core game interfaces & base classes
│   ├── GameEngine.ts             # Abstract base class for all games
│   ├── GameState.ts              # Game state interface
│   └── GameRenderer.ts          # Abstract renderer interface
├── shared/                        # Existing - enhance
│   ├── types.ts                  # Expand with core types
│   ├── GamePopup.tsx
│   └── Confetti.tsx
└── contribution-heatmap/         # Refactor this first
    ├── index.tsx                 # Slimmed container
    ├── HeatmapGame.ts            # Game logic extracted
    ├── HeatmapRenderer.tsx       # UI rendering only
    ├── HeatmapBoot.tsx           # Boot sequence
    └── hooks/
        └── useHeatmapGame.ts     # Game state hook
```

### Phase 2: Apply to ContributionHeatmap

**Step 2.1: Create Game State Interface**
```typescript
// src/games/core/GameState.ts
export interface GameState {
  isPlaying: boolean;
  isGameOver: boolean;
  isWin: boolean;
  score: number;
  moves: number;
}

export interface HeatmapState extends GameState {
  revealed: Set<number>;
  skullDay: number | null;
  year: number;
  month: number;
}
```

**Step 2.2: Extract Game Logic to Hook**
```typescript
// src/games/contribution-heatmap/hooks/useHeatmapGame.ts
export function useHeatmapGame(data: Record<string, number>) {
  // Single responsibility: game logic only
  // Returns: state, actions (reveal, restart, checkWin)
}
```

**Step 2.3: Extract Renderer**
```typescript
// src/games/contribution-heatmap/HeatmapRenderer.tsx
export function HeatmapRenderer({ state, actions, ...props }) {
  // Single responsibility: rendering only
}
```

### Phase 3: Apply to DryKeysQuest

```
src/games/dry-keys-quest/
├── index.tsx                     # Container
├── hooks/
│   └── useDryKeysGame.ts        # Game logic extracted
└── components/
    ├── AsciiBoard.tsx           # Keep, extract props
    ├── Key.tsx                  # Keep
    └── ...
```

### Phase 4: Apply to AsciiByteGame & AsciiShelf

Similar pattern - extract game logic to hooks, keep renderers lean.

### Phase 5: Shared Infrastructure

**Step 5.1: Expand Types**
```typescript
// src/games/shared/types.ts
export type GameResultType = 'win' | 'lose';

export interface GameScore {
  label: string;
  value: string | number;
}

export interface GameAchievement {
  unlocked: boolean;
  title?: string;
  emoji?: string;
}

export interface GamePopupProps {
  isOpen: boolean;
  type: GameResultType;
  emoji: string;
  score: GameScore;
  onRestart: () => void;
  restartLabel?: string;
  achievement?: GameAchievement;
}

// NEW: Core interfaces
export interface GameEngine {
  getState(): GameState;
  getActions(): GameActions;
}

export interface GameActions {
  restart: () => void;
  // etc
}
```

---

## Implementation Order

1. **Create `src/games/core/` directory** with base interfaces
2. **Refactor ContributionHeatmap** (most complex)
3. **Apply same pattern to other games**
4. **Add comprehensive types**
5. **Run tests/lint**

---

## Benefits

- **S**: Each component/hook has single responsibility
- **O**: Easy to add new games by extending base classes
- **L**: Games can substitute each other via common interface
- **I**: Small, focused interfaces for each need
- **D**: High-level modules (renderers) depend on abstractions (hooks)

---

## Migration Strategy

1. Create new structure alongside existing
2. Migrate one game at a time
3. Ensure all tests pass after each migration
4. Remove old code after full migration
