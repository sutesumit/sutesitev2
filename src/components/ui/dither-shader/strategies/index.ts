import type { DitheringMode, DitherStrategy } from '../types';
import { BayerStrategy } from './BayerStrategy';
import { HalftoneStrategy } from './HalftoneStrategy';
import { NoiseStrategy } from './NoiseStrategy';
import { CrosshatchStrategy } from './CrosshatchStrategy';

const strategies: Record<DitheringMode, DitherStrategy> = {
  bayer: new BayerStrategy(),
  halftone: new HalftoneStrategy(),
  noise: new NoiseStrategy(),
  crosshatch: new CrosshatchStrategy(),
};

export function getDitherStrategy(mode: DitheringMode): DitherStrategy {
  return strategies[mode] ?? strategies.bayer;
}

export { BayerStrategy, HalftoneStrategy, NoiseStrategy, CrosshatchStrategy };
