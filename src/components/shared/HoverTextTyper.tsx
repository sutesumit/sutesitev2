import { AnimatePresence, motion } from "framer-motion";
import React from "react";
import { BookOpen, Book } from "lucide-react";

type HoverTextTyperProps = {
  triggerText: React.ReactNode;
  openIcon?: React.ReactNode;
  closedIcon?: React.ReactNode;
  typingText: string;
};

const HoverTextTyper: React.FC<HoverTextTyperProps> = ({
  triggerText,
  openIcon,
  closedIcon,
  typingText
}) => {
  // split into characters but preserve spaces
  const [textOpen, setTextOpen] = React.useState(false);
  const letters = typingText.split(/(?<= )|(?= )|(?=\n)/);


  return (
    <span
      className="group inline-flex flex-wrap"
    >
      <span 
        className="items-center cursor-pointer group-hover:text-blue-900 dark:group-hover:text-blue-400 transition-all duration-500 ease-in-out"
        onClick={() => setTextOpen(!textOpen)}
      >
        {triggerText}
        <span 
          className={`icon inline-flex align-middle items-center w-4 h-4 ml-1 ${textOpen ? "-rotate-12 scale-100" : "rotate-12 -scale-100"} text-blue-900 dark:text-blue-400 cursor-pointer transition-all duration-500 ease-in-out`}
          onMouseEnter={() => setTextOpen(!textOpen)}
        >
          {textOpen
            ? openIcon || <BookOpen />
            : closedIcon || <Book />}
        </span>
      </span>

      {/* Container for typing text */}
      <AnimatePresence>
        {textOpen ? (
          <motion.span
            initial={{ opacity: 0, height: 0 }}
            animate={{
              opacity: 1,
              height: "auto",
              transition: {
                ease: [0.16, 1, 0.3, 1]
              },
            }}
            exit={{ opacity: 0, height: 0, transition: { duration: 0.3 } }}
          >
            {letters.map((letter, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ ease: [0.16, 1, 0.3, 1], delay: index * 0.01 }}
              >
                {letter}
              </motion.span>
            ))}
          </motion.span>
        ) : null}
      </AnimatePresence>
    </span>
  );
};

export default HoverTextTyper;
