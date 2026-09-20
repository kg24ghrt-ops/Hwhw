/**
 * Handwriting Renderer (Canvas-based)
 * Renders handwriting with per-character jitter to a canvas
 * Used for both on-screen preview and PNG/SVG export - pixel-identical output
 */
import type { JitterSeed } from '../../domain/value-objects/JitterSeed';
import type { PaperSpec } from '../../domain/entities/Paper';

export interface GlyphMetrics {
  x: number;
  y: number;
  rotation: number;
  dx: number;
  dy: number;
  scale: number;
  opacity: number;
  width: number;
}

export interface RenderConfig {
  text: string;
  fontFamily: string;
  fontSize: number;
  inkColor: string;
  jitterSeed: JitterSeed;
  paperSpec: PaperSpec;
  lineSpacing: number;
  contentWidth: number;
  baselineDrop: number;
  halfLeading: number;
}

export interface RenderedLine {
  text: string;
  start: number;
  glyphs: GlyphMetrics[];
  baselineY: number;
}

export class HandwritingRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private cachedFont: string | null = null;

  constructor(canvas?: HTMLCanvasElement) {
    if (canvas) {
      this.canvas = canvas;
    } else {
      this.canvas = document.createElement('canvas');
    }
    const ctx = this.canvas.getContext('2d', { alpha: true, desynchronized: false });
    if (!ctx) throw new Error('Failed to get 2D context');
    this.ctx = ctx;
  }

  /**
   * Set canvas size with device pixel ratio support
   */
  setSize(width: number, height: number, dpr: number = 1): void {
    const physicalWidth = Math.floor(width * dpr);
    const physicalHeight = Math.floor(height * dpr);
    
    if (this.canvas.width !== physicalWidth || this.canvas.height !== physicalHeight) {
      this.canvas.width = physicalWidth;
      this.canvas.height = physicalHeight;
      this.canvas.style.width = `${width}px`;
      this.canvas.style.height = `${height}px`;
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }

  /**
   * Measure text width using canvas
   */
  measureText(text: string, font: string): number {
    if (this.cachedFont !== font) {
      this.ctx.font = font;
      this.cachedFont = font;
    }
    return this.ctx.measureText(text).width;
  }

  /**
   * Get font metrics (ascent/descent)
   */
  getFontMetrics(font: string): { ascent: number; descent: number } {
    if (this.cachedFont !== font) {
      this.ctx.font = font;
      this.cachedFont = font;
    }
    
    const m = this.ctx.measureText('Hxg');
    const ascent = (m as TextMetrics & { fontBoundingBoxAscent?: number }).fontBoundingBoxAscent;
    const descent = (m as TextMetrics & { fontBoundingBoxDescent?: number }).fontBoundingBoxDescent;
    
    if (typeof ascent === 'number' && isFinite(ascent) && ascent > 0) {
      return { ascent, descent: descent ?? 0.2 * ascent };
    }
    
    const fallback = this.ctx.measureText('Hg');
    const a = fallback.actualBoundingBoxAscent || 0;
    const d = fallback.actualBoundingBoxDescent || 0;
    if (a > 0) return { ascent: a * 1.05, descent: d * 1.25 };
    
    return { ascent: 0.8 * parseFloat(font), descent: 0.2 * parseFloat(font) };
  }

  /**
   * Wrap text into lines that fit within content width
   */
  wrapText(text: string, contentWidth: number, font: string): { text: string; start: number; width: number }[] {
    const lines: { text: string; start: number; width: number }[] = [];
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

    if (lines.length === 0) lines.push({ text: '', start: 0, width: 0 });
    return lines;
  }

  private findLongestPrefix(line: string, start: number, contentWidth: number, font: string): number {
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
   * Calculate glyph jitter deterministically based on seed
   */
  calculateGlyphJitter(index: number, seed: JitterSeed, fontSize: number): GlyphMetrics {
    const r = (salt: number) => seed.randomAt(index, salt);
    
    // Per-character jitter: rotation ±0.5deg, baseline ±1px, opacity 0.92–1.0
    const rotate = (r(1) - 0.5) * 1.0; // ±0.5 degrees
    const dx = (r(2) - 0.5) * fontSize * 0.05;
    const dy = (r(3) - 0.5) * fontSize * 0.083; // ±1px at ~12px font
    const scale = 0.96 + r(4) * 0.08;
    const opacity = 0.78 + r(5) * 0.22;

    return {
      x: 0,
      y: 0,
      rotation: rotate,
      dx,
      dy,
      scale,
      opacity,
      width: 0,
    };
  }

  /**
   * Calculate line-level decoration
   */
  calculateLineDecoration(lineIndex: number, seed: JitterSeed, fontSize: number): { tilt: number; dx: number } {
    const r = (salt: number) => seed.randomAt(lineIndex * 1000 + salt, 0);
    return {
      tilt: (r(1) - 0.5) * 0.7,
      dx: (r(2) - 0.5) * fontSize * 0.05,
    };
  }

  /**
   * Render text to canvas with jitter
   */
  render(config: RenderConfig): { lines: RenderedLine[]; totalHeight: number } {
    const { text, fontFamily, fontSize, inkColor, jitterSeed, lineSpacing, contentWidth, baselineDrop } = config;
    
    const font = `${fontSize}px "${fontFamily}", cursive`;
    const wrappedLines = this.wrapText(text, contentWidth, font);
    const fontMetrics = this.getFontMetrics(font);
    const halfLeading = (lineSpacing - (fontMetrics.ascent + fontMetrics.descent)) / 2;
    
    const renderedLines: RenderedLine[] = [];
    
    for (let lineIdx = 0; lineIdx < wrappedLines.length; lineIdx++) {
      const wrappedLine = wrappedLines[lineIdx];
      const decoration = this.calculateLineDecoration(lineIdx, jitterSeed, fontSize);
      const baselineY = lineIdx * lineSpacing + baselineDrop;
      
      const glyphs: GlyphMetrics[] = [];
      let currentX = 0;
      
      for (let charIdx = 0; charIdx < wrappedLine.text.length; charIdx++) {
        const char = wrappedLine.text[charIdx];
        const glyphJitter = this.calculateGlyphJitter(wrappedLine.start + charIdx, jitterSeed, fontSize);
        const charWidth = this.measureText(char, font);
        
        glyphs.push({
          ...glyphJitter,
          x: currentX,
          y: baselineY,
          width: charWidth,
        });
        
        currentX += charWidth;
      }
      
      renderedLines.push({
        text: wrappedLine.text,
        start: wrappedLine.start,
        glyphs,
        baselineY,
      });
    }
    
    const totalHeight = renderedLines.length * lineSpacing;
    return { lines: renderedLines, totalHeight };
  }

  /**
   * Draw rendered lines to canvas
   */
  draw(lines: RenderedLine[], config: RenderConfig): void {
    const { fontFamily, fontSize, inkColor, jitterSeed } = config;
    const font = `${fontSize}px "${fontFamily}", cursive`;
    
    this.ctx.save();
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Apply ink effects
    this.ctx.filter = `drop-shadow(0 0 ${config.paperSpec.isDark ? '0.3px' : '0.2px'} rgba(0,0,0,0.25)) blur(${config.paperSpec.isDark ? '0.2px' : '0.15px'})`;
    this.ctx.fillStyle = inkColor;
    this.ctx.font = font;
    this.ctx.textBaseline = 'alphabetic';
    
    for (const line of lines) {
      for (const glyph of line.glyphs) {
        this.ctx.save();
        
        // Apply transforms
        this.ctx.translate(glyph.x + glyph.dx + fontSize / 2, glyph.y + glyph.dy);
        this.ctx.rotate((glyph.rotation * Math.PI) / 180);
        this.ctx.scale(glyph.scale, glyph.scale);
        this.ctx.globalAlpha = glyph.opacity;
        
        // Draw character
        const char = line.text[glyph.start - line.start + line.glyphs.indexOf(glyph)];
        if (char) {
          this.ctx.fillText(char, -glyph.width / 2, 0);
        }
        
        this.ctx.restore();
      }
    }
    
    this.ctx.restore();
  }

  /**
   * Full render and draw in one call
   */
  renderAndDraw(config: RenderConfig): void {
    const { lines } = this.render(config);
    this.draw(lines, config);
  }

  /**
   * Export canvas as PNG blob
   */
  async exportPng(scale: number = 2): Promise<Blob> {
    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    const exportScale = scale * dpr;
    
    // Create a temporary canvas for export at higher resolution
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = this.canvas.width * exportScale;
    exportCanvas.height = this.canvas.height * exportScale;
    
    const exportCtx = exportCanvas.getContext('2d');
    if (!exportCtx) throw new Error('Failed to get export context');
    
    // Scale up and draw
    exportCtx.scale(exportScale, exportScale);
    exportCtx.drawImage(this.canvas, 0, 0);
    
    return new Promise((resolve, reject) => {
      exportCanvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to create PNG blob'));
      }, 'image/png');
    });
  }

  /**
   * Export as SVG with embedded fonts
   */
  async exportSvg(config: RenderConfig, fontDataUrl?: string): Promise<string> {
    const { lines, totalHeight } = this.render(config);
    const { fontFamily, fontSize, inkColor, contentWidth, lineSpacing } = config;
    
    const svgParts: string[] = [
      `<?xml version="1.0" encoding="UTF-8"?>`,
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${contentWidth} ${totalHeight}" width="${contentWidth}" height="${totalHeight}">`,
      `<defs>`,
      `<style type="text/css"><![CDATA[`,
      `@font-face { font-family: '${fontFamily}'; src: url('${fontDataUrl || ''}') format('woff2'); }`,
      `.ink { fill: ${inkColor}; filter: drop-shadow(0 0 0.2px rgba(0,0,0,0.25)); }`,
      `]]></style>`,
      `</defs>`,
    ];
    
    for (const line of lines) {
      for (const glyph of line.glyphs) {
        const char = line.text[line.glyphs.indexOf(glyph)];
        if (!char) continue;
        
        const transform = `translate(${glyph.x + glyph.dx}, ${glyph.y + glyph.dy}) rotate(${glyph.rotation}) scale(${glyph.scale})`;
        svgParts.push(
          `<text class="ink" x="${glyph.x + glyph.dx}" y="${glyph.y + glyph.dy}" ` +
          `transform="${transform}" opacity="${glyph.opacity}" font-family="${fontFamily}" font-size="${fontSize}">${escapeXml(char)}</text>`
        );
      }
    }
    
    svgParts.push('</svg>');
    return svgParts.join('\n');
  }

  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  getContext(): CanvasRenderingContext2D {
    return this.ctx;
  }
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
