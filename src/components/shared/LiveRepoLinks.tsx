import React from 'react'
import { FaGithub } from "react-icons/fa";
import { IoGameControllerOutline } from 'react-icons/io5';

interface LiveRepoLinksProps {
  livelink: string;
    repolink: string;
}

const LiveRepoLinks: React.FC<LiveRepoLinksProps> = ({livelink, repolink}) => {
  return (
        <div className="project-links flex gap-2">
                    <a 
                      className='tab flex items-center gap-1 bg-red-700 bg-opacity-20 shadow-[3px_3px_0px_0px_rgba(0,_0,_0,_0.1)] dark:shadow-[3px_3px_0px_0px_rgba(255,_255,_255,_0.1)]' 
                      href={livelink}
                      target="_blank"
                    >
                      <IoGameControllerOutline />
                      Live
                    </a>
                    <a 
                      className='tab flex items-center gap-1 shadow-[3px_3px_0px_0px_rgba(0,_0,_0,_0.1)] dark:shadow-[3px_3px_0px_0px_rgba(255,_255,_255,_0.1)]'
                      href={repolink} 
                      target="_blank"
                    >                    
                      <FaGithub />
                      Repo
                    </a>
        </div>
  )
}

export default LiveRepoLinks
