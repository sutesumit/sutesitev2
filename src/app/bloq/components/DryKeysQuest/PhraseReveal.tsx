import React from "react";
import { motion as m } from "framer-motion";

interface PhraseRevealProps {
  guess: string;
}

export const PhraseReveal = ({ guess }: PhraseRevealProps) => {
  return (
    <div className='mt-5 flex'>
      {guess.split('').map((char, index) => (
        <m.span
          key={index + char}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="inline-block origin-bottom"
        >
          {char === ' ' ? '\u00A0' : char}
        </m.span>
      ))}
    </div>
  );
};
