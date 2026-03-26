import type { DitherStrategy } from '../types';

export class NoiseStrategy implements DitherStrategy {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getThreshold(x: number, y: number, time: number, _gridSize: number): number {
    const noiseVal = Math.sin(x * 12.9898 + y * 78.233 + time * 100) * 43758.5453;
    return noiseVal - Math.floor(noiseVal);
  }
}
