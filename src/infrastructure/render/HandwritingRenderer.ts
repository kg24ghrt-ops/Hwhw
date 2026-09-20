/**
 * HandwritingRenderer - Canvas-based renderer for handwriting
 * Provides pixel-identical output for both on-screen preview and PNG/SVG export
 * Uses deterministic jitter via JitterSeed for consistent rendering
 */
import type { HandwritingStyle } from '../../domain/entities/HandwritingStyle';
import type { PaperSpec } from '../../domain/entities/Paper';
import { JitterSeed } from '../../domain/value-objects/JitterSeed';

export interface RenderOptions {
  text: string;
  fontFamily: string;
  fontSize: number;
  inkColor: string;
  lineHeight: number;
  contentWidth: number;
  contentHeight: number;
  linesPerPage: number;
  jitterSeed: number;
  handwritingStyle: HandwritingStyle;
  bleedAmount?: number; // Ink bleed effect
}

export interface RenderedPage {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
}

export interface TextMetrics {
  ascent: number;
  descent: number;
  lineSpacing: number;
}

export class HandwritingRenderer {
  private offscreenCanvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private cachedFonts: Map<string, boolean> = new Map();

  constructor() {
    this.offscreenCanvas = document.createElement('canvas');
    const ctx = this.offscreenCanvas.getContext('2d', { 
      alpha: true,
      desynchronized: false,
    });
    if (!ctx) {
      throw new Error('Failed to create 2D context');
    }
    this.ctx = ctx;
  }

  /**
   * Measure text using canvas
   */
  measureText(text: string, font: string): number {
    this.ctx.font = font;
    return this.ctx.measureText(text).width;
  }

  /**
   * Get font metrics (ascent, descent)
   */
  getFontMetrics(font: string): TextMetrics {
    this.ctx.font = font;
    const metrics = this.ctx.measureText('Hxg');
    const ascent = (metrics as TextMetrics & { fontBoundingBoxAscent?: number }).fontBoundingBoxAscent || 0;
    const descent = (metrics as TextMetrics & { fontBoundingBoxDescent?: number }).fontBoundingBoxDescent || 0;
    
    if (ascent > 0) {
      return { 
        ascent, 
        descent: descent || 0.2 * ascent,
        lineSpacing: ascent + descent,
      };
    }
    
    // Fallback
    const fallback = this.ctx.measureText('Hg');
    const a = fallback.actualBoundingBoxAscent || 0;
    const d = fallback.actualBoundingBoxDescent || 0;
    if (a > 0) {
      return { ascent: a * 1.05, descent: d * 1.25, lineSpacing: a + d };
    }
    
    return { ascent: 0.8, descent: 0.2, lineSpacing: 1.0 };
  }

  /**
   * Wrap text into visual lines
   */
  wrapText(
    text: string,
    contentWidth: number,
    font: string
  ): Array<{ text: string; start: number; width: number }> {
    const lines: Array<{ text: string; start: number; width: number }> = [];
    const logicalLines = text.split('\n');
    let globalStart = 0;

    for (const logicalLine of logicalLines) {
      if (logicalLine.length === 0) {
        lines.push({ text: '', start: globalStart, width: 0 });
      } else {
        let start = 0;
        while (start < logicalLine.length) {
          let end = logicalLine.length;
          if (this.measureText(logicalLine.slice(start), font) > contentWidth) {
            end = this.findLongestPrefix(logicalLine, start, contentWidth, font);
            const segment = logicalLine.slice(start, end);
            const lastSpace = segment.lastIndexOf(' ');
            if (lastSpace > 0 && end < logicalLine.length) {
              end = start + lastSpace + 1;
            }
          }
          const segment = logicalLine.slice(start, end);
          lines.push({ 
            text: segment, 
            start: globalStart + start, 
            width: this.measureText(segment, font) 
          });
          start = end;
        }
      }
      globalStart += logicalLine.length + 1;
    }

    if (lines.length === 0) {
      lines.push({ text: '', start: 0, width: 0 });
    }
    return lines;
  }

  private findLongestPrefix(
    line: string,
    start: number,
    contentWidth: number,
    font: string
  ): number {
    let lo = start + 1;
    let hi = line.length;
    let best = start + 1;
    
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (this.measureText(line.slice(start, mid), font) <= contentWidth) {
        best = mid;
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }
    return best;
  }

  /**
   * Render text to canvas with per-character jitter
   * This is the core rendering function used for both preview and export
   */
  renderToCanvas(options: RenderOptions): HTMLCanvasElement {
    const {
      text,
      fontFamily,
      fontSize,
      inkColor,
      lineHeight,
      contentWidth,
      contentHeight,
      jitterSeed,
      handwritingStyle,
      bleedAmount = 0.2,
    } = options;

    // Create canvas at devicePixelRatio * 2 for sharp output
    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    const scale = dpr * 2;
    
    const canvas = document.createElement('canvas');
    canvas.width = Math.ceil(contentWidth * scale);
    canvas.height = Math.ceil(contentHeight * scale);
    
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) {
      throw new Error('Failed to create 2D context');
    }

    // Scale context for high-DPI
    ctx.scale(scale, scale);
    ctx.clearRect(0, 0, contentWidth, contentHeight);

    // Set up font and rendering quality
    const font = `${fontSize}px "${fontFamily}", cursive`;
    ctx.font = font;
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = inkColor;
    
    // Enable high-quality text rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Get font metrics
    const fontMetrics = this.getFontMetrics(font);
    const halfLeading = (lineHeight - fontMetrics.lineSpacing) / 2;
    const baselineOffset = halfLeading + fontMetrics.ascent;

