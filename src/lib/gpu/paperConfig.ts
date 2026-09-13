/**
 * A5 Paper Dimensions Constants
 * ISO 216 A5: 148 × 210 mm
 * At 300 DPI: 1748 × 2480 px
 */

export const A5_MM = { w: 148, h: 210 } as const;
export const A5_PX_300 = { w: 1748, h: 2480 } as const;
export const DPI_300 = 300;
export const DPI_DISPLAY = 96;

export interface PaperSize {
  w: number;
  h: number;
}

export interface RenderConfig {
  paperSizeMm: PaperSize;
  paperSizePx: PaperSize;
  dpi: number;
  displayScale: number;
}

export function createA5Config(displayScale: number = 1): RenderConfig {
  return {
    paperSizeMm: { ...A5_MM },
    paperSizePx: { ...A5_PX_300 },
    dpi: DPI_300,
    displayScale,
  };
}

export function mmToPx(mm: number, dpi: number = DPI_300): number {
  return (mm * dpi) / 25.4;
}

export function getPaperAspectRatio(): number {
  return A5_MM.w / A5_MM.h;
}
