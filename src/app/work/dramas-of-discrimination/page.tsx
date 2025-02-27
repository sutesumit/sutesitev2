import React from 'react'
import { projects } from '../projectlist'
import ProjectPage from '../ProjectPage';

const page = () => {
  const project = projects[1];
  return (
    <ProjectPage project={project} />
  )
}

export default page
