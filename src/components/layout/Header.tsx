'use client'
import Link from 'next/link'
import React from 'react'
import NavLink from './NavLink'
import ToggleTheme from '../specific/ToggleTheme'
import MobileMenu from './MobileMenu'
import { NAV_TABS } from '@/data/nav'

// Single responsibility: renders the logo / brand link
const NavBrand = () => (
  <ul className="nav__list-left flex gap-3 items-center">
    <li>
      <Link
        className="nav-title box-content nav-tab py-1.5 whitespace-nowrap"
        href="/"
      >
        Sumit Sute
      </Link>
    </li>
    <li className="hidden sm:block">
      <NavLink href="/about">about</NavLink>
    </li>
  </ul>
)

// Single responsibility: renders the desktop nav links + theme toggle
const NavActions = () => (
  <div className="flex items-center gap-3 justify-end">
    <ul className="nav__list-right hidden sm:flex gap-3 items-baseline">
      {NAV_TABS.map(tab => (
        <li key={tab.href}>
          <NavLink href={tab.href}>{tab.title}</NavLink>
        </li>
      ))}
      <li className="toggleTheme self-center pt-[2px] opacity-50 hover:opacity-100 cursor-pointer text-xs transition-all duration-300">
        <ToggleTheme />
      </li>
    </ul>
    {/* Mobile-only theme toggle */}
    <div className="toggleTheme self-center pt-[2px] opacity-50 hover:opacity-100 cursor-pointer text-xs transition-all duration-300 sm:hidden">
      <ToggleTheme />
    </div>
  </div>
)

const Header = () => (
  <header className="header fixed top-0 w-full z-10">
    <nav className="navbar px-2 py-1.5 container grid gap-2 grid-cols-[1fr_auto_1fr] sm:grid-cols-[1fr_auto] items-center border-b-2 border-slate-300 dark:border-slate-700 backdrop-blur-3xl lowercase">
      <NavBrand />
      <div className="flex items-center justify-center sm:hidden">
        <MobileMenu />
      </div>
      <NavActions />
    </nav>
  </header>
)

export default Header
