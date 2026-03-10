import type { ColorMode, ColorProcessor } from '../types';
import { GrayscaleProcessor } from './GrayscaleProcessor';
import { DuotoneProcessor } from './DuotoneProcessor';
import { CustomPaletteProcessor } from './CustomPaletteProcessor';
import { OriginalProcessor } from './OriginalProcessor';

export function getColorProcessor(
  mode: ColorMode,
  primaryColor?: [number, number, number],
  secondaryColor?: [number, number, number],
  customPalette?: [number, number, number][]
): ColorProcessor {
  switch (mode) {
    case 'grayscale':
      return new GrayscaleProcessor();
    case 'duotone':
      return new DuotoneProcessor(
        primaryColor ?? [0, 0, 0],
        secondaryColor ?? [255, 255, 255]
      );
    case 'custom':
      return new CustomPaletteProcessor(customPalette ?? [[0, 0, 0], [255, 255, 255]]);
    case 'original':
    default:
      return new OriginalProcessor();
  }
}

export { GrayscaleProcessor, DuotoneProcessor, CustomPaletteProcessor, OriginalProcessor };
