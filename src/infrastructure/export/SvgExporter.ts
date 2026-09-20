/**
 * SvgExporter - SVG export with embedded base64 fonts
 * Produces self-contained SVG files that render identically across platforms
 */
import { handwritingRenderer } from '../render/HandwritingRenderer';
import type { RenderOptions } from '../render/HandwritingRenderer';
import type { PaperSpec } from '../../../domain/entities/Paper';

export interface SvgExportResult {
  ok: true;
  svgContent: string;
  filename: string;
} | {
  ok: false;
  error: string;
};

export interface SvgExportOptions {
  filenameBase?: string;
  embedFont?: boolean; // Embed font as base64 in SVG
  onProgress?: (message: string) => void;
}

export class SvgExporter {
  /**
   * Export rendered handwriting to SVG
   * Fonts can be embedded as base64 for self-contained files
   */
  async export(
    renderOptions: RenderOptions,
    paperSpec: PaperSpec,
    options: SvgExportOptions = {}
  ): Promise<SvgExportResult> {
    const { filenameBase = 'notebook', embedFont = true } = options;
    
    try {
      // Ensure font is loaded
      await handwritingRenderer.ensureFontLoaded(
        renderOptions.fontFamily,
        renderOptions.fontSize
      );

      // Get font data URL if embedding
      let fontDataUrl: string | undefined;
      if (embedFont) {
        fontDataUrl = await this.getFontDataUrl(renderOptions.fontFamily);
      }

      // Generate SVG content
      const svgContent = handwritingRenderer.renderToSvg(renderOptions, fontDataUrl);
      
      // Wrap with paper background
      const fullSvg = this.wrapWithPaperBackground(svgContent, paperSpec.paperTone);

      // Generate filename with timestamp
      const timestamp = new Date().toISOString()
        .replace(/[:.]/g, '-')
        .slice(0, -5);
      const filename = `${filenameBase}-${timestamp}.svg`;

      return { ok: true, svgContent: fullSvg, filename };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      return { ok: false, error: `SVG export failed: ${msg}` };
    }
  }

  /**
   * Fetch font as base64 data URL
   */
  private async getFontDataUrl(fontFamily: string): Promise<string> {
    const fontUrls: Record<string, string> = {
      'Caveat': 'https://fonts.gstatic.com/s/caveat/v21/WwkgxXt8j6w5KCXGqU7c3Z8.woff2',
      'Kalam': 'https://fonts.gstatic.com/s/kalam/v16/YzJL3eiUYVnT9vOQ5g.woff2',
      'Patrick Hand': 'https://fonts.gstatic.com/s/patrickhand/v18/LDI1apSQOAYtSuYWp8ZhfYe.woff2',
      'Shadows Into Light': 'https://fonts.gstatic.com/s/shadowsintolight/v16/UqyNK9UOIntux_czAvDQx_Zc.woff2',
      'Homemade Apple': 'https://fonts.gstatic.com/s/homemadeapple/v18/Qw3GZQ5IiCsBjReF5A.woff2',
      'La Belle Aurore': 'https://fonts.gstatic.com/s/labelleaurore/v15/RrQIbo8w-YHhMn.woff2',
    };

    const url = fontUrls[fontFamily];
    if (!url) {
      console.warn(`No font URL configured for ${fontFamily}`);
      return '';
    }

    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      const base64 = this.arrayBufferToBase64(arrayBuffer);
      return `data:font/woff2;base64,${base64}`;
    } catch (error) {
      console.warn(`Failed to fetch font ${fontFamily}:`, error);
      return '';
    }
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Wrap SVG content with paper background rectangle
   */
  private wrapWithPaperBackground(svgContent: string, paperColor: string): string {
    // Extract viewBox from inner SVG
    const viewBoxMatch = svgContent.match(/viewBox="([^"]+)"/);
    const viewBox = viewBoxMatch ? viewBoxMatch[1] : '0 0 800 600';
    
    return `<svg xmlns="http://www.w3.org/2000/svg" 
      width="${viewBox.split(' ')[2]}" 
      height="${viewBox.split(' ')[3]}" 
      viewBox="${viewBox}">
      <rect width="100%" height="100%" fill="${paperColor}"/>
      ${svgContent.replace(/<svg[^>]*>(.*)<\/svg>/s, '$1')}
    </svg>`;
  }

  /**
   * Trigger download of SVG file
   */
  triggerDownload(svgContent: string, filename: string): void {
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
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
export const svgExporter = new SvgExporter();
