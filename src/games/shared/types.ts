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
  scores: GameScore[];
  onRestart: () => void;
  restartLabel?: string;
  achievement?: GameAchievement;
  showConfetti?: boolean;
  hint?: string;
}

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
  data: Record<string, number>;
}

export interface HeatmapStats {
  monthTotal: number;
  activeDays: number;
  peakCount: number;
  peakDay: number | null;
}
