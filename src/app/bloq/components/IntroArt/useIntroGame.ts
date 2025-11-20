import { useState, useEffect, useMemo } from "react";
import { ART } from "./constants";

export const useIntroGame = () => {
  const [answer] = useState("[ dont repeat yourself ]");
  const [guess, setGuess] = useState<string>("[ ---- ------ -------- ]");
  const [clickedKeys, setClickedKeys] = useState<Set<string>>(new Set());
  const [isWon, setIsWon] = useState(false);

  const answerKeysSet = useMemo(() => new Set(
    answer
      .slice(1, -1) // Remove outer brackets
      .trim() // Remove leading/trailing spaces
      .split("") // Split into individual characters
      .filter(char => char !== ' ') // Filter out spaces
      .map(char => `[${char.toLowerCase()}]`) // Format each character
  ), [answer]);

  useEffect(() => {
    if (guess === answer && !isWon) {
      setIsWon(true);
      const allKeys = ART.match(/\[.*?\]/g);
      if (allKeys) {
        // Exclude [Esc] so it remains visible for resetting
        const keysToExplode = allKeys.filter(k => k !== '[Esc]');
        setClickedKeys(new Set(keysToExplode));
      }
    }
  }, [guess, answer, isWon]);

  const handleKeyClick = (key: string) => {
    if (key === '[Esc]') {
      setGuess("[ ---- ------ -------- ]");
      setClickedKeys(new Set()); // Reset all
      setIsWon(false);
      return;
    }
    
    // Update clicked keys state to trigger animation
    const newClickedKeys = new Set(clickedKeys);
    newClickedKeys.add(key);
    setClickedKeys(newClickedKeys);

    console.log(`The pressed key is: ${key.toLowerCase()}`);
    if (answerKeysSet.has(key.toLowerCase())) {
      console.log("Correct!");
      const charToReveal = key.slice(1, -1).toLowerCase();
      setGuess((prevGuess) => {
        const newGuessChars = prevGuess.split('');
        const answerChars = answer.split('');

        for (let i = 0; i < answerChars.length; i++) {
          if (answerChars[i].toLowerCase() === charToReveal) {
            newGuessChars[i] = answerChars[i];
          }
        }
        return newGuessChars.join('');
      });
    } else {
      console.log("Wrong!");
    }
  };

  return {
    guess,
    clickedKeys,
    isWon,
    handleKeyClick
  };
};
