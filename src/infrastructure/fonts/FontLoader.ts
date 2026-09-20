/**
 * Font Loader Service
 * Uses FontFace API to load and manage handwriting fonts
 */
export interface FontFaceApi {
  load(font: string): Promise<FontFace[]>;
  ready: Promise<void>;
}

export class FontLoader {
  private loadedFonts = new Set<string>();
  private fontLoadPromises = new Map<string, Promise<void>>();

  constructor(private documentRef: Document = document) {}

  /**
   * Load a font family using the FontFace API
   */
  async loadFont(fontFamily: string, fontSize: number = 24): Promise<void> {
    const cacheKey = `${fontFamily}:${fontSize}`;
    
    if (this.loadedFonts.has(cacheKey)) {
      return;
    }

    if (this.fontLoadPromises.has(cacheKey)) {
      return this.fontLoadPromises.get(cacheKey);
    }

    const loadPromise = (async () => {
      try {
        if ('fonts' in this.documentRef) {
          await this.documentRef.fonts.load(`${fontSize}px "${fontFamily}"`);
          await this.documentRef.fonts.ready;
        }
        this.loadedFonts.add(cacheKey);
      } catch (error) {
        console.warn(`Failed to load font: ${fontFamily}`, error);
      } finally {
        this.fontLoadPromises.delete(cacheKey);
      }
    })();

    this.fontLoadPromises.set(cacheKey, loadPromise);
    return loadPromise;
  }

  /**
   * Wait for all fonts to be ready
   */
  async ready(): Promise<void> {
    if ('fonts' in this.documentRef) {
      try {
        await this.documentRef.fonts.ready;
      } catch {
        // Fonts may already be ready
      }
    }
  }

  /**
   * Preload multiple fonts
   */
  async preloadFonts(fontFamilies: string[]): Promise<void> {
    await Promise.all(fontFamilies.map(family => this.loadFont(family)));
  }

  /**
   * Clear loaded fonts cache
   */
  clearCache(): void {
    this.loadedFonts.clear();
    this.fontLoadPromises.clear();
  }
}
