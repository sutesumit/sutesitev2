'use client'
import React from 'react'

const Footer = () => {
  const [currentTime, setCurrentTime] = React.useState('--:--:--')

  React.useEffect(() => {
  
    setCurrentTime(new Date().toLocaleTimeString())
    
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <footer className="footer fixed w-full bottom-0 z-10">
      <div className='container flex justify-between p-2 border-t-2 bg-white border-slate-300 dark:border-slate-700 dark:bg-[#1c1b22] lowercase'>
          <div className="current-time text-xs opacity-50 hover:opacity-70">
               {currentTime}
          </div>
          <div className="last-visit text-xs opacity-50 hover:opacity-70">
                Bengaluru, IN
          </div>
      </div>
    </footer>
  )
}

export default Footer
