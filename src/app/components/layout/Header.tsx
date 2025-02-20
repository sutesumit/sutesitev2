'use client'
import Link from 'next/link'
import React from 'react'
import ToggleTheme from '../specific/ToggleTheme'
import { usePathname } from 'next/navigation'

const navtabs = [
  { title: 'Work', href: '/work' },
  { title: 'About', href: '/about' }
]

const Header = () => {
  const pathname = usePathname()

  return (
    <header className='header fixed top-0 w-full z-10'>
      <nav className='navbar px-2 container flex justify-between items-baseline border-b-2 border-slate-300 dark:border-slate-700 backdrop-blur-3xl lowercase'>
        
        <ul className='nav__list-left flex gap-1 items-baseline'>
          <li className={`nav-title box-content nav-tab py-1.5 ${pathname === '/' ? 'opacity-100 border-t-2 border-slate-500 dark:border-slate-500' : 'opacity-50'}`}><Link href="/">Sumit Sute</Link></li>
        </ul>
        <ul className="nav__list-right flex gap-3 items-baseline">
          {navtabs.map(tab => (
            <li key={tab.href} className={`nav-tab py-1.5 ${pathname === tab.href ? 'opacity-100 border-t-2 border-slate-500 dark:border-slate-500' : 'opacity-50'}`}><Link href={tab.href}>{tab.title}</Link></li>
          ))}
          <li className="toggleTheme self-center pt-[2px] opacity-50 hover:opacity-70 cursor-pointer text-xs">
            <ToggleTheme/>
          </li>
        </ul>
      </nav>
    </header>
  )
}

export default Header
