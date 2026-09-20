/**
 * Handwriting Service
 * Manages handwriting rendering with deterministic jitter
 */
import type { JitterSeed } from '../../domain/value-objects/JitterSeed';
import type { HandwritingRenderer, RenderConfig } from '../../infrastructure/render/HandwritingRenderer';

export interface HandwritingOptions {
  fontFamily: string;
  fontSize: number;
  inkColor: string;
  lineSpacing: number;
  contentWidth: number;
}

export class HandwritingService {
  constructor(private renderer: HandwritingRenderer) {}

  /**
   * Calculate glyph jitter deterministically based on seed
   */
  calculateGlyphJitter(index: number, seed: JitterSeed, fontSize: number): {
    rotation: number;
    dx: number;
    dy: number;
    scale: number;
    opacity: number;
  } {
    const r = (salt: number) => seed.randomAt(index, salt);
    
    // Per-character jitter: rotation ±0.5deg, baseline ±1px, opacity 0.92–1.0
    return {
      rotation: (r(1) - 0.5) * 1.0, // ±0.5 degrees
      dx: (r(2) - 0.5) * fontSize * 0.05,
      dy: (r(3) - 0.5) * fontSize * 0.083, // ±1px at ~12px font
      scale: 0.96 + r(4) * 0.08,
      opacity: 0.78 + r(5) * 0.22,
    };
  }

  /**
   * Calculate line-level decoration
   */
  calculateLineDecoration(lineIndex: number, seed: JitterSeed, fontSize: number): {
    tilt: number;
    dx: number;
  } {
    const r = (salt: number) => seed.randomAt(lineIndex * 1000 + salt, 0);
    return {
      tilt: (r(1) - 0.5) * 0.7,
      dx: (r(2) - 0.5) * fontSize * 0.05,
    };
  }

  /**
   * Prepare render configuration
   */
  createRenderConfig(
    text: string,
    options: HandwritingOptions,
    jitterSeed: JitterSeed,
    paperSpec: { isDark: boolean },
    baselineDrop: number,
  ): RenderConfig {
    return {
      text,
      fontFamily: options.fontFamily,
      fontSize: options.fontSize,
      inkColor: options.inkColor,
      jitterSeed,
      paperSpec: { ...paperSpec } as any,
      lineSpacing: options.lineSpacing,
      contentWidth: options.contentWidth,
      baselineDrop,
      halfLeading: 0,
    };
  }

  /**
   * Render handwriting to the canvas
   */
  renderToCanvas(config: RenderConfig): void {
    this.renderer.renderAndDraw(config);
  }

  /**
   * Export rendered handwriting as PNG
   */
  async exportAsPng(scale: number = 2): Promise<Blob> {
    return this.renderer.exportPng(scale);
  }

  /**
   * Export rendered handwriting as SVG
   */
  async exportAsSvg(config: RenderConfig, fontDataUrl?: string): Promise<string> {
    return this.renderer.exportSvg(config, fontDataUrl);
  }

  getRenderer(): HandwritingRenderer {
    return this.renderer;
  }
}
