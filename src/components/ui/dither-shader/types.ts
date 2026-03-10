export type DitheringMode = "bayer" | "halftone" | "noise" | "crosshatch";
export type ColorMode = "original" | "grayscale" | "duotone" | "custom";

export interface DitherStrategy {
  getThreshold(x: number, y: number, time: number, gridSize: number): number;
}

export interface ColorProcessor {
  process(
    r: number,
    g: number,
    b: number,
    luminance: number,
    ditherThreshold: number
  ): [number, number, number];
}

export interface DitherShaderProps {
  src: string;
  gridSize?: number;
  ditherMode?: DitheringMode;
  colorMode?: ColorMode;
  invert?: boolean;
  pixelRatio?: number;
  primaryColor?: string;
  secondaryColor?: string;
  customPalette?: string[];
  brightness?: number;
  contrast?: number;
  backgroundColor?: string;
  objectFit?: "cover" | "contain" | "fill" | "none";
  threshold?: number;
  animated?: boolean;
  animationSpeed?: number;
  className?: string;
}
