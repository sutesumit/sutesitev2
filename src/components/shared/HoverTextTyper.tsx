import { AnimatePresence, motion } from "framer-motion"
import React from "react"
import { BookOpen, Book } from "lucide-react"

type HoverTextTyperProps = {
  triggerText: React.ReactNode
  typingText: string
}

const HoverTextTyper: React.FC<HoverTextTyperProps> = ({
  triggerText,
  typingText,
}) => {
  // split into characters but preserve spaces
  const letters = typingText.split(/(?<= )|(?= )|(?=\n)/)

  const [isHovered, setIsHovered] = React.useState(false)

  return (
    <div 
      className="group inline-flex flex-col items-start"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center">
        {triggerText} 
        {isHovered ? (
          <BookOpen className="w-4 h-4" />
        ) : <Book className="w-4 h-4" />}
      </div>
      

      {/* Container for typing text */}
      <AnimatePresence>
      {isHovered && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
        >
          
          {letters.map((letter, index) => (
            <motion.span
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.005 }}
            >
              {letter}
            </motion.span>
          ))}
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}

export default HoverTextTyper
