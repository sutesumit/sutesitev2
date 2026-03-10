import type { DitherStrategy } from '../types';

const BAYER_MATRIX_4x4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

const BAYER_MATRIX_8x8 = [
  [0, 32, 8, 40, 2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44, 4, 36, 14, 46, 6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [3, 35, 11, 43, 1, 33, 9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47, 7, 39, 13, 45, 5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21],
];

export class BayerStrategy implements DitherStrategy {
  getThreshold(x: number, y: number, _time: number, gridSize: number): number {
    const matrixSize = gridSize <= 4 ? 4 : 8;
    const bayerMatrix = gridSize <= 4 ? BAYER_MATRIX_4x4 : BAYER_MATRIX_8x8;
    const matrixScale = matrixSize === 4 ? 16 : 64;
    const matrixX = Math.floor(x / gridSize) % matrixSize;
    const matrixY = Math.floor(y / gridSize) % matrixSize;
    return bayerMatrix[matrixY][matrixX] / matrixScale;
  }
}
