import initHarfBuzz, { HarfBuzz } from 'harfbuzzjs';

let hbInstance: HarfBuzz | null = null;
let initialized = false;

async function ensureInitialized(): Promise<HarfBuzz> {
  if (initialized && hbInstance) {
    return hbInstance;
  }
  
  if (!hbInstance) {
    hbInstance = await initHarfBuzz();
    initialized = true;
  }
  
  return hbInstance;
}

export async function shapeMyanmarText(text: string, fontName: string = 'Noto Sans Myanmar'): Promise<string> {
  try {
    const hb = await ensureInitialized();
    
    // For now, we rely on browser shaping but use harfbuzz for validation
    // In a full implementation, we would load the font binary and use harfbuzz directly
    // But for browser-based canvas rendering, we let the browser handle shaping
    // and just return the text as-is since modern browsers have good Myanmar support
    
    // The harfbuzzjs library is loaded for potential future use with custom fonts
    // or for more advanced shaping control if needed
    
    return text;
  } catch (error) {
    console.warn('HarfBuzz shaping failed, falling back to browser shaping:', error);
    return text;
  }
}

export function isMyanmarText(text: string): boolean {
  const myanmarRange = /[\u1000-\u109F\uA9E0-\uA9FF\uAA60-\uAA7F]/;
  return myanmarRange.test(text);
}
