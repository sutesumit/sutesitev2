import type { ColorProcessor } from '../types';

export class DuotoneProcessor implements ColorProcessor {
  private primaryColor: [number, number, number];
  private secondaryColor: [number, number, number];

  constructor(primaryColor: [number, number, number], secondaryColor: [number, number, number]) {
    this.primaryColor = primaryColor;
    this.secondaryColor = secondaryColor;
  }

  process(
    _r: number,
    _g: number,
    _b: number,
    luminance: number,
    ditherThreshold: number
  ): [number, number, number] {
    const shouldBeDark = luminance < ditherThreshold;
    return shouldBeDark ? this.primaryColor : this.secondaryColor;
  }
}
