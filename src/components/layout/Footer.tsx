"use client";
import React, { useEffect } from 'react'
import Link from 'next/link'
import { FaGithub, FaLinkedin } from 'react-icons/fa'
import { IoIosMail } from 'react-icons/io'
import { CheckCheck } from 'lucide-react'
import { useAnalytics } from '@/hooks/useAnalytics'
import { useCurrentVisitorLocation } from '@/hooks/useCurrentVisitorLocation'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import ScrambleText from '../shared/ScrambleText';

const Footer = () => {

  const { locationData } = useCurrentVisitorLocation();
  const { trackSiteVisit, visitorData } = useAnalytics();
  
  useEffect(() => {
    if (locationData) {
      trackSiteVisit(locationData);
    }
  }, [locationData, trackSiteVisit]); // trackSiteVisit is stable via useCallback

  const { lastVisitorLocation, visitorCount } = visitorData;

  return (
    <footer className="footer fixed w-full bottom-0 z-10">
      <div className='container flex justify-between p-2 border-t-2 border-slate-300 dark:border-slate-700 backdrop-blur-3xl lowercase'>
          <div className="current-time flex items-center gap-3">
            <Link className='social-tab' target='_blank' href='https://github.com/sutesumit'><FaGithub /></Link> 
            <Link className='social-tab' target='_blank' href='https://www.linkedin.com/in/sumitsute/'><FaLinkedin /></Link> 
            <Link className='social-tab' target='_blank' href='mailto:sumitsute@alumni.iitm.ac.in'><IoIosMail /></Link>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="last-visit group flex items-center gap-1 text-xs opacity-50 cursor-pointer hover:opacity-100 transition-all duration-300">
                      <CheckCheck className='h-4 w-4 group-hover:text-blue-500 dark:group-hover:text-blue-400' /> <ScrambleText text={lastVisitorLocation ? lastVisitorLocation : 'Bengaluru, In'} />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>last visitor/<ScrambleText text={visitorCount !== null ? visitorCount.toString() : 'xxx'} /></p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
      </div>
    </footer>
  )
}

export default Footer
