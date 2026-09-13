/**
 * GPU Backend Detection and Type Definitions
 * Detects WebGPU support and falls back to WebGL 2
 */

export type GPUBackend = 'webgpu' | 'webgl2' | 'none';

export interface BackendInfo {
  backend: GPUBackend;
  adapter?: GPUAdapter;
  device?: GPUDevice;
  glContext?: WebGL2RenderingContext;
  supported: boolean;
}

export async function detectGPUBackend(): Promise<BackendInfo> {
  // Try WebGPU first
  if (typeof navigator !== 'undefined' && 'gpu' in navigator) {
    try {
      const adapter = await (navigator as any).gpu.requestAdapter();
      if (adapter) {
        const device = await adapter.requestDevice();
        return {
          backend: 'webgpu',
          adapter,
          device,
          supported: true,
        };
      }
    } catch (e) {
      console.warn('WebGPU adapter request failed:', e);
    }
  }

  // Fall back to WebGL 2
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl2') as WebGL2RenderingContext | null;
  if (gl) {
    return {
      backend: 'webgl2',
      glContext: gl,
      supported: true,
    };
  }

  return {
    backend: 'none',
    supported: false,
  };
}

export function getBackendDisplayName(backend: GPUBackend): string {
  switch (backend) {
    case 'webgpu':
      return 'WebGPU';
    case 'webgl2':
      return 'WebGL 2';
    case 'none':
      return 'Software';
  }
}
