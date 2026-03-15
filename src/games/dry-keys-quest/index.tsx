'use client'

import React from "react";
import { useIntroGame } from "./useIntroGame";
import { AsciiBoard } from "./AsciiBoard";
import { PhraseReveal } from "./PhraseReveal";
import GamePopup from "@/games/shared/GamePopup";

const DryKeysQuest = () => {
  const { guess, clickedKeys, isWon, handleKeyClick, answerKeysSet, setIsPeeking, keysWasted } = useIntroGame();

  const achievement = {
    unlocked: isWon && keysWasted === 0,
    title: "Perfect!",
    emoji: "🏆",
  };

  return (
    <div className="relative w-full flex flex-col justify-center items-center overflow-x-auto overflow-y-hidden lowercase scrollbar-ascii">
      <PhraseReveal guess={guess} />
      <div className="relative flex flex-col justify-center items-center min-w-fit mx-auto">
        <AsciiBoard
          clickedKeys={clickedKeys}
          handleKeyClick={handleKeyClick}
          isWon={isWon}
          answerKeysSet={answerKeysSet}
          setIsPeeking={setIsPeeking}
        />
        <GamePopup
          isOpen={isWon}
          type="win"
          emoji="⌨️"
          score={{ label: "Keys wasted", value: keysWasted }}
          onRestart={() => handleKeyClick('[Esc]')}
          achievement={achievement}
        />
      </div>
    </div>
  );
};

export default DryKeysQuest;
