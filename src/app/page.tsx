"use client";
import React from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import HoverTextTyper from "@/components/shared/HoverTextTyper";
import { BookOpen, Book, GitMerge, GitBranchPlus } from "lucide-react";

const SeedingPlant = dynamic(
  () => import("../components/specific/SeedingPlant"),
  {
    ssr: false,
  }
);

export default function Home() {
  return (
    <article className="p-10 container min-h-screen flex flex-col justify-center font-roboto-mono lowercase">
      <div className="">
        <div className="flex">
          <p>Hellos. Sumit Sute here.</p>
          <SeedingPlant />
        </div>
        <br />
        <div className="group">
          <HoverTextTyper
            triggerText={
              <span>
                Before I ever wrote a line of <code>JavaScript:</code>
              </span>
            }
            openIcon={<BookOpen />}
            closedIcon={<Book />}
            typingText="I told stories through visuals, writing, and design experiments. From documenting atrocity and resilience on the ground for The Wire to shaping the visual voice for the headlines at Hindustan Times, I learned how narratives move through people. Rooted in the political and personal, my visual practice was validated by admits and scholarships at CalArts, Los Angeles, and the ICP, New York. Through fellowships, exhibitions and features, my visual practice traced how art meets resistance. At Fields of View, I wove art, data, and design into participatory games and tools for policymaking, and at the Ambedkar Reading Circle, I fused systems thinking, dramaturgy and code to create Dramas of Discrimination — an open-source toolkit for inclusive practices. But before all this, at IIT Madras, I was also coding in Python to study how Rapidly-Exploring Random Tree algorithms shape motion."
          />
        </div>
        <br />
        <HoverTextTyper
          triggerText={
            <>
              <span>Today, as a fullstack developer at</span>
              <Link
                target="_blank"
                className="ml-1 border-[1px] border-opacity-25 dark:border-opacity-25 bg-blue-100 dark:bg-blue-950 border-blue-900 dark:border-blue-400 rounded-sm px-1"
                href="https://beneathatree.com/"
              >
                beneathAtree
              </Link>
              {":"}
            </>
          }
          openIcon={<GitBranchPlus />}
          closedIcon={<GitMerge />}
          typingText="I build end-to-end features for a senior-living hospitality system, integrating a React + Redux frontend with a serverless AWS Lambda backend, MongoDB, and Alexa for Hospitality (A4H) to assist caregivers and improve task turnaround time."
        />
        <br />
        <br />
        <p>
          I continue to draw from the my creative instincts. And my interactive digital art continues to explore the intersection of personal archives, inherited emotions, and the political — imagining the web as a space for artistic expression and self-reflection.
        </p>
        <br />
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
        <br />
      </div>
    </article>
  );
}
