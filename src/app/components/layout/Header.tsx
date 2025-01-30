'use client'
import Link from 'next/link'
import React from 'react'
import { FaMoon } from "react-icons/fa";
import { ImSun } from 'react-icons/im';

const Header = () => {

  const [darkMode, setDarkMode] = React.useState(false)

  return (
    <header className='header fixed w-full'>
      <nav className='navbar container flex justify-between items-baseline p-2 border-b-2 border-slate-100 lowercase'>
        <ul className='nav__list-left flex gap-1 items-baseline'>
          <li className='nav-title'><Link href="/">Sumit Sute</Link></li>
        </ul>
        <ul className="nav__list-right flex gap-4 items-baseline">
          <li><Link href="/" className='opacity-50 hover:opacity-70'>Work</Link></li>
          <li><Link href="/" className='opacity-50 hover:opacity-70'>About</Link></li>
          <li className="toggleTheme opacity-50 hover:opacity-70 cursor-pointer text-xs">
            <button className='flex items-center gap-1' 
                    onClick={() => setDarkMode(!darkMode)}
            >
              {darkMode ? <ImSun/> : <FaMoon/>}
            </button>
          </li>
        </ul>
      </nav>
    </header>
  )
}

export default Header
