import React, { useMemo } from 'react'
import { useTheme } from 'next-themes'
import { motion as m } from 'motion/react'

    const ThemeIcon = ({ theme }: { theme: 'light' | 'dark' }) => {

        const sunPath =  "M11 15C13.2091 15 15 13.2091 15 11C15 8.79086 13.2091 7 11 7C8.79086 7 7 8.79086 7 11C7 13.2091 8.79086 15 11 15Z"
        const moonPath = "M11 15C13.2091 15 15 13.2091 15 11C10.3643 13.1535 9.59148 10.4046 11 7C8.79086 7 7 8.79086 7 11C7 13.2091 8.79086 15 11 15Z" 

        const rayVarients = {
            hidden: { opacity: 0, pathLength: 0 },
            visible: {
                opacity: theme === 'dark' ? 1 : 0,
                pathLength: 1,
                transition: {
                    staggerChildren: 0.1,
                    staggerDirection: -1
                }
            }
        }

        const currentPath = useMemo(() => theme === 'dark' ? sunPath : moonPath, [theme])

        return (
            <m.svg 
                className='relative overflow-visible' width="16" height="16" viewBox="0 0 22 22" fill="currentColor" stroke="currentColor" xmlns="http://www.w3.org/2000/svg"
                initial={{ scale: 0, opacity: 0, rotate: 0 }}
                animate={{ 
                    scale: theme === 'dark' ? 1.1 : 1.5, 
                    opacity: 1,
                    rotate: theme === 'dark' ? 0 : 360,
                    transition: { duration: 0.3, ease: "easeInOut" }                        
                }}
                
            >
                <m.path className='absolute inset-0' stroke="currentColor" strokeWidth="1"
                    initial={{ scale: 0, opacity: 0, rotate: 0 }} 
                    animate={{ 
                        scale: 1, 
                        opacity: 1,
                        d: currentPath,
                        transition: { duration: 0.3, ease: "easeInOut" }
                    }} 
                />
                {theme === 'dark' && (
                <m.g
                    strokeWidth="2"
                    variants={rayVarients}
                    initial="hidden"
                    animate="visible"
                >
                    <m.path  variants={rayVarients} initial="hidden" animate="visible" d="M11 1V3"/>
                    <m.path variants={rayVarients} initial="hidden" animate="visible" d="M18.07 3.93L16.66 5.34"/>
                    <m.path variants={rayVarients} initial="hidden" animate="visible" d="M19 11H21"/>
                    <m.path variants={rayVarients} initial="hidden" animate="visible" d="M16.66 16.66L18.07 18.07"/>
                    <m.path variants={rayVarients} initial="hidden" animate="visible" d="M11 19V21"/>
                    <m.path variants={rayVarients} initial="hidden" animate="visible" d="M5.34 16.66L3.93 18.07"/>
                    <m.path variants={rayVarients} initial="hidden" animate="visible" d="M1 11H3"/>
                    <m.path variants={rayVarients} initial="hidden" animate="visible" d="M3.93 3.93L5.34 5.34"/>
                    
                </m.g>
                )}
            </m.svg>
        )
    }

    const ToggleTheme = () => {
        const [mounted, setMounted] = React.useState(false)
        const { theme, setTheme } = useTheme()

        React.useEffect(() => {
            setMounted(true)
        }, [])

        if (!mounted) {
            return null
        }

    return (
            <button
                className='flex gap-1'
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                aria-label="Toggle theme"
            
            >
                <ThemeIcon theme={theme} />
            </button>
    )
}

export default ToggleTheme
