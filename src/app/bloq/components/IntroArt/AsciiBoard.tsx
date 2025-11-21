import React from "react";
import { ART } from "./constants";
import { Key } from "./Key";
import { WinLights } from "./WinLights";

interface AsciiBoardProps {
  clickedKeys: Set<string>;
  handleKeyClick: (key: string) => void;
  isWon: boolean;
  answerKeysSet: Set<string>;
  setIsPeeking: (isPeeking: boolean) => void;
}

export const AsciiBoard = ({ clickedKeys, handleKeyClick, isWon, answerKeysSet, setIsPeeking }: AsciiBoardProps) => {
  // Split by keys but keep delimiters
  const parts = ART.split(/(\[.*?\]|o o o)/g);

  return (
    <pre className="ascii-art text-sm leading-tight whitespace-pre rota">
      {parts.map((part, index) => {
        if (part === 'o o o') {
          return <WinLights key={index} isWon={isWon} text={part} />;
        }
        if (part.match(/^\[.*?\]$/)) {
          const isClicked = clickedKeys.has(part);
          const isCorrect = answerKeysSet.has(part.toLowerCase());
          const isSpacebar = part === '[________________________]';
          
          return (
            <Key 
              key={index} 
              label={part} 
              isClicked={isClicked} 
              isCorrect={isCorrect}
              handleKeyClick={() => handleKeyClick(part)}
              onMouseEnter={isSpacebar ? () => setIsPeeking(true) : undefined}
              onMouseLeave={isSpacebar ? () => setIsPeeking(false) : undefined}
            />
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </pre>
  );
};
