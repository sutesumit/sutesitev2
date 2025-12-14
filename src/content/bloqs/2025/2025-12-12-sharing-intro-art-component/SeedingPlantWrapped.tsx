"use client";
import { useState } from "react";
import { Copy, Check } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const SEEDINGPLANT_CODE = `// 🌱 Seeding Plant
/**
 * ────────────────────────────────────────────────────────────────────────
 *  SeedingPlant – Stand‑alone component
 *
 *  What this file includes:
 *  • The Lottie animation data (seedingPlantLottie) embedded as a constant.
 *  • The React component that renders the animation and restarts it on hover.
 *  • Inline instructions for installing required dependencies.
 *
 *  How to use:
 *  1️⃣ Install the Lottie React wrapper (once per project):
 *
 *        npm install lottie-react   # or: yarn add lottie-react
 *
 *  2️⃣ Copy this entire file into your project, e.g.:
 *
 *        src/components/SeedingPlant.tsx
 *
 *  3️⃣ Import and render the component wherever you need it:
 *
 *        import SeedingPlant from '@/components/SeedingPlant';
 *
 *        <SeedingPlant />
 *
 *  No additional assets or JSON files are required – the animation data is
 *  bundled directly in the source code.
 * ────────────────────────────────────────────────────────────────────────
 */
'use client';
import React from 'react';
import Lottie, { LottieRefCurrentProps } from 'lottie-react';
/* --------------------------------------------------------------
 *  Lottie animation JSON (exported from After Effects → Bodymovin)
 *  You can replace this object with any other Lottie JSON if you wish.
 * -------------------------------------------------------------- */
const seedingPlantLottie = {
  "v": "5.8.1",
  "fr": 60,
  "ip": 0,
  "op": 285,
  "w": 1024,
  "h": 1024,
  "nm": "emoji_seedig",
  "ddd": 0,
  "assets": [],
  "layers": [
    {
      "ddd": 0,
      "ind": 1,
      "ty": 4,
      "nm": "Leaf L ",
      "parent": 3,
      "sr": 1,
      "ks": {
        "o": { "a": 0, "k": 100, "ix": 11 },
        "r": {
          "a": 1,
          "k": [
            { "i": { "x": [0.424], "y": [1] }, "o": { "x": [0.333], "y": [0] }, "t": 97, "s": [-26] },
            { "i": { "x": [0.436], "y": [1] }, "o": { "x": [0.333], "y": [0] }, "t": 130, "s": [3] },
            { "i": { "x": [0.667], "y": [1] }, "o": { "x": [0.394], "y": [0] }, "t": 155, "s": [-14.333] },
            { "i": { "x": [0.585], "y": [1] }, "o": { "x": [0.333], "y": [0] }, "t": 190, "s": [2.797] },
            { "i": { "x": [0.585], "y": [1] }, "o": { "x": [0.333], "y": [0] }, "t": 214, "s": [-2] },
            { "i": { "x": [0.585], "y": [1] }, "o": { "x": [0.167], "y": [0] }, "t": 243, "s": [0] },
            { "i": { "x": [0.667], "y": [1] }, "o": { "x": [0.189], "y": [0] }, "t": 262, "s": [0] },
            { "i": { "x": [0.704], "y": [1] }, "o": { "x": [0.333], "y": [0] }, "t": 268, "s": [3] },
            { "i": { "x": [0.46], "y": [1] }, "o": { "x": [0.675], "y": [0] }, "t": 283, "s": [-3] },
            { "t": 314, "s": [-43] }
          ],
          "ix": 10
        },
        "p": {
          "a": 1,
          "k": [
            {
              "i": { "x": 0.667, "y": 1 },
              "o": { "x": 0.167, "y": 0.167 },
              "t": 130,
              "s": [2.894, 28.388, 0],
              "to": [0, 0, 0],
              "ti": [0, 0, 0]
            },
            {
              "i": { "x": 0.667, "y": 1 },
              "o": { "x": 0.333, "y": 0 },
              "t": 144,
              "s": [22.894, 4.388, 0],
              "to": [0, 0, 0],
              "ti": [0, 0, 0]
            },
            {
              "i": { "x": 0.667, "y": 0.667 },
              "o": { "x": 0.333, "y": 0.333 },
              "t": 214,
              "s": [2.894, -7.612, 0],
              "to": [0, 0, 0],
              "ti": [0, 0, 0]
            },
            {
              "i": { "x": 0.667, "y": 0.667 },
              "o": { "x": 0.167, "y": 0.167 },
              "t": 243,
              "s": [2.894, -7.612, 0],
              "to": [0, 0, 0],
              "ti": [0, 0, 0]
            },
            {
              "i": { "x": 0.667, "y": 0.667 },
              "o": { "x": 0.167, "y": 0.167 },
              "t": 262,
              "s": [2.894, -7.612, 0],
              "to": [0, 0, 0],
              "ti": [0, 0, 0]
            },
            {
              "i": { "x": 0.833, "y": 0.833 },
              "o": { "x": 0.333, "y": 0 },
              "t": 279,
              "s": [2.894, -7.612, 0],
              "to": [0, 0, 0],
              "ti": [0, 0, 0]
            },
            {
              "i": { "x": 0.833, "y": 0.833 },
              "o": { "x": 0.167, "y": 0.167 },
              "t": 304,
              "s": [12.894, -7.612, 0],
              "to": [0, 0, 0],
              "ti": [0, 0, 0]
            },
            { "t": 314, "s": [-3.106, -1.612, 0] }
          ],
          "ix": 2,
          "l": 2
        },
        "a": { "a": 0, "k": [32.605, 405.238, 0], "ix": 1, "l": 2 },
        "s": {
          "a": 1,
          "k": [
            {
              "i": { "x": [0.842, 0.842, 0.667], "y": [0.762, 0.762, 1] },
              "o": { "x": [0.333, 0.333, 0.333], "y": [0, 0, 0] },
              "t": 97,
              "s": [10, 10, 100]
            },
            {
              "i": { "x": [0.575, 0.575, 0.667], "y": [0.774, 0.774, 1] },
              "o": { "x": [0.266, 0.266, 0.333], "y": [0.436, 0.436, 0] },
              "t": 130,
              "s": [66, 66, 100]
            },
            {
              "i": { "x": [0.667, 0.667, 0.667], "y": [1, 1, 1] },
              "o": { "x": [0.135, 0.135, 0.333], "y": [0.653, 0.653, 0] },
              "t": 144,
              "s": [87.917, 87.917, 100]
            },
            {
              "i": { "x": [0.667, 0.667, 0.667], "y": [1, 1, 1] },
              "o": { "x": [0.333, 0.333, 0.333], "y": [0, 0, 0] },
              "t": 214,
              "s": [100, 100, 100]
            },
            {
              "i": { "x": [0.667, 0.667, 0.667], "y": [1, 1, 1] },
              "o": { "x": [0.167, 0.167, 0.167], "y": [0, 0, 0] },
              "t": 243,
              "s": [100, 100, 100]
            },
            {
              "i": { "x": [0.667, 0.667, 0.667], "y": [1, 1, 1] },
              "o": { "x": [0.167, 0.167, 0.167], "y": [0, 0, 0] },
              "t": 262,
              "s": [100, 100, 100]
            },
            {
              "i": { "x": [0.833, 0.833, 0.833], "y": [0.833, 0.833, -0.667] },
              "o": { "x": [0.811, 0.811, 0.333], "y": [0, 0, 0] },
              "t": 279,
              "s": [100, 100, 100]
            },
            {
              "i": { "x": [0.833, 0.833, 0.833], "y": [0.833, 0.833, 0.833] },
              "o": { "x": [0.167, 0.167, 0.167], "y": [0.167, 0.167, 0.167] },
              "t": 304,
              "s": [80, 80, 100]
            },
            { "t": 314, "s": [10, 10, 100] }
          ],
          "ix": 6,
          "l": 2
        }
      },
      "ao": 0,
      "shapes": [
        {
          "ty": "gr",
          "it": [
            {
              "ind": 0,
              "ty": "sh",
              "ix": 1,
              "ks": {
                "a": 1,
                "k": [
                  {
                    "i": { "x": 0.833, "y": 0.833 },
                    "o": { "x": 0.167, "y": 0.167 },
                    "t": 97,
                    "s": [
                      {
                        "i": [[76.08, -90.16], [3.92, -23.199], [-7.28, 9.839], [-68, 77.361], [-11.273, 13.263], [10.584, -4.673]],
                        "o": [[-74.4, 88.159], [-3.92, 23.2], [13.12, -17.76], [58.88, -66.88], [7.011, -8.249], [-10.584, 4.606]],
                        "v": [[-79.101, -67.036], [-157.128, 112.704], [-140.888, 125.105], [-51.901, -30.717], [18.782, -130.102], [7.51, -144.055]],
                        "c": true
                      }
                    ]
                  },
                  {
                    "i": { "x": 0.833, "y": 0.833 },
                    "o": { "x": 0.167, "y": 0.167 },
                    "t": 105,
                    "s": [
                      {
                        "i": [[76.08, -90.16], [3.92, -23.199], [-7.28, 9.839], [-68, 77.361], [-12.33, 14.508], [11.577, -5.111]],
                        "o": [[-74.4, 88.159], [-3.92, 23.2], [13.12, -17.76], [58.88, -66.88], [7.668, -9.022], [-11.577, 5.038]],
                        "v": [[-38.6, -41.719], [-238.926, 307.739], [-222.686, 320.14], [-11.4, -5.4], [87.815, -130.688], [75.486, -145.95]],
                        "c": true
                      }
                    ]
                  },
                  {
                    "i": { "x": 0.667, "y": 1 },
                    "o": { "x": 0.167, "y": 0.167 },
                    "t": 130,
                    "s": [
                      {
                        "i": [[76.08, -90.16], [3.92, -23.199], [-7.28, 9.839], [-68, 77.361], [-13.12, 15.439], [12.32, -5.439]],
                        "o": [[-74.4, 88.159], [-3.92, 23.2], [13.12, -17.76], [58.88, -66.88], [8.16, -9.601], [-12.32, 5.361]],
                        "v": [[-38.6, -41.72], [-154.44, 158.52], [-138.2, 170.921], [-31.613, -1.947], [156.885, -133.083], [148.186, -152.063]],
                        "c": true
                      }
                    ]
                  },
                  {
                    "i": { "x": 0.833, "y": 0.833 },
                    "o": { "x": 0.333, "y": 0 },
                    "t": 144,
                    "s": [
                      {
                        "i": [[76.08, -90.16], [3.92, -23.199], [-7.28, 9.839], [-68, 77.361], [-16.53, 11.716], [13.282, -2.225]],
                        "o": [[-74.4, 88.159], [-3.92, 23.2], [13.12, -17.76], [58.88, -66.88], [10.28, -7.286], [-13.263, 2.149]],
                        "v": [[-58.813, -38.266], [-154.44, 158.52], [-138.2, 170.921], [-31.613, -1.947], [156.885, -133.083], [148.186, -152.063]],
                        "c": true
                      }
                    ]
                  },
                  {
                    "i": { "x": 0.833, "y": 0.833 },
                    "o": { "x": 0.167, "y": 0.167 },
                    "t": 299,
                    "s": [
                      {
                        "i": [[94.216, -70.995], [3.92, -23.199], [-7.28, 9.839], [-83.537, 60.251], [-6.7, 19.121], [9.544, -9.501]],
                        "o": [[-92.13, 69.422], [-3.92, 23.2], [13.12, -17.76], [72.269, -52.124], [4.167, -11.891], [-9.572, 9.429]],
                        "v": [[-37.587, -26.349], [-152.662, 158.556], [-141.683, 167.291], [-19.137, 15.107], [137.6, -160.587], [124.651, -168.347]],
                        "c": true
                      }
                    ]
                  }
                ]
              },
              "nm": "Path 1",
              "mn": "ADBE Vector Shape - Group",
              "hd": false
            },
            {
              "ty": "fl",
              "c": { "a": 0, "k": [0.902, 0.863, 0.624, 1], "ix": 4 },
              "o": { "a": 0, "k": 100, "ix": 5 },
              "r": 1,
              "bm": 0,
              "nm": "Fill 1",
              "mn": "ADBE Vector Graphic - Fill",
              "hd": false
            },
            {
              "ty": "tr",
              "p": { "a": 0, "k": [96.05, 304.45], "ix": 2 },
              "a": { "a": 0, "k": [0, 0], "ix": 1 },
              "s": { "a": 0, "k": [100, 100], "ix": 3 },
              "r": { "a": 0, "k": 0, "ix": 6 },
              "o": { "a": 0, "k": 100, "ix": 7 },
              "sk": { "a": 0, "k": 0, "ix": 4 },
              "sa": { "a": 0, "k": 0, "ix": 5 },
              "nm": "Transform"
            }
          ],
          "nm": "Group 1",
          "np": 2,
          "cix": 2,
          "bm": 0,
          "ix": 1,
          "mn": "ADBE Vector Group",
          "hd": false
        }
      ],
      "ip": 89,
      "op": 320,
      "st": -20,
      "bm": 0
    }
  ],
  "markers": []
};
/* --------------------------------------------------------------
 *  SeedingPlant component – renders the animation.
 * -------------------------------------------------------------- */
const SeedingPlant: React.FC = () => {
  // Reference to the Lottie instance so we can control playback.
  const lottieRef = React.useRef<LottieRefCurrentProps | null>(null);
  // Restart the animation each time the user hovers over the component.
  const handleMouseEnter = () => {
    if (lottieRef.current) {
      // Go to the first frame and play forward.
      lottieRef.current.goToAndPlay(0, true);
    }
  };
  return (
    <span
      className="inline-block cursor-pointer"
      onMouseEnter={handleMouseEnter}
    >
      <Lottie
        lottieRef={lottieRef}
        animationData={seedingPlantLottie}
        autoPlay={true}
        loop={false}
        className="inline-block h-4 w-4 ml-2"
      />
    </span>
  );
};
export default SeedingPlant;
`;

export function SeedingPlantWrapped() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(SEEDINGPLANT_CODE);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      aria-label="Copy code to clipboard"
      className="
        inline-flex items-baseline gap-1
        text-muted-foreground
        hover:text-foreground
        transition-colors
        opacity-50
        hover:opacity-100
      "
    >
      {copied ? (
        <Check size={12} className="text-green-600 " />
      ) : (
        <Copy size={12} />
      )}
    </button>
  );
}
