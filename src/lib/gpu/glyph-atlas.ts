/**
 * Glyph Atlas for Text Rendering
 * Generates and manages glyph textures for GPU instanced rendering
 */

export interface GlyphInfo {
  char: string;
  x: number;
  y: number;
  width: number;
  height: number;
  bearingX: number;
  bearingY: number;
  advance: number;
}

export interface GlyphAtlas {
  canvas: HTMLCanvasElement;
  texture: WebGLTexture | null;
  gpuTexture: GPUTexture | null;
  glyphs: Map<string, GlyphInfo>;
  atlasSize: number;
}

const GLYPH_CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,!?;:\'"()- []{}@#$%^&*<>';

export function createGlyphAtlas(fontFamily: string = 'Caveat', fontSize: number = 24): GlyphAtlas {
  const cellSize = Math.ceil(fontSize * 1.5);
  const cols = 16;
  const rows = Math.ceil(GLYPH_CHARSET.length / cols);
  const atlasSize = cols * cellSize;

  const canvas = document.createElement('canvas');
  canvas.width = atlasSize;
  canvas.height = rows * cellSize;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Failed to create glyph atlas context');
  }

  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#ffffff';
  ctx.font = `${fontSize}px "${fontFamily}", cursive`;
  ctx.textBaseline = 'top';

  const glyphs = new Map<string, GlyphInfo>();

  for (let i = 0; i < GLYPH_CHARSET.length; i++) {
    const char = GLYPH_CHARSET[i];
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = col * cellSize;
    const y = row * cellSize;

    // Measure the glyph
    const metrics = ctx.measureText(char);
    const width = Math.min(Math.ceil(metrics.width || fontSize * 0.6), cellSize - 2);
    const height = Math.min(fontSize, cellSize - 2);

    // Center in cell
    const offsetX = Math.floor((cellSize - width) / 2);
    const offsetY = Math.floor((cellSize - height) / 2);

    ctx.fillText(char, x + offsetX, y + offsetY);

    glyphs.set(char, {
      char,
      x,
      y,
      width,
      height,
      bearingX: offsetX,
      bearingY: offsetY,
      advance: (metrics.actualBoundingBoxRight || fontSize * 0.6),
    });
  }

  return {
    canvas,
    texture: null,
    gpuTexture: null,
    glyphs,
    atlasSize,
  };
}

export function uploadGlyphAtlasToWebGL(gl: WebGL2RenderingContext, atlas: GlyphAtlas): void {
  if (atlas.texture) {
    gl.deleteTexture(atlas.texture);
  }

  const texture = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.ALPHA, atlas.canvas.width, atlas.canvas.height, 0, gl.ALPHA, gl.UNSIGNED_BYTE, null);
  gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, atlas.canvas.width, atlas.canvas.height, gl.ALPHA, gl.UNSIGNED_BYTE, atlas.canvas);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.bindTexture(gl.TEXTURE_2D, null);

  atlas.texture = texture;
}

export async function uploadGlyphAtlasToWebGPU(device: GPUDevice, atlas: GlyphAtlas): Promise<void> {
  if (atlas.gpuTexture) {
    atlas.gpuTexture.destroy();
  }

  const texture = device.createTexture({
    size: [atlas.canvas.width, atlas.canvas.height],
    format: 'r8unorm',
    usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
  });

  // Convert canvas to ImageData
  const imageData = new ImageData(atlas.canvas.width, atlas.canvas.height);
  const data = ctx!.getImageData(0, 0, atlas.canvas.width, atlas.canvas.height).data;
  
  // Extract alpha channel
  for (let i = 0; i < atlas.canvas.width * atlas.canvas.height; i++) {
    imageData.data[i] = data[i * 4 + 3]; // Alpha channel
  }

  device.queue.writeTexture(
    { texture },
    imageData.data,
    { bytesPerRow: atlas.canvas.width },
    [atlas.canvas.width, atlas.canvas.height]
  );

  atlas.gpuTexture = texture;
}

// Helper to get context for image data extraction
let ctx: CanvasRenderingContext2D | null = null;
function getContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  if (!ctx) {
    ctx = canvas.getContext('2d')!;
  }
  return ctx;
}

export function getGlyphUV(glyph: GlyphInfo, atlasSize: number): { u0: number; v0: number; u1: number; v1: number } {
  const invSize = 1 / atlasSize;
  return {
    u0: glyph.x * invSize,
    v0: glyph.y * invSize,
    u1: (glyph.x + glyph.width) * invSize,
    v1: (glyph.y + glyph.height) * invSize,
  };
}
