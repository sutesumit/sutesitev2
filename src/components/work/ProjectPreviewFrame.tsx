"use client";

import React from "react";
import Image from "next/image";
import { motion as m } from "framer-motion";
import { Maximize2, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProjectProps } from "@/data/projectlist";
import type { PreviewRect } from "@/hooks/usePreviewExpansion";

interface ProjectPreviewFrameProps {
  project: ProjectProps;
  isExpanded: boolean;
  isPreviewTransitioning: boolean;
  previewRect: PreviewRect;
  iframeScale: number;
  iframeViewport: { width: number; height: number };
  iframeLoading: boolean;
  isMounted: boolean;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onTogglePreview: () => void;
  onClosePreview: () => void;
  onTransitionComplete: () => void;
  onIframeLoad: () => void;
}

const ProjectPreviewFrame: React.FC<ProjectPreviewFrameProps> = ({
  project,
  isExpanded,
  isPreviewTransitioning,
  previewRect,
  iframeScale,
  iframeViewport,
  iframeLoading,
  isMounted,
  containerRef,
  onTogglePreview,
  onClosePreview,
  onTransitionComplete,
  onIframeLoad,
}) => {
  return (
    <>
      {(isExpanded || isPreviewTransitioning) && (
        <m.div
          className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40 cursor-default"
          initial={false}
          animate={{ opacity: isExpanded ? 1 : 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          onClick={onClosePreview}
        />
      )}
      <div
        ref={containerRef}
        className="relative w-full mb-4"
        style={{
          aspectRatio: `${iframeViewport.width} / ${iframeViewport.height}`,
        }}
      />
      {isMounted && previewRect && (
        <m.div
          className={cn(
            "fixed border border-blue-200 dark:border-blue-800 bg-gray-100 dark:bg-gray-900 shadow-md flex items-center justify-center overflow-hidden",
            isExpanded || isPreviewTransitioning
              ? "z-50 shadow-2xl"
              : "z-20 shadow-md"
          )}
          initial={false}
          animate={{
            top: previewRect.top,
            left: previewRect.left,
            width: previewRect.width,
            height: previewRect.height,
            borderRadius: isExpanded ? 8 : 4,
          }}
          transition={{
            duration: isExpanded || isPreviewTransitioning ? 0.32 : 0,
            ease: [0.22, 1, 0.36, 1],
          }}
          onAnimationComplete={onTransitionComplete}
        >
          {iframeLoading && project.screenshot && (
            <Image
              src={project.screenshot}
              alt={`${project.title} preview`}
              fill
              className="absolute inset-0 object-cover pointer-events-none"
            />
          )}
          {iframeLoading && (
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          <iframe
            src={project.livelink}
            className={cn(
              "border-none",
              isExpanded
                ? "w-full h-full"
                : "absolute top-1/2 left-1/2 origin-center"
            )}
            style={
              isExpanded
                ? { width: "100%", height: "100%", transform: "none" }
                : {
                    width: `${iframeViewport.width}px`,
                    height: `${iframeViewport.height}px`,
                    transform: `translate(-50%, -50%) scale(${iframeScale})`,
                  }
            }
            title={`Preview of ${project.title}`}
            onLoad={onIframeLoad}
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation-by-user-activation"
          />

          <button
            onClick={(e) => {
              e.stopPropagation();
              onTogglePreview();
            }}
            className="absolute bottom-4 right-4 z-30 p-2 rounded-lg bg-white/85 dark:bg-slate-900/85 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-slate-900 shadow-md backdrop-blur-sm transition-all duration-300"
            title={isExpanded ? "Collapse preview" : "Expand preview"}
            aria-label={
              isExpanded ? "Collapse preview" : "Expand preview"
            }
          >
            {isExpanded ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
        </m.div>
      )}
    </>
  );
};

export default ProjectPreviewFrame;
