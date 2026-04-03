'use client';

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, Book, ChevronRight } from "lucide-react";

type InlineRevealProps = {
  trigger: React.ReactNode;
  expandedIcon?: React.ReactNode;
  collapsedIcon?: React.ReactNode;
  children: React.ReactNode;
};

const InlineReveal: React.FC<InlineRevealProps> = ({
  trigger,
  expandedIcon,
  collapsedIcon,
  children,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="group inline-flex flex-wrap">
      <button
        type="button"
        className="items-center cursor-pointer text-left transition-all duration-500 ease-in-out group-hover:text-blue-900 dark:group-hover:text-blue-400"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        <ChevronRight
          className={`mr-1 inline-flex h-4 w-4 align-middle transition-transform duration-300 ease-in-out ${isOpen ? "-rotate-90" : ""}`}
        />
        {trigger}
        <span
          className={`icon ml-1 inline-flex h-4 w-4 items-center align-middle text-blue-900 transition-all duration-500 ease-in-out dark:text-blue-400 ${isOpen ? "-rotate-12 scale-100" : "rotate-12 -scale-100"}`}
          aria-hidden="true"
        >
          {isOpen
            ? expandedIcon || <BookOpen />
            : collapsedIcon || <Book />}
        </span>
      </button>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{
              opacity: 1,
              height: "auto",
              transition: {
                ease: [0.16, 1, 0.3, 1],
              },
            }}
            exit={{ opacity: 0, height: 0, transition: { duration: 0.3 } }}
            className="inline-block"
          >
            {children}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export default InlineReveal;
