import React from "react";
import Link from "next/link";

export const CreativeBackgroundPanel = () => {
  return (
    <p className="leading-relaxed opacity-90">
      I told stories through visuals, writing, and design experiments. From
      documenting atrocity and resilience on the ground for{" "}
      <Link
        className="highlight"
        href="https://thewire.in/rights/in-photos-documenting-atrocities-against-dalits-in-gujarat"
      >
        The Wire
      </Link>{" "}
      to shaping the visual voice for the headlines at{" "}
      <Link className="highlight" href="https://www.hindustantimes.com/">
        Hindustan Times
      </Link>
      , I learned how narratives move through people. Rooted in the political
      and personal, my visual practice was validated by admits and scholarships
      at{" "}
      <Link
        className="highlight"
        href="https://calarts.edu/academics/programs-and-degrees/mfa-photography-and-media"
      >
        CalArts, Los Angeles
      </Link>
      , and the{" "}
      <Link
        className="highlight"
        href="https://www.icp.org/sites/default/files/20ICP_MFA_Catalog-low.pdf"
      >
        ICP, New York
      </Link>
      . Through fellowships, exhibitions and features, my visual practice
      traced how art meets resistance. At{" "}
      <Link className="highlight" href="https://www.fieldsofview.in/">
        Fields of View
      </Link>
      , I wove art, data, and design into participatory games and tools for
      policymaking, and at the Ambedkar Reading Circle, I fused systems
      thinking, dramaturgy and code to create{" "}
      <Link className="highlight" href="https://www.dod.sumitsute.com/">
        Dramas of Discrimination
      </Link>{" "}
      - an open-source toolkit for inclusive practices. But before all this, at{" "}
      <Link className="highlight" href="https://mech.iitm.ac.in/">
        IIT Madras
      </Link>
      , I was also coding in Python to study how Rapidly-Exploring Random Tree
      algorithms shape motion.
    </p>
  );
};

export const CurrentRolePanel = () => {
  return (
    <p className="leading-relaxed opacity-90">
      I build end-to-end features at{" "}
      <Link
        target="_blank"
        className="highlight"
        href="https://beneathatree.com/"
      >
        beneathAtree
      </Link>{" "}
      for a senior-living hospitality system, integrating a React + Redux
      frontend with a serverless AWS Lambda backend, MongoDB, and Alexa for
      Hospitality (A4H) to assist caregivers and improve task turnaround time.
    </p>
  );
};
