import React from "react";
import Link from "next/link";

export const ProjectList = () => {
  return (
    <>
      <p>Side projects I am currently working on:</p>
      <ul className="project-list text-blue-900 dark:text-blue-400">
        <li className="project-item">
          <Link href="/work/art">art.sumitsute.com</Link>
        </li>
        <li className="project-item">
          <Link href="/work/dramas-of-discrimination">
            Dramas of Discrimination
          </Link>
        </li>
      </ul>
    </>
  );
};
