import type { ColorProcessor } from '../types';

export class GrayscaleProcessor implements ColorProcessor {
  process(
    _r: number,
    _g: number,
    _b: number,
    luminance: number,
    ditherThreshold: number
  ): [number, number, number] {
    const shouldBeDark = luminance < ditherThreshold;
    return shouldBeDark ? [0, 0, 0] : [255, 255, 255];
  }
}
