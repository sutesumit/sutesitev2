import React from 'react'
import { projects } from '../../../data/projectlist'
import ProjectPage from '../../../components/shared/ProjectPage';

const page = () => {
    const project = projects[0];
    return (
      <ProjectPage project={project} />
    )
}

export default page
