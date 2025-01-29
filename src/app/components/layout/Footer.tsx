import React from 'react'





const Footer = () => {
  return (
    <footer>
      <div className="current-time">
           {new Date().toLocaleString()} 
      </div>
      <div className="last-visit">
            Location
      </div>
    </footer>
  )
}

export default Footer
