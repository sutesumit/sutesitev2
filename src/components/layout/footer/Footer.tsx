"use client";
import React from 'react';
import Link from 'next/link';
import { FaGithub, FaLinkedin, FaTelegram } from 'react-icons/fa';
import { FaSitemap } from 'react-icons/fa6';
import { MdOutlineRssFeed } from "react-icons/md";
import { IoIosMail } from 'react-icons/io';
import { CheckCheck } from 'lucide-react';
import { useVisitorData } from './VisitorAnalytics';
import CopyLink from '@/components/shared/CopyLink';
import { formatTimeAgo } from '@/lib/formatTimeAgo';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import ScrambleText from '@/components/shared/ScrambleText';

const Footer = () => {
  const { lastVisitorLocation, lastVisitTime, visitorCount } = useVisitorData();

  const displayText = lastVisitorLocation 
    ? (lastVisitTime 
        ? `${lastVisitorLocation} · ${formatTimeAgo(lastVisitTime)}` 
        : lastVisitorLocation)
    : 'Bengaluru, In';

  return (
    <footer className="footer fixed w-full bottom-0 z-10">
      <div className='container flex justify-between p-2 border-t-2 border-slate-300 dark:border-slate-700 backdrop-blur-3xl lowercase'>
          <div className="current-time flex items-center gap-3">
            <Link className='social-tab' target='_blank' href='https://github.com/sutesumit'><FaGithub /></Link> 
            <Link className='social-tab' target='_blank' href='https://www.linkedin.com/in/sumitsute/'><FaLinkedin /></Link> 
            <Link className='social-tab' target='_blank' href='mailto:sumitsute@alumni.iitm.ac.in'><IoIosMail /></Link>
            <Link className='social-tab' target='_blank' href='https://t.me/blipbotlive'><FaTelegram /></Link>
            <Link className='social-tab' href='/sitemap.xml'><FaSitemap /></Link>
            <CopyLink className='social-tab' href='/feed.xml'><MdOutlineRssFeed /></CopyLink>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="last-visit group flex items-center gap-1 text-xs opacity-50 cursor-pointer hover:opacity-100 transition-all duration-300">
                       <CheckCheck className='h-4 w-4 group-hover:text-blue-500 dark:group-hover:text-blue-400' /> <ScrambleText text={displayText} />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>last visitor/<ScrambleText text={visitorCount !== null ? visitorCount.toString() : 'xxx'} /></p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
      </div>
    </footer>
  );
};

export default Footer;
