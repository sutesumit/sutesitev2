import type { DitherStrategy } from '../types';

export class CrosshatchStrategy implements DitherStrategy {
  getThreshold(x: number, y: number, _time: number, gridSize: number): number {
    const line1 = (x + y) % (gridSize * 2) < gridSize ? 1 : 0;
    const line2 = (x - y + gridSize * 4) % (gridSize * 2) < gridSize ? 1 : 0;
    return (line1 + line2) / 2;
  }
}