    // Wrap text
    const lines = this.wrapText(text, contentWidth, font);
    
    // Create deterministic jitter
    const jitter = new JitterSeed(jitterSeed);

    // Apply subtle blur for ink bleed effect
    if (bleedAmount > 0) {
      ctx.filter = `blur(${bleedAmount}px)`;
    }

    // Render each line
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex];
      const lineY = lineIndex * lineHeight + baselineOffset;
      
      // Get line-level jitter
      const lineJitter = jitter.getLineJitter(lineIndex, fontSize);
      
      ctx.save();
      
      // Apply line tilt
      ctx.translate(0, lineY);
      ctx.rotate((lineJitter.tilt * Math.PI) / 180);
      ctx.translate(lineJitter.dx, 0);
      ctx.translate(0, -lineY);

      let currentX = 0;

      // Render each character with individual jitter
      for (let charIndex = 0; charIndex < line.text.length; charIndex++) {
        const char = line.text[charIndex];
        const globalCharIndex = line.start + charIndex;
        
        // Get deterministic glyph jitter
        const glyphJitter = jitter.getGlyphJitter(
          globalCharIndex,
          fontSize,
          handwritingStyle.jitterRotation,
          handwritingStyle.jitterBaseline,
          handwritingStyle.jitterOpacity,
          handwritingStyle.jitterScale
        );

        ctx.save();
        
        // Transform to character position
        ctx.translate(currentX + fontSize * 0.5, lineY);
        ctx.rotate((glyphJitter.rotate * Math.PI) / 180);
        ctx.translate(glyphJitter.dx, glyphJitter.dy);
        ctx.scale(glyphJitter.scale, glyphJitter.scale);
        
        // Apply opacity
        ctx.globalAlpha = glyphJitter.opacity;
        
        // Draw character
        ctx.fillText(char, -fontSize * 0.5, 0);
        
        ctx.restore();
        
        // Advance x position
        const charWidth = this.measureText(char, font);
        currentX += charWidth;
      }

      ctx.restore();
    }

    // Reset filter
    ctx.filter = 'none';

    return canvas;
  }

  /**
   * Render to SVG with embedded base64 fonts for self-contained export
   */
  renderToSvg(options: RenderOptions, fontDataUrl?: string): string {
    const {
      text,
      fontFamily,
      fontSize,
      inkColor,
      lineHeight,
      contentWidth,
      contentHeight,
      jitterSeed,
      handwritingStyle,
    } = options;

    const jitter = new JitterSeed(jitterSeed);
    const lines = this.wrapText(text, contentWidth, `${fontSize}px "${fontFamily}"`);
    const fontMetrics = this.getFontMetrics(`${fontSize}px "${fontFamily}"`);
    const halfLeading = (lineHeight - fontMetrics.lineSpacing) / 2;
    const baselineOffset = halfLeading + fontMetrics.ascent;

    let svgContent = '';

    // Add font definition if data URL provided
    if (fontDataUrl) {
      svgContent += `<defs>
        <style type="text/css"><![CDATA[
          @font-face {
            font-family: '${fontFamily}';
            src: url(${fontDataUrl}) format('woff2');
          }
        ]]></style>
      </defs>`;
    }

    // Add text elements with transforms
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex];
      const lineJitter = jitter.getLineJitter(lineIndex, fontSize);
      const lineY = lineIndex * lineHeight + baselineOffset;

      let charElements = '';
      let currentX = 0;

      for (let charIndex = 0; charIndex < line.text.length; charIndex++) {
        const char = line.text[charIndex];
        const globalCharIndex = line.start + charIndex;
        const glyphJitter = jitter.getGlyphJitter(
          globalCharIndex,
          fontSize,
          handwritingStyle.jitterRotation,
          handwritingStyle.jitterBaseline,
          handwritingStyle.jitterOpacity,
          handwritingStyle.jitterScale
        );

        const charWidth = this.measureText(char, `${fontSize}px "${fontFamily}"`);
        
        // Build transform string
        const transform = `translate(${currentX + fontSize * 0.5}, ${lineY}) rotate(${glyphJitter.rotate}) translate(${glyphJitter.dx}, ${glyphJitter.dy}) scale(${glyphJitter.scale})`;
        
        charElements += `<text 
          x="0" 
          y="0" 
          font-family="${fontFamily}" 
          font-size="${fontSize}" 
          fill="${inkColor}" 
          opacity="${glyphJitter.opacity}"
          transform="${transform}"
          text-anchor="middle"
        >${this.escapeXml(char)}</text>`;
        
        currentX += charWidth;
      }

      // Group line with tilt
      svgContent += `<g transform="translate(0, ${lineY}) rotate(${lineJitter.tilt}) translate(${lineJitter.dx}, 0) translate(0, ${-lineY})">
        ${charElements}
      </g>`;
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" 
      width="${contentWidth}" 
      height="${contentHeight}" 
      viewBox="0 0 ${contentWidth} ${contentHeight}">
      ${svgContent}
    </svg>`;
  }

  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * Wait for font to be fully loaded
   */
  async ensureFontLoaded(fontFamily: string, fontSize: number): Promise<void> {
    if (typeof document !== 'undefined' && 'fonts' in document) {
      try {
        await document.fonts.load(`${fontSize}px "${fontFamily}"`);
        await document.fonts.ready;
      } catch {
        // Font may already be loaded
      }
    }
    // Give browser a frame to settle
    await new Promise(resolve => requestAnimationFrame(resolve));
  }
}

// Singleton instance
export const handwritingRenderer = new HandwritingRenderer();
