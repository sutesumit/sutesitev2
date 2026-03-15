"use client";

import { ReactNode } from "react";
import { motion as m } from "framer-motion";
import { CardBackground } from "@/components/shared/CardBackground";

interface Skill {
  name: string;
  icon: ReactNode;
}

interface TechStackCardProps {
  skillList: Record<string, Skill[]>;
}

export const TechStackCard = ({ skillList }: TechStackCardProps) => {
  return (
    <m.div
      role="region"
      aria-label="Technologies"
      className="relative isolate p-5 overflow-hidden blue-border project-list flex flex-col"
      initial="rest"
      whileHover="hover"
      animate="rest"
    >
      <CardBackground />

      <div className="flex h-full flex-col gap-2">
        {Object.entries(skillList).map(([category, skills], idx) => (
          <div key={idx} className="flex flex-col gap-2">
            {/* Category Title — uses project-item for the dash→pipe pseudo-element */}
            <div className="project-item text-xs text-blue-900 dark:text-blue-400 font-medium">
              {category}
            </div>

            {/* Skills as tags */}
            <div className="flex flex-wrap gap-1">
              {skills.map((skill, i) => (
                <span
                  className="tab text-xs flex items-center gap-1 m-0 opacity-80 hover:opacity-100"
                  key={i}
                >
                  {skill.icon}
                  {skill.name}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </m.div>
  );
};
