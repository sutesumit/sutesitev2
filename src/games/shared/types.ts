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
