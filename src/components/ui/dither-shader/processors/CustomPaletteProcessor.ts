import type { ColorProcessor } from '../types';
import { clamp } from '../utils/colorUtils';

export class CustomPaletteProcessor implements ColorProcessor {
  private palette: [number, number, number][];

  constructor(palette: [number, number, number][]) {
    this.palette = palette;
  }

  process(
    _r: number,
    _g: number,
    _b: number,
    luminance: number,
    ditherThreshold: number
  ): [number, number, number] {
    if (this.palette.length === 2) {
      const shouldBeDark = luminance < ditherThreshold;
      return shouldBeDark ? this.palette[0] : this.palette[1];
    }

    const adjustedLuminance = luminance + (ditherThreshold - 0.5) * 0.5;
    const paletteIndex = Math.floor(
      clamp(adjustedLuminance, 0, 1) * (this.palette.length - 1)
    );
    return this.palette[paletteIndex];
  }
}
