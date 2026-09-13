/**
 * GPU Document Renderer
 * Main renderer that combines WebGPU/WebGL2 backends with paper texture, vector graphics, and text
 */

import { A5_PX_300 } from './paperConfig';
import { detectGPUBackend, type BackendInfo, type GPUBackend } from './backend';
import { createWebGPURenderer, type WebGPURenderer, type Transform2D } from './webgpu-renderer';
import { createWebGL2Renderer, type WebGL2Renderer } from './webgl2-renderer';
import { PerformanceHUD } from './performance-hud';
import { createGlyphAtlas, uploadGlyphAtlasToWebGL, uploadGlyphAtlasToWebGPU, type GlyphAtlas } from './glyph-atlas';

export interface RenderOptions {
  container: HTMLElement;
  fontFamily?: string;
  fontSize?: number;
}

export interface ExportResult {
  png: Blob | null;
  pdfData?: Uint8Array;
}

export class GPUDocumentRenderer {
  private backend: BackendInfo | null = null;
  private webgpuRenderer: WebGPURenderer | null = null;
  private webgl2Renderer: WebGL2Renderer | null = null;
  private canvas: HTMLCanvasElement;
  private hud: PerformanceHUD;
  private glyphAtlas: GlyphAtlas | null = null;
  
  private transform: Transform2D = { scale: 1, translateX: 0, translateY: 0 };
  private isDragging = false;
  private lastMouseX = 0;
  private lastMouseY = 0;
  private animationFrame: number = 0;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.style.cssText = `
      width: 100%;
      height: 100%;
      display: block;
      touch-action: none;
    `;
    this.hud = new PerformanceHUD();
  }

  async initialize(options: RenderOptions): Promise<void> {
    // Detect GPU backend
    this.backend = await detectGPUBackend();
    
    if (!this.backend.supported) {
      console.warn('No GPU backend available, falling back to software rendering');
      return;
    }

    options.container.appendChild(this.canvas);

    if (this.backend.backend === 'webgpu' && this.backend.device) {
      this.webgpuRenderer = await createWebGPURenderer(this.backend.device, this.canvas);
      this.setupWebGPUEvents();
    } else if (this.backend.backend === 'webgl2' && this.backend.glContext) {
      this.webgl2Renderer = createWebGL2Renderer(this.backend.glContext, this.canvas);
      this.setupWebGLEvents();
    }

    // Create glyph atlas
    this.glyphAtlas = createGlyphAtlas(options.fontFamily || 'Caveat', options.fontSize || 24);

    // Upload to GPU
    if (this.webgpuRenderer && this.glyphAtlas) {
      await uploadGlyphAtlasToWebGPU(this.webgpuRenderer.device, this.glyphAtlas);
    } else if (this.webgl2Renderer && this.glyphAtlas) {
      uploadGlyphAtlasToWebGL(this.webgl2Renderer.gl, this.glyphAtlas);
    }

    // Setup pan/zoom interactions
    this.setupInteractions();

    // Calculate initial display size
    this.resize();

    // Update HUD
    this.hud.setGPUMemory(this.estimateGPUMemory());
    
    console.log(`GPU Renderer initialized with ${this.backend.backend} backend`);
  }

  private setupWebGPUEvents() {
    if (!this.webgpuRenderer) return;

    const devicePixelRatio = window.devicePixelRatio || 1;
    const cssWidth = A5_PX_300.w;
    const cssHeight = A5_PX_300.h;
    const backingWidth = Math.floor(cssWidth * devicePixelRatio);
    const backingHeight = Math.floor(cssHeight * devicePixelRatio);

    this.webgpuRenderer.configure(backingWidth, backingHeight);
  }

  private setupWebGLEvents() {
    if (!this.webgl2Renderer) return;

    const devicePixelRatio = window.devicePixelRatio || 1;
    const cssWidth = A5_PX_300.w;
    const cssHeight = A5_PX_300.h;
    const backingWidth = Math.floor(cssWidth * devicePixelRatio);
    const backingHeight = Math.floor(cssHeight * devicePixelRatio);

    this.webgl2Renderer.configure(backingWidth, backingHeight);
  }

  private resize(): void {
    const rect = this.canvas.parentElement?.getBoundingClientRect();
    if (!rect) return;

    const devicePixelRatio = window.devicePixelRatio || 1;
    const cssWidth = rect.width;
    const cssHeight = rect.height;
    const backingWidth = Math.floor(cssWidth * devicePixelRatio);
    const backingHeight = Math.floor(cssHeight * devicePixelRatio);

    if (this.webgpuRenderer) {
      this.webgpuRenderer.configure(backingWidth, backingHeight);
    } else if (this.webgl2Renderer) {
      this.webgl2Renderer.configure(backingWidth, backingHeight);
    }

    // Adjust transform to fit paper in viewport
    const paperAspect = A5_PX_300.w / A5_PX_300.h;
    const viewportAspect = cssWidth / cssHeight;
    
    if (viewportAspect > paperAspect) {
      this.transform.scale = cssHeight / A5_PX_300.h;
    } else {
      this.transform.scale = cssWidth / A5_PX_300.w;
    }

    this.render();
  }

  private setupInteractions(): void {
    this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
    this.canvas.addEventListener('wheel', this.handleWheel.bind(this), { passive: false });

    // Touch events
    this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
    this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this));
  }

  private handleMouseDown(e: MouseEvent): void {
    this.isDragging = true;
    this.lastMouseX = e.clientX;
    this.lastMouseY = e.clientY;
  }

  private handleMouseMove(e: MouseEvent): void {
    if (!this.isDragging) return;

    const dx = e.clientX - this.lastMouseX;
    const dy = e.clientY - this.lastMouseY;

    this.transform.translateX += dx;
    this.transform.translateY += dy;

    this.lastMouseX = e.clientX;
    this.lastMouseY = e.clientY;

    this.render();
  }

  private handleMouseUp(): void {
    this.isDragging = false;
  }

  private handleWheel(e: WheelEvent): void {
    e.preventDefault();

    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.1, Math.min(10, this.transform.scale * zoomFactor));

    // Zoom towards mouse position
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const scaleRatio = newScale / this.transform.scale;
    this.transform.translateX = mouseX - (mouseX - this.transform.translateX) * scaleRatio;
    this.transform.translateY = mouseY - (mouseY - this.transform.translateY) * scaleRatio;
    this.transform.scale = newScale;

    this.render();
  }

  private handleTouchStart(e: TouchEvent): void {
    if (e.touches.length === 1) {
      this.isDragging = true;
      this.lastMouseX = e.touches[0].clientX;
      this.lastMouseY = e.touches[0].clientY;
    }
  }

  private handleTouchMove(e: TouchEvent): void {
    if (!this.isDragging || e.touches.length !== 1) return;
    e.preventDefault();

    const dx = e.touches[0].clientX - this.lastMouseX;
    const dy = e.touches[0].clientY - this.lastMouseY;

    this.transform.translateX += dx;
    this.transform.translateY += dy;

    this.lastMouseX = e.touches[0].clientX;
    this.lastMouseY = e.touches[0].clientY;

    this.render();
  }

  private handleTouchEnd(): void {
    this.isDragging = false;
  }

  private render(): void {
    this.hud.beginFrame();

    if (this.webgpuRenderer) {
      this.webgpuRenderer.render(this.transform);
      this.hud.recordDrawCall();
    } else if (this.webgl2Renderer) {
      this.webgl2Renderer.render(this.transform);
      this.hud.recordDrawCall();
    }

    this.hud.endFrame();
  }

  private estimateGPUMemory(): number {
    let memory = 0;

    // Paper texture: 1748 * 2480 * 4 bytes (RGBA8)
    memory += A5_PX_300.w * A5_PX_300.h * 4 / (1024 * 1024);

    // Glyph atlas (approximate)
    if (this.glyphAtlas) {
      memory += this.glyphAtlas.atlasSize * this.glyphAtlas.atlasSize / (1024 * 1024);
    }

    return memory;
  }

  async exportPNG(): Promise<Blob | null> {
    if (!this.webgpuRenderer && !this.webgl2Renderer) {
      return null;
    }

    // Reset transform for full resolution export
    const savedTransform = { ...this.transform };
    this.transform = { scale: 1, translateX: 0, translateY: 0 };
    this.render();

    // For WebGPU
    if (this.webgpuRenderer) {
      const device = this.webgpuRenderer.device;
      const paperTexture = this.webgpuRenderer.colorTexture;

      // Copy texture to buffer
      const bytesPerRow = A5_PX_300.w * 4;
      const buffer = device.createBuffer({
        size: bytesPerRow * A5_PX_300.h,
        usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
      });

      const commandEncoder = device.createCommandEncoder();
      commandEncoder.copyTextureToBuffer(
        { texture: paperTexture },
        { buffer, bytesPerRow },
        [A5_PX_300.w, A5_PX_300.h]
      );

      device.queue.submit([commandEncoder.finish()]);
      await buffer.mapAsync(GPUMapMode.READ);

      const arrayBuffer = buffer.getMappedRange().slice(0);
      buffer.unmap();

      // Convert to PNG using canvas
      const imageData = new ImageData(new Uint8ClampedArray(arrayBuffer), A5_PX_300.w, A5_PX_300.h);
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = A5_PX_300.w;
      tempCanvas.height = A5_PX_300.h;
      const ctx = tempCanvas.getContext('2d')!;
      ctx.putImageData(imageData, 0, 0);

      const blob = await new Promise<Blob | null>((resolve) => {
        tempCanvas.toBlob((b) => resolve(b), 'image/png');
      });

      buffer.destroy();
      this.transform = savedTransform;
      this.render();

      return blob;
    }

    // For WebGL2
    if (this.webgl2Renderer) {
      const gl = this.webgl2Renderer.gl;
      
      // Read pixels from framebuffer
      const pixels = new Uint8Array(A5_PX_300.w * A5_PX_300.h * 4);
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.webgl2Renderer.fbo);
      gl.readPixels(0, 0, A5_PX_300.w, A5_PX_300.h, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);

      // Flip vertically (OpenGL coordinates)
      const flipped = new Uint8Array(pixels.length);
      for (let y = 0; y < A5_PX_300.h; y++) {
        const srcOffset = y * A5_PX_300.w * 4;
        const dstOffset = (A5_PX_300.h - 1 - y) * A5_PX_300.w * 4;
        flipped.set(pixels.subarray(srcOffset, srcOffset + A5_PX_300.w * 4), dstOffset);
      }

      const imageData = new ImageData(flipped, A5_PX_300.w, A5_PX_300.h);
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = A5_PX_300.w;
      tempCanvas.height = A5_PX_300.h;
      const ctx = tempCanvas.getContext('2d')!;
      ctx.putImageData(imageData, 0, 0);

      const blob = await new Promise<Blob | null>((resolve) => {
        tempCanvas.toBlob((b) => resolve(b), 'image/png');
      });

      this.transform = savedTransform;
      this.render();

      return blob;
    }

    return null;
  }

  async exportPDF(): Promise<Uint8Array> {
    // Basic PDF generation - creates a simple PDF with the rendered image
    const pngBlob = await this.exportPNG();
    if (!pngBlob) {
      throw new Error('Failed to export document');
    }

    // Convert blob to base64
    const arrayBuffer = await pngBlob.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

    // Minimal PDF structure
    const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /XObject << /Im1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 44 >>
stream
q 595 0 0 842 0 0 cm /Im1 Do Q
endstream
endobj
5 0 obj
<< /Type /XObject /Subtype /Image /Width ${A5_PX_300.w} /Height ${A5_PX_300.h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${arrayBuffer.byteLength} >>
stream
${atob(base64)}
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000117 00000 n 
0000000266 00000 n 
0000000359 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
${595 + arrayBuffer.byteLength + 200}
%%EOF`;

    this.transform = { scale: 1, translateX: 0, translateY: 0 };
    this.render();

    return new TextEncoder().encode(pdfContent);
  }

  getBackend(): GPUBackend {
    return this.backend?.backend || 'none';
  }

  destroy(): void {
    cancelAnimationFrame(this.animationFrame);
    
    if (this.webgpuRenderer) {
      this.webgpuRenderer.dispose();
    }
    
    if (this.webgl2Renderer) {
      this.webgl2Renderer.dispose();
    }

    this.hud.destroy();
  }
}
