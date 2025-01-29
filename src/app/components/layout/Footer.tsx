import React from 'react'





const Footer = () => {
  return (
    <footer className="footer fixed w-full bottom-0">
      <div className='container flex justify-between p-1 border-t-2 lowercase '>
          <div className="current-time">
               {new Date().toLocaleString()}
          </div>
          <div className="last-visit">
                Location
          </div>
      </div>
    </footer>
  )
}

export default Footer
