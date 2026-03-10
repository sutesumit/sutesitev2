import type { ColorProcessor } from '../types';
import { clamp } from '../utils/colorUtils';

export class OriginalProcessor implements ColorProcessor {
  process(
    r: number,
    g: number,
    b: number,
    _luminance: number,
    ditherThreshold: number
  ): [number, number, number] {
    const ditherAmount = ditherThreshold - 0.5;
    const adjustedR = clamp(r + ditherAmount * 64, 0, 255);
    const adjustedG = clamp(g + ditherAmount * 64, 0, 255);
    const adjustedB = clamp(b + ditherAmount * 64, 0, 255);

    const levels = 4;
    return [
      Math.round(adjustedR / (255 / levels)) * (255 / levels),
      Math.round(adjustedG / (255 / levels)) * (255 / levels),
      Math.round(adjustedB / (255 / levels)) * (255 / levels),
    ];
  }
}
