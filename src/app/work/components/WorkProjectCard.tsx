"use client";

import { useRouter } from "next/navigation";
import { motion as m } from "framer-motion";
import { ProjectProps } from "@/data/projectlist";
import LiveRepoLinks from "@/components/shared/LiveRepoLinks";

import { CardBackground } from "@/components/shared/CardBackground";

interface WorkProjectCardProps {
  project: ProjectProps;
  index: number;
}

export const WorkProjectCard = ({ project, index }: WorkProjectCardProps) => {
  const router = useRouter();

  return (
    <m.div
      role="article"
      aria-label={project.title}
      className="relative isolate p-5 overflow-hidden blue-border project-list flex flex-col cursor-pointer"
      onClick={() => router.push(`/work/${project.slug}`)}
      initial="rest"
      whileHover="hover"
      animate="rest"
    >
      <CardBackground />

      <div className="flex h-full flex-col justify-between gap-2">
        {/* Title — uses project-item for the dash→pipe pseudo-element */}
        <div className="project-item text-blue-900 dark:text-blue-400 font-medium">
          {project.title}
        </div>

        {/* Description */}
        <p className="text-xs opacity-75 line-clamp-2">
          {project.description}
        </p>

        {/* Live/Repo links — stopPropagation so nested <a> still work */}
        <div onClick={(e) => e.stopPropagation()}>
          <LiveRepoLinks
            livelink={project.livelink}
            repolink={project.githublink}
          />
        </div>

        {/* Technologies */}
        <div className="flex flex-wrap gap-1">
          {project.technologies.map((tech, i) => (
            <span
              className="tab text-xs flex items-center gap-1 m-0 tech-keyword"
              key={i}
            >
              {tech.icon}
              {tech.name}
            </span>
          ))}
        </div>

        {/* Roles */}
        <div className="flex flex-wrap gap-1">
          {project.roles.map((role, i) => (
            <span
              className="tab text-xs flex items-center gap-1 m-0 role-keyword"
              key={i}
            >
              {role.icon}
              {role.name}
            </span>
          ))}
        </div>
      </div>
    </m.div>
  );
};
