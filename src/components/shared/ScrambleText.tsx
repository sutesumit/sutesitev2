"use client";
import React, { useEffect, useState, useRef } from "react";

interface ScrambleTextProps {
  text: string;
  className?: string;
  scrambleSpeed?: number; // ms per frame
}

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+[]{}|;:,.<>?";

const ScrambleText: React.FC<ScrambleTextProps> = ({ 
  text, 
  className = "", 
  scrambleSpeed = 30,
}) => {
  const [displayText, setDisplayText] = useState(text);
  const timeoutRef = useRef<NodeJS.Timeout>(null);

  useEffect(() => {
    // Start scrambling when text changes
    let iteration = 0;
    
    const animate = () => {
      setDisplayText(() => {
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

      if (iteration < text.length) {
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
