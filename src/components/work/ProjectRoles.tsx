"use client";

import React from "react";
import Accordion from "@/components/shared/Accordion";

interface RoleItem {
  icon: React.ReactNode;
  name: string;
}

interface ProjectRolesProps {
  roles: RoleItem[];
}

const ProjectRoles: React.FC<ProjectRolesProps> = ({ roles }) => {
  return (
    <Accordion title="Roles">
      <div className="project-roles flex flex-wrap gap-2">
        {roles.map((role, index) => (
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
  );
};

export default ProjectRoles;
