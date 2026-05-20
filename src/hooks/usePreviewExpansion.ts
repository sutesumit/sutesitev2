"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const MOBILE_BREAKPOINT = 380;
const TABLET_VIEWPORT = { width: 900, height: 675 };
const MOBILE_VIEWPORT = { width: 375, height: 812 };
const EXPANDED_MAX_WIDTH = 1152;

export type PreviewRect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

const getExpandedPreviewRect = (): PreviewRect => {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const inset = viewportWidth >= 768 ? 40 : 16;
  const width = Math.min(
    viewportWidth * 0.9,
    EXPANDED_MAX_WIDTH,
    viewportWidth - inset * 2
  );
  const height = Math.min(
    viewportHeight * 0.85,
    viewportHeight - inset * 2
  );

  return {
    top: (viewportHeight - height) / 2,
    left: (viewportWidth - width) / 2,
    width,
    height,
  };
};

export interface UsePreviewExpansionReturn {
  containerRef: React.RefObject<HTMLDivElement | null>;
  isExpanded: boolean;
  isPreviewTransitioning: boolean;
  previewRect: PreviewRect | null;
  iframeScale: number;
  iframeViewport: { width: number; height: number };
  iframeLoading: boolean;
  setIframeLoading: (loading: boolean) => void;
  isMounted: boolean;
  togglePreview: () => void;
  closePreview: () => void;
  handleTransitionComplete: () => void;
}

export function usePreviewExpansion(): UsePreviewExpansionReturn {
  const [iframeLoading, setIframeLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const [iframeScale, setIframeScale] = useState(1);
  const [iframeViewport, setIframeViewport] = useState(TABLET_VIEWPORT);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isPreviewTransitioning, setIsPreviewTransitioning] = useState(false);
  const [collapsedPreviewRect, setCollapsedPreviewRect] =
    useState<PreviewRect | null>(null);
  const [expandedPreviewRect, setExpandedPreviewRect] =
    useState<PreviewRect | null>(null);

  const updatePreviewMetrics = useCallback(() => {
    if (!containerRef.current) return;

    const { top, left, width, height } =
      containerRef.current.getBoundingClientRect();
    const nextViewport =
      width < MOBILE_BREAKPOINT ? MOBILE_VIEWPORT : TABLET_VIEWPORT;

    setCollapsedPreviewRect({ top, left, width, height });
    setExpandedPreviewRect(getExpandedPreviewRect());
    setIframeViewport((currentViewport) =>
      currentViewport.width === nextViewport.width &&
      currentViewport.height === nextViewport.height
        ? currentViewport
        : nextViewport
    );

    const scaleX = width / nextViewport.width;
    const scaleY = height / nextViewport.height;
    setIframeScale(Math.min(scaleX, scaleY));
  }, []);

  const togglePreview = useCallback(() => {
    updatePreviewMetrics();
    setIsPreviewTransitioning(true);
    setIsExpanded((current) => !current);
  }, [updatePreviewMetrics]);

  const closePreview = useCallback(() => {
    updatePreviewMetrics();
    setIsPreviewTransitioning(true);
    setIsExpanded(false);
  }, [updatePreviewMetrics]);

  // Body overflow lock when expanded
  useEffect(() => {
    if (isExpanded) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isExpanded]);

  // Escape key to close
  useEffect(() => {
    if (!isExpanded) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closePreview();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closePreview, isExpanded]);

  // Mount, resize observer, and initial metrics
  useEffect(() => {
    setIsMounted(true);
    updatePreviewMetrics();
    const animationFrame = requestAnimationFrame(updatePreviewMetrics);
    const observer = new ResizeObserver(updatePreviewMetrics);
    if (containerRef.current) observer.observe(containerRef.current);
    window.addEventListener("resize", updatePreviewMetrics);

    return () => {
      cancelAnimationFrame(animationFrame);
      observer.disconnect();
      window.removeEventListener("resize", updatePreviewMetrics);
    };
  }, [updatePreviewMetrics]);

  // Scroll listener (only when collapsed)
  useEffect(() => {
    if (isExpanded) return;

    window.addEventListener("scroll", updatePreviewMetrics, {
      passive: true,
    });
    return () => window.removeEventListener("scroll", updatePreviewMetrics);
  }, [isExpanded, updatePreviewMetrics]);

  // Iframe loading timeout
  useEffect(() => {
    const timer = setTimeout(() => {
      setIframeLoading(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleTransitionComplete = useCallback(() => {
    setIsPreviewTransitioning(false);
  }, []);

  const previewRect = isExpanded ? expandedPreviewRect : collapsedPreviewRect;

  return {
    containerRef,
    isExpanded,
    isPreviewTransitioning,
    previewRect,
    iframeScale,
    iframeViewport,
    iframeLoading,
    setIframeLoading,
    isMounted,
    togglePreview,
    closePreview,
    handleTransitionComplete,
  };
}
