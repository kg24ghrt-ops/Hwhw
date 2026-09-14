/**
 * Export utilities for Notebook
 * Supports PNG export of single pages or all pages
 */

import type { PaperSpec } from './paperConfig';
import type { VisualLine } from './handwriting';

export interface ExportOptions {
  scale?: number;        // DPI scale factor (default: 2 for print quality)
  format?: 'png' | 'jpeg';
  quality?: number;      // JPEG quality (0-1), ignored for PNG
  includeMargins?: boolean;
}

export interface PageRenderData {
  spec: PaperSpec;
  width: number;
  height: number;
  lines: VisualLine[];
  inkColor: string;
  fontFamily: string;
  fontWeight: number;
  fontSize: number;
  lineSpacing: number;
  baselineDrop: number;
  agePreset: string;
}

/**
 * Render a single page to a canvas
 */
export async function renderPageToCanvas(
  pageData: PageRenderData,
  options: ExportOptions = {}
): Promise<HTMLCanvasElement> {
  const {
    spec,
    width,
    height,
    lines,
    inkColor,
    fontFamily,
    fontWeight,
    fontSize,
    lineSpacing,
    baselineDrop,
    agePreset,
  } = pageData;

  const scale = options.scale ?? 2;
  const canvas = document.createElement('canvas');
  canvas.width = Math.floor(width * scale);
  canvas.height = Math.floor(height * scale);
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Could not get 2D context');
  }

  // Scale context for high-DPI output
  ctx.scale(scale, scale);

  // Draw paper background with aging
  await drawPaperBackground(ctx, width, height, spec, agePreset);

  // Draw ruling lines
  drawRuling(ctx, spec, width, height, lineSpacing);

  // Draw text lines
  drawTextLines(ctx, lines, fontFamily, fontWeight, fontSize, lineSpacing, baselineDrop, inkColor);

  return canvas;
}

/**
 * Draw paper background with aging effects
 */
async function drawPaperBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  spec: PaperSpec,
  agePreset: string
): Promise<void> {
  // Base paper tone
  ctx.fillStyle = spec.paperTone;
  ctx.fillRect(0, 0, width, height);

  // Apply aging overlay based on preset
  const agingColor = getAgingColor(agePreset);
  if (agingColor) {
    ctx.fillStyle = agingColor;
    ctx.globalAlpha = getAgingIntensity(agePreset);
    ctx.fillRect(0, 0, width, height);
    ctx.globalAlpha = 1.0;
  }

  // Add subtle noise texture
  addNoiseTexture(ctx, width, height, agePreset);

  // Add edge darkening / vignette
  addEdgeDarkening(ctx, width, height, agePreset);
}

/**
 * Get aging color based on preset
 */
function getAgingColor(agePreset: string): string {
  const colors: Record<string, string> = {
    new: 'transparent',
    slightly_used: '#f5e8d0',
    aged: '#e8d0a8',
    vintage: '#d8b880',
    old_parchment: '#c8a870',
    antique: '#b09060',
  };
  return colors[agePreset] || 'transparent';
}

/**
 * Get aging intensity based on preset
 */
function getAgingIntensity(agePreset: string): number {
  const intensities: Record<string, number> = {
    new: 0,
    slightly_used: 0.15,
    aged: 0.35,
    vintage: 0.6,
    old_parchment: 0.8,
    antique: 1.0,
  };
  return intensities[agePreset] || 0;
}

/**
 * Add noise texture to canvas
 */
function addNoiseTexture(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  agePreset: string
): void {
  const noiseIntensity = getNoiseIntensity(agePreset);
  if (noiseIntensity <= 0) return;

  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * noiseIntensity * 50;
    data[i] = Math.min(255, Math.max(0, data[i] + noise));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
  }

  ctx.putImageData(imageData, 0, 0);
}

function getNoiseIntensity(agePreset: string): number {
  const intensities: Record<string, number> = {
    new: 0.02,
    slightly_used: 0.03,
    aged: 0.05,
    vintage: 0.08,
    old_parchment: 0.12,
    antique: 0.15,
  };
  return intensities[agePreset] || 0.02;
}

/**
 * Add edge darkening (vignette effect)
 */
