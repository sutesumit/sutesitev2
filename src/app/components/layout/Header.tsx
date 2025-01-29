import Link from 'next/link'
import React from 'react'

const Header = () => {
  return (
    <header className='header fixed w-full'>
      <nav className='navbar container flex justify-between items-baseline p-1 border-b-2 lowercase'>
        <ul className='nav__list-left'>
          <li className='nav-title'><Link href="/">Sumit Sute</Link></li>
        </ul>
        <ul className="nav__list-right flex gap-4">
          <li><Link href="/">Work</Link></li>
          <li><Link href="/">About</Link></li>
        </ul>
      </nav>
    </header>
  )
}

export default Header
