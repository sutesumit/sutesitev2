'use client'
import React from 'react'
import { usePathname } from 'next/navigation'

const page = () => {
  const pathname = usePathname();
  return (
    <article className="p-10 container h-auto items-center font-roboto-mono lowercase">
        <p>Art</p>
        <p>{pathname.split('/')[1]}</p>
    </article>
  )
}

export default page
