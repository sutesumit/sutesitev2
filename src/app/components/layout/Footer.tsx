import React from 'react'





const Footer = () => {
  return (
    <footer className="footer fixed w-full bottom-0">
      <div className='container flex justify-between p-1 border-t-2 border-slate-100 lowercase opacity-50 hover:opacity-70 '>
          <div className="current-time text-xs">
               {new Date().toLocaleString()}
          </div>
          <div className="last-visit text-xs">
                Bengaluru, IN
          </div>
      </div>
    </footer>
  )
}

export default Footer
