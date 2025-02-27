import React from 'react'
import { projects } from '../projectlist'
import ProjectPage from '../ProjectPage';

const page = () => {
    const project = projects[0];
    return (
      <ProjectPage project={project} />
    )
}

export default page
