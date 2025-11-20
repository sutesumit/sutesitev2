import React, { useState } from "react";
import { motion as m } from "framer-motion";

const dropVariants = {
  initial: {
    y: 0,
    rotate: 0,
    scale: 1,
    opacity: 1
  },
  clicked: (custom: { randomRotate: number }) => ({
    y: 50, // Reduced distance to keep it visible longer
    rotate: custom.randomRotate,
    scale: 0, // Don't shrink to 0, keep some size
    opacity: 0,
    transition: {
      duration: 1.5,
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
}

export const Key = ({ label, handleKeyClick, isClicked }: KeyProps) => {
    const [hoverColor, setHoverColor] = useState('');
    // Generate random rotation once on mount for consistent animation
    const [randomRotate] = useState(() => Math.random() * 180 - 90); 
    
    const handleMouseEnter = () => {
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        setHoverColor(`rgb(${r},${g},${b})`);
    };

    const handleMouseLeave = () => {
        setHoverColor('');
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
            custom={{ randomRotate }}
            style={{ color: isClicked ? '' : hoverColor }}
            className={`inline-block cursor-pointer relative z-10 ${isClicked ? 'font-bold' : ''}`}
        >
            {label}
        </m.div>
    );
};