function addEdgeDarkening(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  agePreset: string
): void {
  const intensity = getEdgeDarkeningIntensity(agePreset);
  if (intensity <= 0) return;

  const gradient = ctx.createRadialGradient(
    width / 2,
    height / 2,
    Math.min(width, height) * 0.3,
    width / 2,
    height / 2,
    Math.max(width, height) * 0.7
  );

  gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
  gradient.addColorStop(1, `rgba(60, 50, 40, ${intensity})`);

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

function getEdgeDarkeningIntensity(agePreset: string): number {
  const intensities: Record<string, number> = {
    new: 0.03,
    slightly_used: 0.04,
    aged: 0.06,
    vintage: 0.08,
    old_parchment: 0.12,
    antique: 0.15,
  };
  return intensities[agePreset] || 0.03;
}

/**
 * Draw ruling lines
 */
function drawRuling(
  ctx: CanvasRenderingContext2D,
  spec: PaperSpec,
  width: number,
  height: number,
  lineSpacing: number
): void {
  ctx.save();

  // Horizontal ruling lines
  ctx.strokeStyle = spec.ruling.lineColor;
  ctx.globalAlpha = spec.ruling.lineOpacity;
  ctx.lineWidth = spec.ruling.lineWidthMm * (96 / 25.4); // Convert mm to px at 96 DPI

  const marginTop = spec.marginMm * (96 / 25.4);
  const marginBottom = spec.marginMm * (96 / 25.4);

  for (let y = marginTop; y < height - marginBottom; y += lineSpacing) {
    ctx.beginPath();
    ctx.moveTo(spec.marginMm * (96 / 25.4), y);
    ctx.lineTo(width - spec.marginMm * (96 / 25.4), y);
    ctx.stroke();
  }

  // Margin line
  ctx.strokeStyle = spec.ruling.marginColor;
  ctx.globalAlpha = spec.ruling.marginOpacity;
  ctx.lineWidth = spec.ruling.marginWidthMm * (96 / 25.4);

  const marginX = spec.marginMm * (96 / 25.4);
  ctx.beginPath();
  ctx.moveTo(marginX, marginTop);
  ctx.lineTo(marginX, height - marginBottom);
  ctx.stroke();

  ctx.restore();
}

/**
 * Draw text lines
 */
function drawTextLines(
  ctx: CanvasRenderingContext2D,
  lines: VisualLine[],
  fontFamily: string,
  fontWeight: number,
  fontSize: number,
  lineSpacing: number,
  baselineDrop: number,
  inkColor: string
): void {
  ctx.save();

  ctx.font = `${fontWeight} ${fontSize}px "${fontFamily}", cursive`;
  ctx.fillStyle = inkColor;
  ctx.textBaseline = 'top';

  for (const line of lines) {
    const y = lineSpacing * (lines.indexOf(line)) + baselineDrop;
    ctx.fillText(line.text, 0, y);
  }

  ctx.restore();
}

/**
 * Export canvas to blob
 */
export function canvasToBlob(
  canvas: HTMLCanvasElement,
  format: 'png' | 'jpeg' = 'png',
  quality: number = 0.92
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create blob'));
        }
      },
      `image/${format}`,
      quality
    );
  });
}

/**
 * Download canvas as file
 */
export function downloadCanvas(
  canvas: HTMLCanvasElement,
  filename: string,
  format: 'png' | 'jpeg' = 'png',
  quality: number = 0.92
): void {
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL(`image/${format}`, quality);
  link.click();
}

/**
 * Export all pages as individual PNG files
 */
export async function exportAllPages(
  pages: PageRenderData[],
  options: ExportOptions = {}
): Promise<void> {
  const format = options.format ?? 'png';
  const quality = options.quality ?? 0.92;

  for (let i = 0; i < pages.length; i++) {
    const canvas = await renderPageToCanvas(pages[i], options);
    const pageLabel = String(i + 1).padStart(3, '0');
    downloadCanvas(canvas, `page-${pageLabel}.${format}`, format, quality);

    // Small delay to avoid overwhelming the browser
    if (i < pages.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
}

/**
 * Export single page as PNG
 */
export async function exportSinglePage(
  pageData: PageRenderData,
  filename: string,
  options: ExportOptions = {}
): Promise<void> {
  const format = options.format ?? 'png';
  const quality = options.quality ?? 0.92;

  const canvas = await renderPageToCanvas(pageData, options);
  downloadCanvas(canvas, filename, format, quality);
}

/**
 * Create a ZIP of all pages (requires JSZip or similar)
 * For now, we'll just download individual files
 * Future enhancement: bundle into a single downloadable archive
 */
export async function exportAsArchive(
  pages: PageRenderData[],
  baseFilename: string,
  options: ExportOptions = {}
): Promise<void> {
  // Simple implementation: download each page with sequential names
  const format = options.format ?? 'png';
  
  for (let i = 0; i < pages.length; i++) {
    const canvas = await renderPageToCanvas(pages[i], options);
    const pageLabel = String(i + 1).padStart(3, '0');
    const filename = `${baseFilename}-page-${pageLabel}.${format}`;
    downloadCanvas(canvas, filename, format, options.quality ?? 0.92);

    if (i < pages.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
}
