import React from "react";
import { ART } from "./constants";
import { Key } from "./Key";
import { WinLights } from "./WinLights";

interface AsciiBoardProps {
  clickedKeys: Set<string>;
  handleKeyClick: (key: string) => void;
  isWon: boolean;
}

export const AsciiBoard = ({ clickedKeys, handleKeyClick, isWon }: AsciiBoardProps) => {
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
          return (
            <Key 
              key={index} 
              label={part} 
              isClicked={isClicked} 
              handleKeyClick={() => handleKeyClick(part)} 
            />
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </pre>
  );
};
