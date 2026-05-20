"use client";

import React from "react";
import Accordion from "@/components/shared/Accordion";

interface ProjectFeaturesProps {
  features: string[];
}

const ProjectFeatures: React.FC<ProjectFeaturesProps> = ({ features }) => {
  return (
    <Accordion title="Features">
      <ul className="list-none ml-4 space-y-1">
        {features.map((feature, index) => (
          <li
            key={index}
            className="text-sm opacity-90 leading-relaxed before:content-['–'] before:mr-2 before:opacity-50"
          >
            {feature}
          </li>
        ))}
      </ul>
    </Accordion>
  );
};

export default ProjectFeatures;
