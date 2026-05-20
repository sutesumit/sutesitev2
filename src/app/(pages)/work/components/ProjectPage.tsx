"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion as m } from "framer-motion";
import LiveRepoLinks from "@/components/shared/LiveRepoLinks";
import Accordion from "@/components/shared/Accordion";
import { CardBackground } from "@/components/shared/CardBackground";
import { projects, ProjectProps } from "@/data/projectlist";
import { cn } from "@/lib/utils";
import ClapsCounter from "@/components/shared/ClapsCounter";
import ViewCounter from "@/components/shared/ViewCounter";
import { Maximize2, Minimize2 } from "lucide-react";

const MOBILE_BREAKPOINT = 380;
const TABLET_VIEWPORT = { width: 900, height: 675 };
const MOBILE_VIEWPORT = { width: 375, height: 812 };

const ProjectPage = ({ project }: { project: ProjectProps }) => {
  const [iframeLoading, setIframeLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const [iframeScale, setIframeScale] = useState(1);
  const [iframeViewport, setIframeViewport] = useState(TABLET_VIEWPORT);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (isExpanded) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isExpanded]);

  useEffect(() => {
    if (!isExpanded) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsExpanded(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isExpanded]);

  useEffect(() => {
    setIsMounted(true);
    const updateScale = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        const nextViewport = width < MOBILE_BREAKPOINT ? MOBILE_VIEWPORT : TABLET_VIEWPORT;
        setIframeViewport((currentViewport) =>
          currentViewport.width === nextViewport.width && currentViewport.height === nextViewport.height
            ? currentViewport
            : nextViewport
        );
        const scaleX = width / nextViewport.width;
        const scaleY = height / nextViewport.height;
        setIframeScale(Math.min(scaleX, scaleY));
      }
    };
    updateScale();
    const observer = new ResizeObserver(updateScale);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIframeLoading(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <article className="container relative isolate p-10 h-auto items-center font-roboto-mono lowercase">
      <m.div
        role="article"
        aria-label={project.title}
        className={cn(
          "relative p-4 blue-border flex flex-col mb-2 overflow-hidden",
          isExpanded ? "z-50" : "isolate"
        )}
        initial="rest"
        whileHover="hover"
        animate="rest"
      >
        <CardBackground />
        <ul className={cn("project-container project-list relative px-2", isExpanded ? "z-50" : "z-10")}>
          <div className="flex flex-wrap gap-2 items-center justify-between">
            <li className="project-item flex items-center justify-between text-blue-900 dark:text-blue-400 font-medium">
              <Link href={`/work/${project.slug}`}>{project.title}</Link>
            </li>
            <div className="flex items-center gap-4">
              <ViewCounter type="project" identifier={project.slug} className="inline-flex items-center text-xs" />
              <ClapsCounter postId={project.slug} postType="project" />
            </div>
          </div>

          <div className="about-section mt-4 space-y-1">
            {project.livelink && (
              <>
                {isExpanded && (
                  <div
                    className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40 cursor-default"
                    onClick={() => setIsExpanded(false)}
                  />
                )}
                <div
                  ref={containerRef}
                  className={cn(
                    "border border-blue-200 dark:border-blue-800 bg-gray-100 dark:bg-gray-900 shadow-md mb-4 transition-all duration-300 ease-in-out",
                    isExpanded ? (
                      "fixed inset-4 md:inset-10 m-auto w-[90vw] h-[85vh] max-w-6xl max-h-[85vh] z-50 rounded-lg shadow-2xl flex items-center justify-center overflow-hidden"
                    ) : (
                      "relative w-full rounded overflow-hidden"
                    )
                  )}
                  style={isExpanded ? undefined : { aspectRatio: `${iframeViewport.width} / ${iframeViewport.height}` }}
                >
                {iframeLoading && project.screenshot && (
                  <Image
                    src={project.screenshot}
                    alt={`${project.title} preview`}
                    fill
                    className="absolute inset-0 object-cover pointer-events-none"
                  />
                )}
                {iframeLoading && (
                  <div className="absolute inset-0 flex items-center justify-center z-20">
                    <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                {isMounted && (
                  <iframe
                    src={project.livelink}
                    className={cn(
                      "border-none",
                      isExpanded ? "w-full h-full" : "absolute top-1/2 left-1/2 origin-center"
                    )}
                    style={
                      isExpanded
                        ? { width: "100%", height: "100%", transform: "none" }
                        : {
                            width: `${iframeViewport.width}px`,
                            height: `${iframeViewport.height}px`,
                            transform: `translate(-50%, -50%) scale(${iframeScale})`,
                          }
                    }
                    title={`Preview of ${project.title}`}
                    onLoad={() => setIframeLoading(false)}
                    sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation-by-user-activation"
                  />
                )}

                {/* Expand / Collapse Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(!isExpanded);
                  }}
                  className="absolute bottom-4 right-4 z-30 p-2 rounded-lg bg-white/85 dark:bg-slate-900/85 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-slate-900 shadow-md backdrop-blur-sm transition-all duration-300"
                  title={isExpanded ? "Collapse preview" : "Expand preview"}
                  aria-label={isExpanded ? "Collapse preview" : "Expand preview"}
                >
                  {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>


              </div>
            </>
          )}
            <div className="project-description opacity-90 leading-relaxed">
              {project.description}
            </div>
            <LiveRepoLinks
              livelink={project.livelink}
              repolink={project.githublink}
            />
            <Accordion title="About">{project.about}</Accordion>
            <Accordion title="Features">
              <ul className="list-none ml-4 space-y-1">
                {project.features.map((feature, index) => (
                  <li key={index} className="text-sm opacity-90 leading-relaxed before:content-['–'] before:mr-2 before:opacity-50">
                    {feature}
                  </li>
                ))}
              </ul>
            </Accordion>
            <Accordion title="Tech Stack">
              <div className="project-technologies flex flex-wrap gap-2">
                {project.technologies.map((tech, index) => (
                  <span
                    className="tab text-xs flex items-center gap-1 tech-keyword"
                    key={index}
                  >
                    {tech.icon}
                    {tech.name}
                  </span>
                ))}
              </div>
            </Accordion>
            <Accordion title="Roles">
              <div className="project-roles flex flex-wrap gap-2">
                {project.roles.map((role, index) => (
                  <span
                    className="tab text-xs flex items-center gap-1 role-keyword"
                    key={index}
                  >
                    {role.icon}
                    {role.name}
                  </span>
                ))}
              </div>
            </Accordion>
          </div>
        </ul>
      </m.div>

      <m.div
        className="project-list relative isolate p-4 blue-border bg-slate-50/5 dark:bg-slate-900/5 overflow-hidden"
        initial="rest"
        whileHover="hover"
        animate="rest"
      >
        <CardBackground />
        <div className="flex items-center justify-center border-b border-dashed border-slate-300 dark:border-slate-700 pb-4 mb-4">
          <Link href="/work" className="nav-tab py-1 px-3 text-sm">
            work
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3 w-full max-w-2xl mx-auto px-4">
          {projects.map((p, index) => (
            <div
              key={index}
              className={cn(
                "project-item transition-all",
                p.title === project.title 
                  ? "text-blue-900/40 dark:text-blue-400/40 cursor-default pointer-events-none" 
                  : "text-blue-900 dark:text-blue-400 hover:opacity-100 hover:translate-x-1"
              )}
            >
              <Link href={`/work/${p.slug}`} className="flex items-center gap-2">
                <span>{p.title}</span>
              </Link>
            </div>
          ))}
        </div>
      </m.div>
    </article>
  );
};

export default ProjectPage;
