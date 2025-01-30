'use client'
import React from 'react'

const Footer = () => {
  const [currentTime, setCurrentTime] = React.useState(new Date().toLocaleTimeString())

  React.useEffect(() => {
    const interval =setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <footer className="footer fixed w-full bottom-0">
      <div className='container flex justify-between p-2 border-t-2 border-slate-100 dark:border-slate-700 lowercase'>
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
