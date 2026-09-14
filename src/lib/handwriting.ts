import type { PaperSpec } from './paperConfig';

let ctx: CanvasRenderingContext2D | null = null;

function getCtx(): CanvasRenderingContext2D | null {
  if (ctx) return ctx;
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  ctx = canvas.getContext('2d');
  return ctx;
}

// Exported for use in other modules - uses the full Myanmar Unicode range
export function isMyanmarText(text: string): boolean {
  const myanmarRange = /[\u1000-\u109F\uA9E0-\uA9FF\uAA60-\uAA7F]/;
  return myanmarRange.test(text);
}

export function measure(text: string, font: string): number {
  const c = getCtx();
  if (!c) return text.length * 8;
  c.font = font;
  return c.measureText(text).width;
}

export interface FontMetrics {
  ascent: number;
  descent: number;
}

export function getFontMetrics(font: string): FontMetrics {
  const c = getCtx();
  if (!c) return { ascent: 0.8, descent: 0.2 };
  c.font = font;
  const m = c.measureText('Hxg');
  const asc = (m as TextMetrics & { fontBoundingBoxAscent?: number }).fontBoundingBoxAscent;
  const desc = (m as TextMetrics & { fontBoundingBoxDescent?: number }).fontBoundingBoxDescent;
  if (typeof asc === 'number' && isFinite(asc) && asc > 0) {
    return { ascent: asc, descent: desc ?? 0.2 * asc };
  }
  const fallback = c.measureText('Hg');
  const a = fallback.actualBoundingBoxAscent || 0;
  const d = fallback.actualBoundingBoxDescent || 0;
  if (a > 0) return { ascent: a * 1.05, descent: d * 1.25 };
  return { ascent: 0.8, descent: 0.2 };
}

export interface PageMetrics {
  effectiveDpi: number;
  topPx: number;
  bottomPx: number;
  rightPx: number;
  marginPx: number;
  textLeftPx: number;
  contentWidth: number;
  contentHeight: number;
  lineSpacing: number;
  linesPerPage: number;
}

export function computePageMetrics(spec: PaperSpec, widthPx: number, heightPx: number): PageMetrics {
  const safeWidth = widthPx > 0 ? widthPx : 793;
  const safeHeight = heightPx > 0 ? heightPx : 1123;
  const inches = spec.widthMm / 25.4;
  const effectiveDpi = safeWidth / inches;
  const mm = (value: number) => (value * effectiveDpi) / 25.4;

  const marginPx = mm(spec.marginMm);
  const topPx = mm(20);
  const bottomPx = mm(14);
  const rightPx = mm(14);
  const textLeftPx = marginPx + mm(3);
  const contentWidth = Math.max(24, safeWidth - textLeftPx - rightPx);
  const contentHeight = Math.max(24, safeHeight - topPx - bottomPx);
  const lineSpacing = Math.max(8, mm(spec.rulingSpacingMm));
  const linesPerPage = Math.max(1, Math.floor(contentHeight / lineSpacing));

  return {
    effectiveDpi,
    topPx,
    bottomPx,
    rightPx,
    marginPx,
    textLeftPx,
    contentWidth,
    contentHeight,
    lineSpacing,
    linesPerPage,
  };
}

export interface VisualLine {
  text: string;
  start: number;
  width: number;
}

export function wrapText(text: string, contentWidth: number, font: string): VisualLine[] {
  const lines: VisualLine[] = [];
  const logical = text.split('\n');
  let globalStart = 0;

  for (const logicalLine of logical) {
    if (logicalLine.length === 0) {
      lines.push({ text: '', start: globalStart, width: 0 });
    } else {
      let start = 0;
      while (start < logicalLine.length) {
        let end = logicalLine.length;
        if (measure(logicalLine.slice(start), font) > contentWidth) {
          end = longestPrefix(logicalLine, start, contentWidth, font);
          const segment = logicalLine.slice(start, end);
          const lastSpace = segment.lastIndexOf(' ');
          if (lastSpace > 0 && end < logicalLine.length) {
            end = start + lastSpace + 1;
          }
        }
        const segment = logicalLine.slice(start, end);
        lines.push({ text: segment, start: globalStart + start, width: measure(segment, font) });
        start = end;
      }
    }
    globalStart += logicalLine.length + 1;
  }

  if (lines.length === 0) lines.push({ text: '', start: 0, width: 0 });
  return lines;
}

function longestPrefix(line: string, start: number, contentWidth: number, font: string): number {
  let lo = start + 1;
  let hi = line.length;
  let best = start + 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (measure(line.slice(start, mid), font) <= contentWidth) {
      best = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return best;
}

export function locateLine(lines: VisualLine[], pos: number): { line: number; offset: number } {
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const end = line.start + line.text.length;
    if (pos >= line.start && pos < end) return { line: i, offset: pos - line.start };
  }
  let best = 0;
  for (let i = 0; i < lines.length; i++) {
    if (pos >= lines[i].start) best = i;
  }
  const line = lines[best];
  return { line: best, offset: Math.min(line.text.length, Math.max(0, pos - line.start)) };
}

export function offsetFromX(str: string, x: number, font: string): number {
  let lo = 0;
  let hi = str.length;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (measure(str.slice(0, mid), font) <= x) lo = mid;
    else hi = mid - 1;
  }
  return lo;
}

function hash32(value: number): number {
  let x = value >>> 0;
  x = (x ^ 61) ^ (x >>> 16);
  x = (x + (x << 3)) >>> 0;
  x = x ^ (x >>> 4);
  x = Math.imul(x, 0x27d4eb2d) >>> 0;
  x = x ^ (x >>> 15);
  return x >>> 0;
}

function rand(seed: number): number {
  return hash32(seed) / 4294967296;
}

export interface GlyphStyle {
  rotate: number;
  dx: number;
  dy: number;
  scale: number;
  opacity: number;
}

export function glyphStyle(index: number, fontSize: number): GlyphStyle {
  const r = (salt: number) => rand(index * 9176 + salt * 2654435761 + 17);
  return {
    rotate: (r(1) - 0.5) * 3.0,
    dx: (r(2) - 0.5) * fontSize * 0.05,
    dy: (r(3) - 0.5) * fontSize * 0.1,
    scale: 0.96 + r(4) * 0.08,
    opacity: 0.78 + r(5) * 0.22,
  };
}

export interface LineStyle {
  tilt: number;
  dx: number;
}

export function lineStyle(pageLineIndex: number, fontSize: number): LineStyle {
  const r = (salt: number) => rand(pageLineIndex * 7919 + salt * 40503 + 211);
  return {
    tilt: (r(1) - 0.5) * 0.7,
    dx: (r(2) - 0.5) * fontSize * 0.05,
  };
}
