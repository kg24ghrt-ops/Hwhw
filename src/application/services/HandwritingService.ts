/**
 * HandwritingService - Application service for handwriting operations
 */
import type { HandwritingStyle } from '../../domain/entities/HandwritingStyle';
import type { PaperSpec } from '../../domain/entities/Paper';
import { JitterSeed } from '../../domain/value-objects/JitterSeed';
import { handwritingRenderer, type RenderOptions } from '../../infrastructure/render/HandwritingRenderer';

export interface HandwritingRenderRequest {
  text: string;
  fontFamily: string;
  fontSize: number;
  inkColor: string;
  lineHeight: number;
  contentWidth: number;
  contentHeight: number;
  jitterSeed: number;
  handwritingStyle: HandwritingStyle;
  bleedAmount?: number;
}

export class HandwritingService {
  /**
   * Render handwriting to canvas
   * Uses deterministic jitter for consistent preview/export
   */
  async render(request: HandwritingRenderRequest): Promise<HTMLCanvasElement> {
    // Ensure font is loaded
    await handwritingRenderer.ensureFontLoaded(request.fontFamily, request.fontSize);

    const renderOptions: RenderOptions = {
      text: request.text,
      fontFamily: request.fontFamily,
      fontSize: request.fontSize,
      inkColor: request.inkColor,
      lineHeight: request.lineHeight,
      contentWidth: request.contentWidth,
      contentHeight: request.contentHeight,
      linesPerPage: Math.floor(request.contentHeight / request.lineHeight),
      jitterSeed: request.jitterSeed,
      handwritingStyle: request.handwritingStyle,
      bleedAmount: request.bleedAmount ?? 0.2,
    };

    return handwritingRenderer.renderToCanvas(renderOptions);
  }

  /**
   * Calculate font metrics for layout
   */
  getFontMetrics(fontFamily: string, fontSize: number) {
    return handwritingRenderer.getFontMetrics(`${fontSize}px "${fontFamily}"`);
  }

  /**
   * Wrap text into visual lines
   */
  wrapText(text: string, contentWidth: number, fontFamily: string, fontSize: number) {
    return handwritingRenderer.wrapText(
      text,
      contentWidth,
      `${fontSize}px "${fontFamily}"`
    );
  }

  /**
   * Measure text width
   */
  measureText(text: string, fontFamily: string, fontSize: number): number {
    return handwritingRenderer.measureText(text, `${fontSize}px "${fontFamily}"`);
  }
}

// Singleton instance
export const handwritingService = new HandwritingService();
