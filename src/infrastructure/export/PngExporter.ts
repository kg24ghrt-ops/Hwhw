/**
 * PngExporter - Canvas-based PNG export
 * Uses the same HandwritingRenderer for pixel-identical output
 */
import { handwritingRenderer } from '../render/HandwritingRenderer';
import type { RenderOptions } from '../render/HandwritingRenderer';
import type { HandwritingStyle } from '../../../domain/entities/HandwritingStyle';
import type { PaperSpec } from '../../../domain/entities/Paper';

export interface PngExportSuccess {
  ok: true;
  blob: Blob;
  filename: string;
}

export interface PngExportFailure {
  ok: false;
  error: string;
}

export type PngExportResult = PngExportSuccess | PngExportFailure;

export interface PngExportOptions {
  filenameBase?: string;
  scale?: number; // Multiplier for output resolution
  onProgress?: (message: string) => void;
}

export class PngExporter {
  /**
   * Export rendered handwriting to PNG
   * Uses canvas.toBlob() for efficient encoding
   */
  async export(
    renderOptions: RenderOptions,
    paperSpec: PaperSpec,
    options: PngExportOptions = {}
  ): Promise<PngExportResult> {
    const { filenameBase = 'notebook', scale = 1 } = options;
    
    try {
      // Ensure font is loaded
      await handwritingRenderer.ensureFontLoaded(
        renderOptions.fontFamily,
        renderOptions.fontSize
      );

      // Render to canvas
      const canvas = handwritingRenderer.renderToCanvas(renderOptions);
      
      // Apply paper background color
      const compositeCanvas = document.createElement('canvas');
      const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
      const finalScale = scale * dpr * 2;
      
      compositeCanvas.width = Math.ceil(renderOptions.contentWidth * finalScale);
      compositeCanvas.height = Math.ceil(renderOptions.contentHeight * finalScale);
      
      const ctx = compositeCanvas.getContext('2d');
      if (!ctx) {
        throw new Error('Failed to create composite canvas context');
      }

      // Draw paper background
      ctx.fillStyle = paperSpec.paperTone;
      ctx.fillRect(0, 0, compositeCanvas.width, compositeCanvas.height);
      
      // Draw rendered text at high DPI
      ctx.drawImage(
        canvas,
        0, 0,
        compositeCanvas.width,
        compositeCanvas.height
      );

      // Convert to blob
      const blob: Blob | null = await new Promise((resolve) => {
        compositeCanvas.toBlob(resolve, 'image/png', 1.0);
      });

      if (!blob) {
        return { ok: false, error: 'Failed to generate PNG data' };
      }

      // Generate filename with timestamp
      const timestamp = new Date().toISOString()
        .replace(/[:.]/g, '-')
        .slice(0, -5);
      const filename = `${filenameBase}-${timestamp}.png`;

      return { ok: true, blob, filename };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      return { ok: false, error: `Export failed: ${msg}` };
    }
  }

  /**
   * Trigger download of PNG blob
   */
  triggerDownload(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(url);
      a.remove();
    }, 1000);
  }
}

// Singleton instance
export const pngExporter = new PngExporter();
