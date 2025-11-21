'use client'
'use client'
import React from "react";
import { useIntroGame } from "./useIntroGame";
import { AsciiBoard } from "./AsciiBoard";
import { PhraseReveal } from "./PhraseReveal";

const IntroArt = () => {
  const { guess, clickedKeys, isWon, handleKeyClick, answerKeysSet, setIsPeeking } = useIntroGame();

  return (
    <div className="m-auto flex flex-col justify-center items-center overflow-hidden relative">
      <PhraseReveal guess={guess} />
      <AsciiBoard 
        clickedKeys={clickedKeys} 
        handleKeyClick={handleKeyClick} 
        isWon={isWon} 
        answerKeysSet={answerKeysSet}
        setIsPeeking={setIsPeeking}
      />
    </div>
  );
};

export default IntroArt;
