"use client";
import React from "react";
import Link from "next/link";
import { motion as m } from "framer-motion";
import LiveRepoLinks from "@/components/shared/LiveRepoLinks";
import Accordion from "@/components/shared/Accordion";
import { CardBackground } from "@/components/shared/CardBackground";
import { projects, type ProjectProps } from "@/data/projectlist";
import { cn } from "@/lib/utils";
import ClapsCounter from "@/components/shared/ClapsCounter";
import ViewCounter from "@/components/shared/ViewCounter";
import { usePreviewExpansion } from "@/hooks/usePreviewExpansion";
import ProjectPreviewFrame from "@/components/work/ProjectPreviewFrame";
import ProjectFeatures from "@/components/work/ProjectFeatures";
import ProjectTechStack from "@/components/work/ProjectTechStack";
import ProjectRoles from "@/components/work/ProjectRoles";
import ProjectIndexList from "@/components/work/ProjectIndexList";

const ProjectPage = ({ project }: { project: ProjectProps }) => {
  const {
    containerRef,
    isExpanded,
    isPreviewTransitioning,
    previewRect,
    iframeScale,
    iframeViewport,
    iframeLoading,
    setIframeLoading,
    isMounted,
    togglePreview,
    closePreview,
    handleTransitionComplete,
  } = usePreviewExpansion();

  const handleIframeLoad = () => setIframeLoading(false);

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
              <ProjectPreviewFrame
                project={project}
                isExpanded={isExpanded}
                isPreviewTransitioning={isPreviewTransitioning}
                previewRect={previewRect!}
                iframeScale={iframeScale}
                iframeViewport={iframeViewport}
                iframeLoading={iframeLoading}
                isMounted={isMounted}
                containerRef={containerRef}
                onTogglePreview={togglePreview}
                onClosePreview={closePreview}
                onTransitionComplete={handleTransitionComplete}
                onIframeLoad={handleIframeLoad}
              />
            )}
            <div className="project-description opacity-90 leading-relaxed">
              {project.description}
            </div>
            <LiveRepoLinks
              livelink={project.livelink}
              repolink={project.githublink}
            />
            <Accordion title="About">{project.about}</Accordion>
            <ProjectFeatures features={project.features} />
            <ProjectTechStack technologies={project.technologies} />
            <ProjectRoles roles={project.roles} />
          </div>
        </ul>
      </m.div>

      <ProjectIndexList currentSlug={project.slug} projects={projects} />
    </article>
  );
};

export default ProjectPage;
