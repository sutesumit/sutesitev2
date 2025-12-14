'use client'

import React from "react";
import { useIntroGame } from "./useIntroGame";
import { AsciiBoard } from "./AsciiBoard";
import { PhraseReveal } from "./PhraseReveal";

const IntroArt = () => {
  const { guess, clickedKeys, isWon, handleKeyClick, answerKeysSet, setIsPeeking } = useIntroGame();

  return (
    <div className="m-auto w-full overflow-x-auto relative lowercase scrollbar-ascii">
      <div className="flex flex-col justify-center items-center min-w-fit mx-auto">
        <PhraseReveal guess={guess} />
        <AsciiBoard 
          clickedKeys={clickedKeys} 
          handleKeyClick={handleKeyClick} 
          isWon={isWon} 
          answerKeysSet={answerKeysSet}
          setIsPeeking={setIsPeeking}
        />
      </div>
    </div>
  );
};

export default IntroArt;
