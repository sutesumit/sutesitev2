'use client'
import React from "react";
import { useIntroGame } from "./useIntroGame";
import { AsciiBoard } from "./AsciiBoard";
import { PhraseReveal } from "./PhraseReveal";

const IntroArt = () => {
  const { guess, clickedKeys, isWon, handleKeyClick } = useIntroGame();

  return (
    <div className="m-auto flex flex-col justify-center items-center overflow-hidden relative">
      <AsciiBoard 
        clickedKeys={clickedKeys} 
        handleKeyClick={handleKeyClick} 
        isWon={isWon} 
      />
      <PhraseReveal guess={guess} />
    </div>
  );
};

export default IntroArt;
