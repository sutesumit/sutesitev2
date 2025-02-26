import React from 'react'
import Link from 'next/link'
import { FaGithub, FaTwitter } from 'react-icons/fa'
import { IoIosMail } from 'react-icons/io'

const Footer = () => {

  return (
    <footer className="footer fixed w-full bottom-0 z-10">
      <div className='container flex justify-between p-2 border-t-2 border-slate-300 dark:border-slate-700 backdrop-blur-3xl lowercase'>
          <div className="current-time flex items-center gap-3">
            <Link className='social-tab' target='_blank' href='https://github.com/sutesumit'><FaGithub /></Link> 
            <Link className='social-tab' target='_blank' href='https://x.com/sutenet'><FaTwitter /></Link> 
            <Link className='social-tab' target='_blank' href='mailto:sumitsute@alumni.iitm.ac.in'><IoIosMail /></Link>
          </div>
          <div className="last-visit flex items-center gap-1 text-xs opacity-50 hover:opacity-70 transition-all duration-300">
                Bengaluru, IN
          </div>
      </div>
    </footer>
  )
}

export default Footer
