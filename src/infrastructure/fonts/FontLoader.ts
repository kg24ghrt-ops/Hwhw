/**
 * FontLoader - Infrastructure service for loading web fonts via FontFace API
 * Ensures fonts are fully loaded before rendering
 */
export interface FontFaceInfo {
  family: string;
  url: string;
  weight?: string;
  style?: string;
}

export class FontLoader {
  private loadedFonts: Set<string> = new Set();
  private loadPromises: Map<string, Promise<void>> = new Map();

  /**
   * Register and load a font face
   */
  async loadFont(family: string, url: string, weight = '400', style = 'normal'): Promise<void> {
    const key = `${family}-${weight}-${style}`;
    
    if (this.loadedFonts.has(key)) {
      return;
    }

    const existing = this.loadPromises.get(key);
    if (existing) {
      return existing;
    }

    const promise = (async () => {
      try {
        const fontFace = new FontFace(family, `url(${url})`, {
          weight,
          style,
          display: 'swap',
        });
        
        await fontFace.load();
        document.fonts.add(fontFace);
        this.loadedFonts.add(key);
      } catch (error) {
        console.warn(`Failed to load font ${family}:`, error);
      }
    })();

    this.loadPromises.set(key, promise);
    return promise;
  }

  /**
   * Load multiple fonts from Google Fonts
   */
  async loadGoogleFonts(fonts: string[]): Promise<void> {
    const fontUrls: Record<string, string> = {
      'Caveat': 'https://fonts.gstatic.com/s/caveat/v21/WwkgxXt8j6w5KCXGqU7c3Z8.woff2',
      'Kalam': 'https://fonts.gstatic.com/s/kalam/v16/YzJL3eiUYVnT9vOQ5g.woff2',
      'Patrick Hand': 'https://fonts.gstatic.com/s/patrickhand/v18/LDI1apSQOAYtSuYWp8ZhfYe.woff2',
      'Shadows Into Light': 'https://fonts.gstatic.com/s/shadowsintolight/v16/UqyNK9UOIntux_czAvDQx_Zc.woff2',
      'Homemade Apple': 'https://fonts.gstatic.com/s/homemadeapple/v18/Qw3GZQ5IiCsBjReF5A.woff2',
      'La Belle Aurore': 'https://fonts.gstatic.com/s/labelleaurore/v15/RrQIbo8w-YHhMn.woff2',
    };

    const promises = fonts.map(family => {
      const url = fontUrls[family];
      if (!url) {
        console.warn(`Unknown font: ${family}`);
        return Promise.resolve();
      }
      return this.loadFont(family, url);
    });

    await Promise.all(promises);
  }

  /**
   * Wait for all fonts to be ready
   */
  async ready(): Promise<void> {
    if (typeof document !== 'undefined' && 'fonts' in document) {
      try {
        await document.fonts.ready;
      } catch {
        // Fonts may already be ready
      }
    }
  }

  /**
   * Check if a specific font is loaded
   */
  isLoaded(family: string, weight = '400', style = 'normal'): boolean {
    return this.loadedFonts.has(`${family}-${weight}-${style}`);
  }

  /**
   * Clear loaded fonts cache (useful for testing)
   */
  clear(): void {
    this.loadedFonts.clear();
    this.loadPromises.clear();
  }
}

// Singleton instance
export const fontLoader = new FontLoader();
