'use client'
import React, { useState } from "react";
import { motion as m } from "framer-motion";

const dropVariants = {
  initial: {
    y: 0,
    rotate: 0,
    scale: 1,
    opacity: 1
  },
  clicked: (custom: { randomRotate: number, isCorrect: boolean }) => ({
    y: custom.isCorrect ? -50 : 50, // Move UP if correct, DOWN if wrong
    rotate: custom.isCorrect ? 0 : custom.randomRotate,
    scale: custom.isCorrect ? 1.5 : 0,
    opacity: 0,
    transition: {
      duration: custom.isCorrect ? 0.5 : 2,
      ease: "easeOut"
    }
  }),
  hover: {
    scale: 0.9,
    fontWeight: "bold",
    transition: { duration: 0.3 }
  }
};

interface KeyProps {
  label: string;
  handleKeyClick: () => void;
  isClicked: boolean;
  isCorrect: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const Key = ({ label, handleKeyClick, isClicked, isCorrect, onMouseEnter, onMouseLeave }: KeyProps) => {
    const [hoverColor, setHoverColor] = useState('');
    // Generate random rotation once on mount for consistent animation
    const [randomRotate] = useState(() => Math.random() * 180 - 90); 
    
    const handleMouseEnter = () => {
        if (onMouseEnter) onMouseEnter();
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        setHoverColor(`rgb(${r},${g},${b})`);
    };

    const handleMouseLeave = () => {
        if (onMouseLeave) onMouseLeave();
        setHoverColor('');
    };

    const renderLabel = () => {
        if (label.startsWith('[') && label.endsWith(']')) {
            const inner = label.slice(1, -1);
            return (
                <>
                    <span className="opacity-30">[</span>
                    {inner}
                    <span className="opacity-30">]</span>
                </>
            );
        }
        return label;
    };

    return (
        <m.div
            onClick={handleKeyClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            variants={dropVariants}
            initial="initial"
            animate={isClicked ? "clicked" : "initial"}
            whileHover={!isClicked ? "hover" : undefined}
            custom={{ randomRotate, isCorrect }}
            style={{ color: isClicked ? '' : hoverColor }}
            className={`inline-block cursor-pointer relative z-10 ${isClicked ? 'font-bold' : ''}`}
        >
            {renderLabel()}
        </m.div>
    );
};
