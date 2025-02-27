import React from 'react'
import { motion as m, AnimatePresence } from 'framer-motion'
import { TfiArrowCircleDown } from "react-icons/tfi";

interface AccordianProps {
    title: string;
    children: React.ReactNode;
}

const Accordian: React.FC<AccordianProps> = ({ title, children}) => {
    
    const [ showAbout, setShowAbout ] = React.useState<boolean>(false)

  return (
    <div>
        <div 
            className="tab inline-flex gap-2 items-center about-title cursor-pointer"
            onClick={() => setShowAbout(!showAbout)}
        >
            <span 
                className='inline-block font-bold'
            >
                {title}
            </span>
            <span 
                className='inline-block transition-all duration-300' 
                style={{rotate: showAbout ? '-180deg' : '0deg'}}
            >
                <TfiArrowCircleDown />
            </span>
        </div>
            <AnimatePresence mode='wait'>
            { showAbout &&
                <m.div
                    key='accordian-text'
                    className='px-1'
                    layout
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                >
                    {children}
                </m.div>
            }
            </AnimatePresence>
    </div>
  )
}

export default Accordian
