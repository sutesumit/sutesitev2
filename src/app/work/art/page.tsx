'use client'
import React from 'react'
import { usePathname } from 'next/navigation'
import { projects } from '../projectlist'
import ProjectPage from '../ProjectPage';

const page = () => {
    const pathname = usePathname();
    const project = projects[0];
    return (
      <ProjectPage project={project} />
    )
}

export default page
