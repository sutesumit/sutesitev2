"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion as m } from "framer-motion";
import LiveRepoLinks from "./LiveRepoLinks";
import Accordion from "./Accordion";
import { CardBackground } from "./CardBackground";
import { projects, ProjectProps } from "../../data/projectlist";

const ProjectPage = ({ project }: { project: ProjectProps }) => {
  const [iframeLoading, setIframeLoading] = useState(true);
  const [screenRatio, setScreenRatio] = useState("16/9");

  useEffect(() => {
    const updateRatio = () =>
      setScreenRatio(`${window.innerWidth}/${window.innerHeight}`);
    updateRatio();
    window.addEventListener("resize", updateRatio);
    return () => window.removeEventListener("resize", updateRatio);
  }, []);

  return (
    <article className="container relative isolate p-10 h-auto items-center font-roboto-mono lowercase">
      <m.div
        role="article"
        aria-label={project.title}
        className="relative isolate p-4 blue-border flex flex-col mb-2 overflow-hidden"
        initial="rest"
        whileHover="hover"
        animate="rest"
      >
        <CardBackground />
        <ul className="project-container project-list relative z-10 px-2">
          <li className="project-item text-blue-900 dark:text-blue-400 font-medium">
            <Link href={project.locallink}>{project.title}</Link>
          </li>

          <div className="about-section mt-4 space-y-1">
            {project.livelink && (
              <div
                className="relative w-full rounded overflow-hidden border border-blue-200 dark:border-blue-800 bg-gray-100 dark:bg-gray-900 shadow-md mb-4"
                style={{ aspectRatio: screenRatio }}
              >
                {iframeLoading && project.screenshot && (
                  <Image
                    src={project.screenshot}
                    alt={`${project.title} preview`}
                    fill
                    className="absolute inset-0 object-cover"
                  />
                )}
                {iframeLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/5 dark:bg-black/20 z-10">
                    <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                <iframe
                  src={project.livelink}
                  className="w-full h-full"
                  title={`Preview of ${project.title}`}
                  onLoad={() => setIframeLoading(false)}
                  sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                />
              </div>
            )}
            <div className="project-description opacity-90 leading-relaxed">
              {project.description}
            </div>
            <LiveRepoLinks
              livelink={project.livelink}
              repolink={project.githublink}
            />
            <Accordion title="About">{project.about}</Accordion>
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
        className="project-list relative isolate p-4 grid grid-cols-1 md:grid-cols-2 items-center blue-border bg-slate-50/5 dark:bg-slate-900/5 overflow-hidden"
        initial="rest"
        whileHover="hover"
        animate="rest"
      >
        <CardBackground />
        <div className="col-span-1 md:col-span-2 md:text-center text-sm pb-4 border-b border-dashed border-slate-300 dark:border-slate-700 mb-4">
          <Link href="/work" className="nav-tab py-1 px-3">
            work
          </Link>
        </div>
        <div className="flex flex-col md:flex-row md:col-span-2 gap-4 justify-around w-full">
          {projects.map((p, index) => (
            <div
              key={index}
              className={`project-item text-blue-900 dark:text-blue-400 ${p.title === project.title ? "opacity-50" : "hover:opacity-100"}`}
            >
              <Link href={p.locallink}>{p.title}</Link>
            </div>
          ))}
        </div>
      </m.div>
    </article>
  );
};

export default ProjectPage;
