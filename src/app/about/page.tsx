"use client";
import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import bullets from "./bullets";
import { motion as m, AnimatePresence } from "framer-motion";
import Link from "next/link";

const FallingLeaves = dynamic(
  () => import("../../components/specific/FallingLeaves"),
  {
    ssr: false,
  }
);

export default function Home() {
  const [showHeart, setShowHeart] = React.useState<boolean>(false);
  const heartText = " (and in my partner's heart! 💕)";

  useEffect(() => {
    setShowHeart(true);
  }, []);

  return (
    <article className="p-10 container h-auto items-center font-roboto-mono lowercase">
      <div className="py-5">
        <div className="">
          <p className="font-bold">About</p>
        </div>
        <br />
        <p
          onMouseEnter={() => setShowHeart(true)}
          onMouseLeave={() => setShowHeart(false)}
        >
          Before finding my rightful place in web development
          <AnimatePresence mode="popLayout" initial={false}>
            {showHeart && (
              <m.span
                key="heart"
                className="heart-text inline-block align-middle"
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                style={{ transformOrigin: "top" }}
              >
                {heartText.split("").map((letter, index) => (
                  <m.span
                    key={index}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: 1,
                    }}
                    exit={{ opacity: 0 }}
                    transition={{
                      duration: 0.4,
                      delay: index * 0.01,
                      ease: "easeInOut",
                    }}
                  >
                    {letter}
                  </m.span>
                ))}
              </m.span>
            )}
          </AnimatePresence>
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
        </p>
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
              <span
                className={`absolute h-full w-full left-2 opacity-0 hover:opacity-100 transition-all duration-300`}
              >
                {bullet.icons.map((icon: string, index: number) => (
                  <m.span
                    key={index}
                    className=""
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
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
          lead me to web development, and here I am—happily coding away and
          hoping my past adventures make me a better builder!
        </p>
        <br />
        <p>
          Predictably, I&apos;ve found myself crafting web experiences that mix
          art, storytelling, and systems thinking—whether it&apos;s transforming
          lens-based work into{" "}
          <Link
            className="text-blue-900 dark:text-blue-400"
            href="https://www.art.sumitsute.com/"
            target="_blank"
          >
            artistic narratives
          </Link>{" "}
          or designing{" "}
          <Link
            className="text-blue-900 dark:text-blue-400"
            href="https://www.dod.sumitsute.com/"
            target="_blank"
          >
            Dramas of Discrimination
          </Link>{" "}
          to get people collaborating in new ways.
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
