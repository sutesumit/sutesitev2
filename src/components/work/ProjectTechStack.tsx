"use client";

import React from "react";
import Accordion from "@/components/shared/Accordion";

interface TechItem {
  icon: React.ReactNode;
  name: string;
}

interface ProjectTechStackProps {
  technologies: TechItem[];
}

const ProjectTechStack: React.FC<ProjectTechStackProps> = ({
  technologies,
}) => {
  return (
    <Accordion title="Tech Stack">
      <div className="project-technologies flex flex-wrap gap-2">
        {technologies.map((tech, index) => (
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
  );
};

export default ProjectTechStack;
