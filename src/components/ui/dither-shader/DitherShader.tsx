"use client";
import React, { useEffect, useRef, useCallback, useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import type { DitherShaderProps } from "./types";
import { getDitherStrategy } from "./strategies";
import { getColorProcessor } from "./processors";
import { parseColor, getLuminance, clamp } from "./utils/colorUtils";

export const DitherShader: React.FC<DitherShaderProps> = ({
  src,
  gridSize = 4,
  ditherMode = "bayer",
  colorMode = "original",
  invert = false,
  pixelRatio = 1,
  primaryColor = "#000000",
  secondaryColor = "#ffffff",
  customPalette = ["#000000", "#ffffff"],
  brightness = 0,
  contrast = 1,
  backgroundColor = "transparent",
  objectFit = "cover",
  threshold = 0.5,
  animated = false,
  animationSpeed = 0.02,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const timeRef = useRef<number>(0);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const imageDataRef = useRef<ImageData | null>(null);
  const dimensionsRef = useRef<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  const [dimensions, setDimensions] = useState<{
    width: number;
    height: number;
  }>({ width: 0, height: 0 });

  const parsedPrimaryColor = useMemo(() => parseColor(primaryColor), [primaryColor]);
  const parsedSecondaryColor = useMemo(() => parseColor(secondaryColor), [secondaryColor]);
  const parsedCustomPalette = useMemo(() => customPalette.map(parseColor), [customPalette]);

  const ditherStrategy = useMemo(() => getDitherStrategy(ditherMode), [ditherMode]);
  const colorProcessor = useMemo(
    () => getColorProcessor(colorMode, parsedPrimaryColor, parsedSecondaryColor, parsedCustomPalette),
    [colorMode, parsedPrimaryColor, parsedSecondaryColor, parsedCustomPalette]
  );

  const applyDithering = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      displayWidth: number,
      displayHeight: number,
      time: number = 0,
    ) => {
      const canvas = canvasRef.current;
      if (!canvas || !imageDataRef.current) return;

      if (backgroundColor !== "transparent") {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, displayWidth, displayHeight);
      } else {
        ctx.clearRect(0, 0, displayWidth, displayHeight);
      }

      const sourceData = imageDataRef.current.data;
      const sourceWidth = imageDataRef.current.width;
      const sourceHeight = imageDataRef.current.height;

      const effectivePixelSize = Math.max(1, Math.floor(gridSize * pixelRatio));

      for (let y = 0; y < displayHeight; y += effectivePixelSize) {
        for (let x = 0; x < displayWidth; x += effectivePixelSize) {
          const srcX = Math.floor((x / displayWidth) * sourceWidth);
          const srcY = Math.floor((y / displayHeight) * sourceHeight);
          const srcIdx = (srcY * sourceWidth + srcX) * 4;

          let r = sourceData[srcIdx] || 0;
          let g = sourceData[srcIdx + 1] || 0;
          let b = sourceData[srcIdx + 2] || 0;
          const a = sourceData[srcIdx + 3] || 0;

          if (a < 10) continue;

          r = clamp((r - 128) * contrast + 128 + brightness * 255, 0, 255);
          g = clamp((g - 128) * contrast + 128 + brightness * 255, 0, 255);
          b = clamp((b - 128) * contrast + 128 + brightness * 255, 0, 255);

          const luminance = getLuminance(r, g, b) / 255;

          let ditherThreshold = ditherStrategy.getThreshold(x, y, time, gridSize);
          ditherThreshold = ditherThreshold * (1 - threshold) + threshold * 0.5;

          let outputColor = colorProcessor.process(r, g, b, luminance, ditherThreshold);

          if (invert) {
            outputColor = [
              255 - outputColor[0],
              255 - outputColor[1],
              255 - outputColor[2],
            ];
          }

          ctx.fillStyle = `rgb(${outputColor[0]}, ${outputColor[1]}, ${outputColor[2]})`;
          ctx.fillRect(x, y, effectivePixelSize, effectivePixelSize);
        }
      }
    },
    [
      gridSize,
      ditherStrategy,
      colorProcessor,
      invert,
      pixelRatio,
      brightness,
      contrast,
      backgroundColor,
      threshold,
    ],
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateDimensions = (width: number, height: number) => {
      if (width > 0 && height > 0) {
        dimensionsRef.current = { width, height };
        setDimensions({ width, height });
      }
    };

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        updateDimensions(width, height);
      }
    });

    resizeObserver.observe(container);

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          const { width, height } = dimensionsRef.current;
          if (width > 0 && height > 0) continue;
          const rect = el.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            updateDimensions(rect.width, rect.height);
          }
        }
      },
      { rootMargin: "50px", threshold: 0 }
    );
    intersectionObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dimensions.width === 0 || dimensions.height === 0) return;

    let isCancelled = false;

    const processImage = (img: HTMLImageElement) => {
      if (isCancelled) return;

      const dpr =
        typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
      const displayWidth = dimensions.width;
      const displayHeight = dimensions.height;

      canvas.width = Math.floor(displayWidth * dpr);
      canvas.height = Math.floor(displayHeight * dpr);

      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.resetTransform();
      ctx.scale(dpr, dpr);

      const offscreen = document.createElement("canvas");
      const iw = img.naturalWidth || displayWidth;
      const ih = img.naturalHeight || displayHeight;

      let dw = displayWidth;
      let dh = displayHeight;
      let dx = 0;
      let dy = 0;

      if (objectFit === "cover") {
        const scale = Math.max(displayWidth / iw, displayHeight / ih);
        dw = Math.ceil(iw * scale);
        dh = Math.ceil(ih * scale);
        dx = Math.floor((displayWidth - dw) / 2);
        dy = Math.floor((displayHeight - dh) / 2);
      } else if (objectFit === "contain") {
        const scale = Math.min(displayWidth / iw, displayHeight / ih);
        dw = Math.ceil(iw * scale);
        dh = Math.ceil(ih * scale);
        dx = Math.floor((displayWidth - dw) / 2);
        dy = Math.floor((displayHeight - dh) / 2);
      } else if (objectFit === "fill") {
        dw = displayWidth;
        dh = displayHeight;
      } else {
        dw = iw;
        dh = ih;
        dx = Math.floor((displayWidth - dw) / 2);
        dy = Math.floor((displayHeight - dh) / 2);
      }

      offscreen.width = displayWidth;
      offscreen.height = displayHeight;
      const offCtx = offscreen.getContext("2d");
      if (!offCtx) return;

      offCtx.drawImage(img, dx, dy, dw, dh);

      try {
        imageDataRef.current = offCtx.getImageData(
          0,
          0,
          displayWidth,
          displayHeight,
        );
      } catch {
        console.error("Could not get image data. CORS issue?");
        return;
      }

      applyDithering(ctx, displayWidth, displayHeight, 0);

      if (animated) {
        const animate = () => {
          if (isCancelled) return;
          timeRef.current += animationSpeed;
          applyDithering(ctx, displayWidth, displayHeight, timeRef.current);
          animationRef.current = requestAnimationFrame(animate);
        };
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    if (imageRef.current && imageRef.current.complete) {
      processImage(imageRef.current);
    } else {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = src;

      img.onload = () => {
        if (isCancelled) return;
        imageRef.current = img;
        processImage(img);
      };

      img.onerror = () => {
        console.error("Failed to load image for DitherShader:", src);
      };
    }

    return () => {
      isCancelled = true;
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [src, dimensions, objectFit, animated, animationSpeed, applyDithering]);

  return (
    <div ref={containerRef} className={cn("relative h-full w-full", className)}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        style={{ imageRendering: "pixelated" }}
        aria-label="Dithered image"
        role="img"
      />
    </div>
  );
};

export default DitherShader;
