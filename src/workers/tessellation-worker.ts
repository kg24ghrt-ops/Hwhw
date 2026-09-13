/**
 * Tessellation Worker
 * Offloads vector path tessellation to a Web Worker
 */

export interface TessellationRequest {
  type: 'tessellate';
  id: number;
  paths: VectorPath[];
}

export interface TessellationResult {
  type: 'tessellation-result';
  id: number;
  vertices: Float32Array;
  indices: Uint16Array;
}

export interface VectorPath {
  commands: PathCommand[];
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
}

export interface PathCommand {
  type: 'moveTo' | 'lineTo' | 'curveTo' | 'closePath';
  points: number[];
}

const WORKER_CODE = `
self.onmessage = function(e) {
  const data = e.data;
  
  if (data.type === 'tessellate') {
    const result = tessellatePaths(data.paths);
    self.postMessage({
      type: 'tessellation-result',
      id: data.id,
      vertices: result.vertices,
      indices: result.indices,
    }, [result.vertices.buffer, result.indices.buffer]);
  }
};

function tessellatePaths(paths) {
  const vertices = [];
  const indices = [];
  let vertexCount = 0;

  for (const path of paths) {
    const result = flattenPath(path);
    
    // Add vertices
    for (const v of result.vertices) {
      vertices.push(v.x, v.y, v.u, v.v);
    }
    
    // Add indices with offset
    for (const i of result.indices) {
      indices.push(i + vertexCount);
    }
    
    vertexCount += result.vertices.length;
  }

  return {
    vertices: new Float32Array(vertices),
    indices: new Uint16Array(indices),
  };
}

function flattenPath(path) {
  const vertices = [];
  const indices = [];
  const points = [];

  // Convert path commands to points
  for (const cmd of path.commands) {
    switch (cmd.type) {
      case 'moveTo':
        points.push({ x: cmd.points[0], y: cmd.points[1], type: 'move' });
        break;
      case 'lineTo':
        points.push({ x: cmd.points[0], y: cmd.points[1], type: 'line' });
        break;
      case 'curveTo':
        // Simple curve flattening - could be improved with adaptive subdivision
        const cp1x = cmd.points[0], cp1y = cmd.points[1];
        const cp2x = cmd.points[2], cp2y = cmd.points[3];
        const endX = cmd.points[4], endY = cmd.points[5];
        
        const lastPoint = points[points.length - 1];
        if (lastPoint) {
          const startX = lastPoint.x;
          const startY = lastPoint.y;
          
          // Subdivide curve into line segments
          const segments = 8;
          for (let i = 1; i <= segments; i++) {
            const t = i / segments;
            const it = 1 - t;
            
            const x = it * it * it * startX +
                      3 * it * it * t * cp1x +
                      3 * it * t * t * cp2x +
                      t * t * t * endX;
            const y = it * it * it * startY +
                      3 * it * it * t * cp1y +
                      3 * it * t * t * cp2y +
                      t * t * t * endY;
            
            points.push({ x, y, type: 'line' });
          }
        }
        break;
      case 'closePath':
        points.push({ type: 'close' });
        break;
    }
  }

  // Triangulate using ear clipping (simplified)
  if (points.length >= 3) {
    const polygon = points.filter(p => p.type !== 'move').map(p => ({ x: p.x, y: p.y }));
    
    // Fan triangulation from first vertex (simple approach)
    for (let i = 1; i < polygon.length - 1; i++) {
      indices.push(0, i, i + 1);
    }
    
    // Create vertices for each point
    for (let i = 0; i < polygon.length; i++) {
      vertices.push({
        x: polygon[i].x,
        y: polygon[i].y,
        u: 0,
        v: 0,
      });
    }
  }

  return { vertices, indices };
}
`;

export function createTessellationWorker(): Worker {
  const blob = new Blob([WORKER_CODE], { type: 'application/javascript' });
  const url = URL.createObjectURL(blob);
  return new Worker(url);
}

export async function tessellatePaths(paths: VectorPath[]): Promise<{ vertices: Float32Array; indices: Uint16Array }> {
  return new Promise((resolve, reject) => {
    const worker = createTessellationWorker();
    
    worker.onmessage = (e) => {
      const result = e.data as TessellationResult;
      resolve({ vertices: result.vertices, indices: result.indices });
      worker.terminate();
    };
    
    worker.onerror = (e) => {
      reject(e);
      worker.terminate();
    };
    
    const request: TessellationRequest = {
      type: 'tessellate',
      id: Date.now(),
      paths,
    };
    
    worker.postMessage(request);
  });
}
