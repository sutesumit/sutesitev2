import type { DitherStrategy } from '../types';

export class HalftoneStrategy implements DitherStrategy {
  getThreshold(x: number, y: number, _time: number, gridSize: number): number {
    const angle = Math.PI / 4;
    const scale = gridSize * 2;
    const rotX = x * Math.cos(angle) + y * Math.sin(angle);
    const rotY = -x * Math.sin(angle) + y * Math.cos(angle);
    const pattern = (Math.sin(rotX / scale) + Math.sin(rotY / scale) + 2) / 4;
    return pattern;
  }
}
