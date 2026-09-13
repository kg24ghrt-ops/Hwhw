/**
 * WebGL 2 Fallback Renderer for A5 Paper
 * Renders vector content to GPU textures using GLSL shaders
 */

import { A5_PX_300 } from './paperConfig';

export interface WebGL2Renderer {
  gl: WebGL2RenderingContext;
  canvas: HTMLCanvasElement;
  program: WebGLProgram;
  uniformBuffer: WebGLBuffer;
  fbo: WebGLFramebuffer;
  colorTexture: WebGLTexture;
  configure: (width: number, height: number) => void;
  render: (transform: Transform2D) => void;
  dispose: () => void;
}

export interface Transform2D {
  scale: number;
  translateX: number;
  translateY: number;
}

const BLIT_VERTEX_SHADER = `#version 300 es
in vec2 a_position;
in vec2 a_uv;
out vec2 v_uv;

uniform float u_scale;
uniform float u_translateX;
uniform float u_translateY;
uniform float u_viewportWidth;
uniform float u_viewportHeight;

void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
  v_uv = a_uv;
}
`;

const BLIT_FRAGMENT_SHADER = `#version 300 es
precision mediump float;

in vec2 v_uv;
out vec4 fragColor;

uniform float u_scale;
uniform float u_translateX;
uniform float u_translateY;
uniform float u_viewportWidth;
uniform float u_viewportHeight;
uniform sampler2D u_paperTexture;

void main() {
  // Apply pan/zoom transform to UVs
  vec2 centeredUV = v_uv - vec2(0.5);
  vec2 scaledUV = centeredUV / u_scale;
  vec2 transformedUV = scaledUV + vec2(0.5) + 
    vec2(u_translateX / u_viewportWidth, u_translateY / u_viewportHeight);
  
  // Check bounds
  if (transformedUV.x < 0.0 || transformedUV.x > 1.0 || 
      transformedUV.y < 0.0 || transformedUV.y > 1.0) {
    fragColor = vec4(0.95, 0.93, 0.88, 1.0);
    return;
  }
  
  fragColor = texture(u_paperTexture, transformedUV);
}
`;

function compileShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader compile error:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  
  return shader;
}

function createProgram(gl: WebGL2RenderingContext, vertexSrc: string, fragmentSrc: string): WebGLProgram | null {
  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexSrc);
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSrc);
  
  if (!vertexShader || !fragmentShader) return null;
  
  const program = gl.createProgram();
  if (!program) return null;
  
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Program link error:', gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);
  
  return program;
}

export function createWebGL2Renderer(
  gl: WebGL2RenderingContext,
  canvas: HTMLCanvasElement
): WebGL2Renderer {
  const program = createProgram(gl, BLIT_VERTEX_SHADER, BLIT_FRAGMENT_SHADER);
  if (!program) {
    throw new Error('Failed to create WebGL2 program');
  }

  // Create uniform buffer
  const uniformBuffer = gl.createBuffer()!;

  // Create paper texture (A5 at 300 DPI)
  const colorTexture = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, colorTexture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, A5_PX_300.w, A5_PX_300.h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.bindTexture(gl.TEXTURE_2D, null);

  // Create framebuffer
  const fbo = gl.createFramebuffer()!;
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, colorTexture, 0);
  
  const fbStatus = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
  if (fbStatus !== gl.FRAMEBUFFER_COMPLETE) {
    console.error('Framebuffer incomplete:', fbStatus);
  }
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);

  // Create vertex buffers for full-screen triangle
  const positions = new Float32Array([-1, -1, 3, -1, -1, 3]);
  const uvs = new Float32Array([0, 1, 2, 1, 0, -1]);

  const positionBuffer = gl.createBuffer()!;
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

  const uvBuffer = gl.createBuffer()!;
  gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, uvs, gl.STATIC_DRAW);

  const vao = gl.createVertexArray()!;
  gl.bindVertexArray(vao);

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  const posLoc = gl.getAttribLocation(program, 'a_position');
  gl.enableVertexAttribArray(posLoc);
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
  const uvLoc = gl.getAttribLocation(program, 'a_uv');
  gl.enableVertexAttribArray(uvLoc);
  gl.vertexAttribPointer(uvLoc, 2, gl.FLOAT, false, 0, 0);

  gl.bindVertexArray(null);

  // Get uniform locations
  const uniformLocations = {
    scale: gl.getUniformLocation(program, 'u_scale'),
    translateX: gl.getUniformLocation(program, 'u_translateX'),
    translateY: gl.getUniformLocation(program, 'u_translateY'),
    viewportWidth: gl.getUniformLocation(program, 'u_viewportWidth'),
    viewportHeight: gl.getUniformLocation(program, 'u_viewportHeight'),
  };

  const configure = (width: number, height: number) => {
    canvas.width = width;
    canvas.height = height;
    gl.viewport(0, 0, width, height);
  };

  const render = (transform: Transform2D) => {
    gl.clearColor(0.95, 0.93, 0.88, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);

    gl.uniform1f(uniformLocations.scale, transform.scale);
    gl.uniform1f(uniformLocations.translateX, transform.translateX);
    gl.uniform1f(uniformLocations.translateY, transform.translateY);
    gl.uniform1f(uniformLocations.viewportWidth, canvas.width);
    gl.uniform1f(uniformLocations.viewportHeight, canvas.height);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, colorTexture);
    gl.uniform1i(gl.getUniformLocation(program, 'u_paperTexture'), 0);

    gl.bindVertexArray(vao);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.bindVertexArray(null);
  };

  const dispose = () => {
    gl.deleteBuffer(uniformBuffer);
    gl.deleteTexture(colorTexture);
    gl.deleteFramebuffer(fbo);
    gl.deleteProgram(program);
  };

  return {
    gl,
    canvas,
    program,
    uniformBuffer,
    fbo,
    colorTexture,
    configure,
    render,
    dispose,
  };
}
