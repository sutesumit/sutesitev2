"use client";
import React, { useEffect, useState, useRef } from "react";

interface ScrambleTextProps {
  text: string;
  className?: string;
  scrambleSpeed?: number; // ms per frame
  revealSpeed?: number; // ms between revealing characters
}

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+[]{}|;:,.<>?";

const ScrambleText: React.FC<ScrambleTextProps> = ({ 
  text, 
  className = "", 
  scrambleSpeed = 30,
  revealSpeed = 50 
}) => {
  const [displayText, setDisplayText] = useState(text);
  const [isScrambling, setIsScrambling] = useState(false);
  const frameRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout>(null);

  useEffect(() => {
    // Start scrambling when text changes
    let iteration = 0;
    setIsScrambling(true);
    
    const animate = () => {
      setDisplayText(prev => {
        return text
          .split("")
          .map((char, index) => {
            if (index < iteration) {
              return text[index];
            }
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join("");
      });

      if (iteration >= text.length) {
        setIsScrambling(false);
      } else {
        iteration += 1/3; // Slow down the reveal slightly relative to the scramble
        timeoutRef.current = setTimeout(animate, scrambleSpeed);
      }
    };

    animate();

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [text, scrambleSpeed]);

  return (
    <span className={className}>
      {displayText}
    </span>
  );
};

export default ScrambleText;
