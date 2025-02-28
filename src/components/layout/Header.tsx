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
          <Link className={`nav-title box-content nav-tab py-1.5 ${pathname === '/' ? 'opacity-100 border-t-2 border-slate-500 dark:border-slate-500' : 'opacity-50'}`} href="/">Sumit Sute</Link>
        </ul>
        <ul className="nav__list-right flex gap-3 items-baseline">
          {navtabs.map(tab => (
            <Link key={tab.href} className={`nav-tab py-1.5 ${pathname.split('/')[1] === tab.href.split('/')[1] ? 'opacity-100 border-t-2 border-slate-500 dark:border-slate-500' : 'opacity-50'}`} href={tab.href}>{tab.title}</Link>
          ))}
          <li className="toggleTheme self-center pt-[2px] opacity-50 hover:opacity-100 cursor-pointer text-xs transition-all duration-300">
            <ToggleTheme/>
          </li>
        </ul>
      </nav>
    </header>
  )
}

export default Header
