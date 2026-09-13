/**
 * Text Shaping Worker
 * Offloads text shaping and glyph positioning to a Web Worker
 */

export interface ShapeRequest {
  type: 'shape';
  id: number;
  text: string;
  fontFamily: string;
  fontSize: number;
  x: number;
  y: number;
}

export interface ShapeResult {
  type: 'shape-result';
  id: number;
  glyphs: ShapedGlyph[];
}

export interface ShapedGlyph {
  char: string;
  x: number;
  y: number;
  width: number;
  height: number;
  advance: number;
}

const WORKER_CODE = `
self.onmessage = function(e) {
  const data = e.data;
  
  if (data.type === 'shape') {
    const result = shapeText(data.text, data.fontFamily, data.fontSize, data.x, data.y);
    self.postMessage({
      type: 'shape-result',
      id: data.id,
      glyphs: result.glyphs,
    });
  }
};

function shapeText(text, fontFamily, fontSize, startX, startY) {
  // Create offscreen canvas for measurement
  const canvas = new OffscreenCanvas(1, 1);
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    return { glyphs: [] };
  }
  
  ctx.font = \`\${fontSize}px "\${fontFamily}", cursive\`;
  ctx.textBaseline = 'alphabetic';
  
  const glyphs = [];
  let currentX = startX;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    
    if (char === '\\n') {
      currentX = startX;
      continue;
    }
    
    const metrics = ctx.measureText(char);
    const width = metrics.actualBoundingBoxRight - metrics.actualBoundingBoxLeft || fontSize * 0.5;
    const height = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent || fontSize;
    const advance = metrics.actualBoundingBoxAdvance || fontSize * 0.6;
    
    glyphs.push({
      char,
      x: currentX,
      y: startY - metrics.actualBoundingBoxAscent,
      width,
      height,
      advance,
    });
    
    currentX += advance;
  }
  
  return { glyphs };
}
`;

export function createShapingWorker(): Worker {
  const blob = new Blob([WORKER_CODE], { type: 'application/javascript' });
  const url = URL.createObjectURL(blob);
  return new Worker(url);
}

export async function shapeText(
  text: string,
  fontFamily: string,
  fontSize: number,
  x: number,
  y: number
): Promise<ShapedGlyph[]> {
  return new Promise((resolve, reject) => {
    const worker = createShapingWorker();
    
    worker.onmessage = (e) => {
      const result = e.data as ShapeResult;
      resolve(result.glyphs);
      worker.terminate();
    };
    
    worker.onerror = (e) => {
      reject(e);
      worker.terminate();
    };
    
    const request: ShapeRequest = {
      type: 'shape',
      id: Date.now(),
      text,
      fontFamily,
      fontSize,
      x,
      y,
    };
    
    worker.postMessage(request);
  });
}
