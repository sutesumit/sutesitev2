import { useState, useEffect, useMemo } from "react";
import { ART, ANSWER, INITIAL_GUESS } from "./constants";

export const useIntroGame = () => {
  const [guess, setGuess] = useState<string>(INITIAL_GUESS);
  const [clickedKeys, setClickedKeys] = useState<Set<string>>(new Set());
  const [isWon, setIsWon] = useState(false);

  const answerKeysSet = useMemo(() => new Set(
    ANSWER
      .slice(1, -1) // Remove outer brackets
      .trim() // Remove leading/trailing spaces
      .split("") // Split into individual characters
      .filter(char => char !== ' ') // Filter out spaces
      .map(char => `[${char.toLowerCase()}]`) // Format each character
  ), []);

  useEffect(() => {
    if (guess === ANSWER && !isWon) {
      setIsWon(true);
      const allKeys = ART.match(/\[.*?\]/g);
      if (allKeys) {
        // Exclude [Esc] so it remains visible for resetting
        const keysToExplode = allKeys.filter(k => k !== '[Esc]');
        setClickedKeys(new Set(keysToExplode));
      }
    }
  }, [guess, isWon]);

  const handleKeyClick = (key: string) => {
    if (key === '[Esc]') {
      setGuess(INITIAL_GUESS);
      setClickedKeys(new Set()); // Reset all
      setIsWon(false);
      return;
    }
    
    // Update clicked keys state to trigger animation
    const newClickedKeys = new Set(clickedKeys);
    newClickedKeys.add(key);
    setClickedKeys(newClickedKeys);

    if (answerKeysSet.has(key.toLowerCase())) {
      const charToReveal = key.slice(1, -1).toLowerCase();
      setGuess((prevGuess) => {
        const newGuessChars = prevGuess.split('');
        const answerChars = ANSWER.split('');

        for (let i = 0; i < answerChars.length; i++) {
          if (answerChars[i].toLowerCase() === charToReveal) {
            newGuessChars[i] = answerChars[i];
          }
        }
        return newGuessChars.join('');
      });
    }
  };

  const [isPeeking, setIsPeeking] = useState(false);

  return {
    guess: isPeeking ? ANSWER : guess,
    clickedKeys,
    isWon,
    handleKeyClick,
    answerKeysSet,
    setIsPeeking
  };
};
