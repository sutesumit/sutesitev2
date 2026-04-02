"use client";

import React, { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { motion as m } from "framer-motion";
import Link from "next/link";

import bullets from "../bullets";

const FallingLeaves = dynamic(
  () => import("@/components/specific/FallingLeaves"),
  {
    ssr: false,
  }
);

const HEART_TEXT = " (and in my partner's heart! 💕)";
const HEART_STEP_INTERVAL_MS = 14;

const segmentHeartText = (text: string): string[] => {
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const segmenter = new Intl.Segmenter(undefined, {
      granularity: "grapheme",
    });

    return Array.from(segmenter.segment(text), ({ segment }) => segment);
  }

  return Array.from(text);
};

const HEART_TOKENS = segmentHeartText(HEART_TEXT);

export function AboutContent() {
  const [isHeartHovered, setIsHeartHovered] = React.useState<boolean>(false);
  const [visibleHeartCount, setVisibleHeartCount] = React.useState<number>(0);
  const targetHeartCountRef = useRef<number>(0);

  useEffect(() => {
    targetHeartCountRef.current = isHeartHovered ? HEART_TOKENS.length : 0;
  }, [isHeartHovered]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setVisibleHeartCount((currentCount) => {
        const targetCount = targetHeartCountRef.current;

        if (currentCount === targetCount) {
          return currentCount;
        }

        return currentCount < targetCount ? currentCount + 1 : currentCount - 1;
      });
    }, HEART_STEP_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  const visibleHeartTokens = HEART_TOKENS.slice(0, visibleHeartCount);

  return (
    <article className="p-10 container h-auto items-center font-roboto-mono lowercase">
      <div className="py-5">
        <div className="">
          <p className="font-bold">About</p>
        </div>
        <br />
        <m.p
          layout
          onMouseEnter={() => setIsHeartHovered(true)}
          onMouseLeave={() => setIsHeartHovered(false)}
          transition={{
            layout: {
              duration: 0.45,
              ease: [0.22, 1, 0.36, 1],
            },
          }}
        >
          Before finding my rightful place in web development
          {visibleHeartTokens.length > 0 ? (
            <m.span
              key="heart"
              className="heart-text inline align-middle"
              initial={false}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              style={{ transformOrigin: "top" }}
            >
              {visibleHeartTokens.map((token, index) =>
                token === " " ? (
                  <React.Fragment key={`space-${index}`}> </React.Fragment>
                ) : (
                  <m.span
                    key={`${token}-${index}`}
                    className="inline-block"
                    initial={{ opacity: 0, y: 2 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      duration: 0.16,
                      ease: "easeOut",
                    }}
                  >
                    {token}
                  </m.span>
                )
              )}
            </m.span>
          ) : null}
          <span>
            {" "}
            my journey has taken me through mechanical engineering at iit
            madras, editorial journalism at hindustan times, documentary
            photography for maharashtra government and indian institute of human
            settlements, communication strategy for various organizations, and
            community organizing at Ambedkar Reading Circle. A common thread
            runs through all these experiences: the drive to create things that
            enhance and complement life.
          </span>
        </m.p>
        <br />
        <p className="inline">
          Building backwards and retracing every step that led me here.
        </p>
        <div className="inline">
          <FallingLeaves />
        </div>
        <ul className="life-line project-list p-2 pb-5">
          {bullets.map((bullet, index) => (
            <li key={index} className="relative project-item">
              <span className="absolute h-full w-full left-2 opacity-0 hover:opacity-100 transition-all duration-300">
                {bullet.icons.map((icon: string, iconIndex: number) => (
                  <m.span
                    key={iconIndex}
                    className=""
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: iconIndex * 0.1 }}
                  >
                    <span>{icon}</span>
                  </m.span>
                ))}
              </span>
              <br />
              {bullet.body}
            </li>
          ))}
        </ul>
        <p>
          I did expect my love for engineering, storytelling, and photography to
          lead me to web development, and here I am happily coding away and
          hoping my past adventures make me a better builder!
        </p>
        <br />
        <p>
          Predictably, I&apos;ve found myself crafting web experiences that mix
          art, storytelling, and systems thinking, whether it&apos;s transforming
          lens-based work into{" "}
          <Link
            className="text-blue-900 dark:text-blue-400"
            href="https://www.art.sumitsute.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            artistic narratives
          </Link>{" "}
          , designing{" "}
          <Link
            className="text-blue-900 dark:text-blue-400"
            href="https://www.dod.sumitsute.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Dramas of Discrimination
          </Link>{" "}
          to get people collaborating in new ways, or building this{" "}
          <Link
            className="text-blue-900 dark:text-blue-400"
            href="https://sumitsute.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Dev Diary
          </Link>{" "}
          as a home for my writing, publishing systems, and engineering
          experiments.
        </p>
        <br />
        <p>
          For me, web development is an ideal avenue to channel my past
          experiences into building meaningful and innovative digital
          experiences.
        </p>
      </div>
    </article>
  );
}
