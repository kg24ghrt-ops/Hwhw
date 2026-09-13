/**
 * Performance HUD for GPU Renderer
 * Shows FPS, draw calls, and GPU memory usage
 */

export interface PerformanceStats {
  fps: number;
  frameTime: number;
  drawCalls: number;
  gpuMemoryMB: number;
}

export class PerformanceHUD {
  private container: HTMLElement | null = null;
  private fpsElement: HTMLElement | null = null;
  private frameTimeElement: HTMLElement | null = null;
  private drawCallsElement: HTMLElement | null = null;
  private memoryElement: HTMLElement | null = null;
  
  private frameCount = 0;
  private lastTime = performance.now();
  private currentFPS = 0;
  private currentFrameTime = 0;
  private drawCallCount = 0;
  private gpuMemoryUsage = 0;

  constructor() {
    this.init();
  }

  private init() {
    if (typeof document === 'undefined') return;

    this.container = document.createElement('div');
    this.container.className = 'perf-hud';
    this.container.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      z-index: 9999;
      background: rgba(0, 0, 0, 0.75);
      color: #0f0;
      font-family: monospace;
      font-size: 11px;
      padding: 8px 12px;
      border-radius: 6px;
      pointer-events: none;
      user-select: none;
      backdrop-filter: blur(4px);
    `;

    this.container.innerHTML = `
      <div style="font-weight: bold; margin-bottom: 4px; color: #fff;">GPU RENDERER</div>
      <div><span style="color: #aaa;">FPS:</span> <span id="perf-fps">0</span></div>
      <div><span style="color: #aaa;">Frame:</span> <span id="perf-frame">0</span> ms</div>
      <div><span style="color: #aaa;">Draw Calls:</span> <span id="perf-draw">0</span></div>
      <div><span style="color: #aaa;">GPU Mem:</span> <span id="perf-mem">0</span> MB</div>
    `;

    document.body.appendChild(this.container);

    this.fpsElement = this.container.querySelector('#perf-fps');
    this.frameTimeElement = this.container.querySelector('#perf-frame');
    this.drawCallsElement = this.container.querySelector('#perf-draw');
    this.memoryElement = this.container.querySelector('#perf-mem');
  }

  beginFrame() {
    this.drawCallCount = 0;
  }

  recordDrawCall() {
    this.drawCallCount++;
  }

  endFrame() {
    const now = performance.now();
    this.currentFrameTime = now - this.lastTime;
    this.lastTime = now;
    this.frameCount++;

    // Update FPS every 500ms
    if (now - this.lastTime > 500) {
      this.currentFPS = Math.round((this.frameCount * 1000) / (now - this.lastTime + this.currentFrameTime));
      this.frameCount = 0;
    }

    this.updateDisplay();
  }

  setGPUMemory(mb: number) {
    this.gpuMemoryUsage = mb;
  }

  private updateDisplay() {
    if (!this.container) return;

    if (this.fpsElement) {
      const fpsColor = this.currentFPS >= 55 ? '#0f0' : this.currentFPS >= 30 ? '#ff0' : '#f00';
      this.fpsElement.textContent = this.currentFPS.toString();
      this.fpsElement.style.color = fpsColor;
    }

    if (this.frameTimeElement) {
      const timeColor = this.currentFrameTime <= 16 ? '#0f0' : this.currentFrameTime <= 33 ? '#ff0' : '#f00';
      this.frameTimeElement.textContent = this.currentFrameTime.toFixed(1);
      this.frameTimeElement.style.color = timeColor;
    }

    if (this.drawCallsElement) {
      this.drawCallsElement.textContent = this.drawCallCount.toString();
    }

    if (this.memoryElement) {
      this.memoryElement.textContent = this.gpuMemoryUsage.toFixed(1);
    }
  }

  destroy() {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    this.container = null;
  }
}
