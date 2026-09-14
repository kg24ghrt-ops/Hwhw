// Myanmar text detection and shaping utilities
// For now, we rely on browser shaping - modern browsers handle Myanmar correctly
// when using proper fonts like Noto Sans Myanmar

export function isMyanmarText(text: string): boolean {
  const myanmarRange = /[\u1000-\u109F\uA9E0-\uA9FF\uAA60-\uAA7F]/;
  return myanmarRange.test(text);
}

// Browser-based shaping - returns text as-is since the browser handles shaping
// when rendering with the correct font
export async function shapeMyanmarText(text: string): Promise<string> {
  return text;
}
