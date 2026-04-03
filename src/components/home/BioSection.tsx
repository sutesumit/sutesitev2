import React from "react";
import { BookOpen, Book, GitMerge, GitBranchPlus } from "lucide-react";

import {
  CreativeBackgroundPanel,
  CurrentRolePanel,
} from "@/components/home/BioSectionPanels";
import InlineReveal from "@/components/shared/InlineReveal";

export const BioSection = () => {
  return (
    <>
      <div className="group">
        <InlineReveal
          trigger={
            <span>
              Before I ever wrote a line of <code>JavaScript:</code>
            </span>
          }
          expandedIcon={<BookOpen />}
          collapsedIcon={<Book />}
        >
          <CreativeBackgroundPanel />
        </InlineReveal>
      </div>
      <br />
      <InlineReveal
        trigger={
          <span>Today, as a fullstack developer at beneathAtree:</span>
        }
        expandedIcon={<GitBranchPlus />}
        collapsedIcon={<GitMerge />}
      >
        <CurrentRolePanel />
      </InlineReveal>
      <br />
    </>
  );
};
