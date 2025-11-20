import React, { useMemo } from "react";
import { motion as m } from "framer-motion";

const getRandomColor = () => {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return `rgb(${r},${g},${b})`;
};

interface WinLightsProps {
  isWon: boolean;
  text: string;
}

export const WinLights = ({ isWon, text }: WinLightsProps) => {
  const randomColors = useMemo(() => {
    if (!isWon) return [];
    return Array.from({ length: 10 }, getRandomColor);
  }, [isWon]);

  return (
    <m.span
      animate={isWon ? { color: randomColors } : {}}
      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
    >
      {text}
    </m.span>
  );
};
