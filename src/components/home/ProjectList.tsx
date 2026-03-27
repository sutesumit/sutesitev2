import React from "react";
import Link from "next/link";
import { projects } from "@/data/projectlist";

export const ProjectList = () => {
  // Add the slugs of projects you want to display manually
  const featuredSlugs = ["art", "dramas-of-discrimination"];
  const featuredProjects = projects.filter((project) =>
    featuredSlugs.includes(project.slug)
  );

  return (
    <>
      <p>Some of my ongoing side projects:</p>
      <ul className="project-list text-blue-900 dark:text-blue-400">
        {featuredProjects.map((project) => (
          <li key={project.slug} className="project-item">
            <Link href={`/work/${project.slug}`}>{project.title}</Link>
          </li>
        ))}
      </ul>
    </>
  );
};
