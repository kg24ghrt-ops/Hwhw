/**
 * Paper Configuration Legacy - Utility functions
 */
export function mmToPx(mm: number, dpi: number = 96): number {
  return mm * dpi / 25.4;
}

export function getAspectRatio(spec: { widthMm: number; heightMm: number }): number {
  return spec.widthMm / spec.heightMm;
}

export const DEBUG_PAPER_GEOMETRY = false;
