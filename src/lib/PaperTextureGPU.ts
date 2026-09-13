/**
 * GPU-Accelerated Paper Texture Renderer
 * Uses WebGL2 for high-performance paper texture generation
 * Supports procedural noise, fiber patterns, and customizable textures
 */

export interface GPUTextureConfig {
  width: number;
  height: number;
  paperTone: string;
  texture: {
    macroFrequency: number;
    macroAmplitude: number;
    mesoFrequency: number;
    mesoAmplitude: number;
    microFrequency: number;
    microAmplitude: number;
    anisotropyRatio: number;
    anisotropyAngle: number;
  };
  lighting: {
    diffuseIntensity: number;
    diffuseAngle: number;
    gradientIntensity: number;
    edgeDarkening: number;
    contactShadowOpacity: number;
    contactShadowBlur: number;
  };
}

export interface GPUTextureRenderer {
  canvas: HTMLCanvasElement;
  gl: WebGL2RenderingContext;
  texture: WebGLTexture | null;
  framebuffer: WebGLFramebuffer | null;
  update: (config: GPUTextureConfig) => void;
  getTexture: () => WebGLTexture | null;
  destroy: () => void;
}

const VERTEX_SHADER_SOURCE = `#version 300 es
precision highp float;

in vec2 a_position;
in vec2 a_texCoord;
out vec2 v_texCoord;

void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
  v_texCoord = a_texCoord;
}
`;

const FRAGMENT_SHADER_SOURCE = `#version 300 es
precision highp float;

in vec2 v_texCoord;
out vec4 fragColor;

uniform vec2 u_resolution;
uniform vec3 u_paperTone;
uniform float u_time;
uniform float u_brightness;

// Texture parameters
uniform float u_macroFrequency;
uniform float u_macroAmplitude;
uniform float u_mesoFrequency;
uniform float u_mesoAmplitude;
uniform float u_microFrequency;
uniform float u_microAmplitude;
uniform float u_anisotropyRatio;
uniform float u_anisotropyAngle;

// Lighting parameters
uniform float u_diffuseIntensity;
uniform float u_diffuseAngle;
uniform float u_gradientIntensity;
uniform float u_edgeDarkening;

// Noise functions
float hash(float n) {
  return fract(sin(n) * 1e4);
}

float hash(vec2 p) {
  return fract(1e4 * sin(17.0 * p.x + p.y * 0.1) * (0.1 + abs(sin(p.y * 13.0 + p.x))));
}

float noise(vec2 x) {
  vec2 p = floor(x);
  vec2 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  
  float n = p.x + p.y * 157.0;
  return mix(mix(hash(n + 0.0), hash(n + 1.0), f.x),
             mix(hash(n + 157.0), hash(n + 158.0), f.x), f.y);
}

// Fractional Brownian Motion
float fbm(vec2 p, float frequency, float amplitude, int octaves) {
  float value = 0.0;
  float weight = amplitude;
  
  for (int i = 0; i < octaves; i++) {
    value += weight * noise(p * frequency);
    frequency *= 2.0;
    weight *= 0.5;
  }
  
  return value;
}

// Anisotropic noise
float anisotropicNoise(vec2 p, float frequency, float amplitude, float ratio, float angle) {
  mat2 rotation = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
  vec2 scaled = p * vec2(frequency, frequency * ratio);
  vec2 rotated = scaled * rotation;
  return fbm(rotated, 1.0, amplitude, 4);
}

// Paper fiber pattern
float fibers(vec2 uv, float scale, float density) {
  vec2 grid = uv * scale;
  vec2 cell = floor(grid);
  vec2 cellCoord = fract(grid);
  
  float n = hash(cell + 0.5);
  float fiberWidth = mix(0.1, 0.4, n);
  float fiberDir = hash(cell + vec2(0.37, 0.61)) * 3.14159 * 2.0;
  
  vec2 fiberCenter = vec2(n, hash(cell + vec2(0.73, 0.29)));
  vec2 toCenter = cellCoord - fiberCenter;
  
  float dist = length(toCenter);
  vec2 fiberVec = vec2(cos(fiberDir), sin(fiberDir));
  float proj = dot(toCenter, fiberVec);
  float fiberDist = abs(proj);
  
  float fiber = smoothstep(fiberWidth + 0.01, fiberWidth, fiberDist);
  
  return fiber * (1.0 - smoothstep(0.4, 0.5, dist));
}

// Combined texture
vec3 paperTexture(vec2 uv) {
  vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
  vec2 scaledUV = uv * aspect;
  
  // Macro texture (large-scale variations)
  float macro = anisotropicNoise(scaledUV, u_macroFrequency, u_macroAmplitude, 
                                  u_anisotropyRatio, u_anisotropyAngle);
  
  // Meso texture (medium-scale)
  float meso = anisotropicNoise(scaledUV, u_mesoFrequency, u_mesoAmplitude,
                                 u_anisotropyRatio, u_anisotropyAngle);
  
  // Micro texture (fine grain)
  float micro = fbm(scaledUV, u_microFrequency, u_microAmplitude, 3);
  
  // Fiber pattern
  float fiberPattern = fibers(uv, 200.0, 0.3);
  
  // Combine all layers
  float texture = macro + meso + micro + (fiberPattern * 0.05);
  
  // Apply to paper tone
  vec3 baseColor = u_paperTone;
  vec3 shaded = baseColor * (1.0 + texture * 0.15);
  
  return shaded;
}

// Lighting effects
vec3 applyLighting(vec2 uv, vec3 color) {
  // Diffuse lighting
  vec2 lightDir = vec2(cos(u_diffuseAngle * 3.14159 / 180.0), 
                       sin(u_diffuseAngle * 3.14159 / 180.0));
  float diffuse = dot(vec2(0.0, 1.0), lightDir) * u_diffuseIntensity;
  
  // Gradient
  float gradient = uv.y * u_gradientIntensity;
  
  // Edge darkening (vignette)
  vec2 centerUV = uv - vec2(0.5);
  float edgeDist = length(centerUV) * 2.0;
  float edgeDarken = smoothstep(0.8, 1.2, edgeDist) * u_edgeDarkening;
  
  // Combine lighting effects
  vec3 lit = color * (diffuse + gradient + (1.0 - edgeDarken));
  
  return lit;
}

void main() {
  vec2 uv = v_texCoord;
  
  // Generate paper texture
  vec3 textureColor = paperTexture(uv);
  
  // Apply lighting
  vec3 finalColor = applyLighting(uv, textureColor);
  
  // Brightness adjustment
  finalColor = pow(finalColor, vec3(1.0 / u_brightness));
  
  fragColor = vec4(finalColor, 1.0);
}
`;

function createShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) throw new Error('Failed to create shader');
  
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Shader compilation failed: ${info}`);
  }
  
  return shader;
}

function createProgram(gl: WebGL2RenderingContext): WebGLProgram {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER_SOURCE);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SOURCE);
  
  const program = gl.createProgram();
  if (!program) throw new Error('Failed to create program');
  
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    throw new Error(`Program linking failed: ${info}`);
  }
  
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);
  
  return program;
}

function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return [r, g, b];
}

export function createGPUTextureRenderer(width: number, height: number): GPUTextureRenderer {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const gl = canvas.getContext('webgl2', {
    antialias: false,
    powerPreference: 'high-performance',
  });
  
  if (!gl) {
    throw new Error('WebGL2 not supported');
  }
  
  const program = createProgram(gl);
  
  // Create vertex buffer
  const vertices = new Float32Array([
    -1, -1, 0, 0,
     1, -1, 1, 0,
    -1,  1, 0, 1,
     1,  1, 1, 1,
  ]);
  
  const vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
  
  // Create VAO
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  
  const positionLoc = gl.getAttribLocation(program, 'a_position');
  gl.enableVertexAttribArray(positionLoc);
  gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 16, 0);
  
  const texCoordLoc = gl.getAttribLocation(program, 'a_texCoord');
  gl.enableVertexAttribArray(texCoordLoc);
  gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, 16, 8);
  
  // Create texture
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  
  // Create framebuffer
  const framebuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
  
  if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
    throw new Error('Framebuffer incomplete');
  }
  
  // Unbind
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.bindTexture(gl.TEXTURE_2D, null);
  gl.bindVertexArray(null);
  
  // Get uniform locations
  const uniforms = {
    u_resolution: gl.getUniformLocation(program, 'u_resolution'),
    u_paperTone: gl.getUniformLocation(program, 'u_paperTone'),
    u_time: gl.getUniformLocation(program, 'u_time'),
    u_brightness: gl.getUniformLocation(program, 'u_brightness'),
    u_macroFrequency: gl.getUniformLocation(program, 'u_macroFrequency'),
    u_macroAmplitude: gl.getUniformLocation(program, 'u_macroAmplitude'),
    u_mesoFrequency: gl.getUniformLocation(program, 'u_mesoFrequency'),
    u_mesoAmplitude: gl.getUniformLocation(program, 'u_mesoAmplitude'),
    u_microFrequency: gl.getUniformLocation(program, 'u_microFrequency'),
    u_microAmplitude: gl.getUniformLocation(program, 'u_microAmplitude'),
    u_anisotropyRatio: gl.getUniformLocation(program, 'u_anisotropyRatio'),
    u_anisotropyAngle: gl.getUniformLocation(program, 'u_anisotropyAngle'),
    u_diffuseIntensity: gl.getUniformLocation(program, 'u_diffuseIntensity'),
    u_diffuseAngle: gl.getUniformLocation(program, 'u_diffuseAngle'),
    u_gradientIntensity: gl.getUniformLocation(program, 'u_gradientIntensity'),
    u_edgeDarkening: gl.getUniformLocation(program, 'u_edgeDarkening'),
  };
  
  let time = 0;
  
  function update(config: GPUTextureConfig) {
    time += 0.016; // ~60fps
    
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.viewport(0, 0, width, height);
    
    gl.useProgram(program);
    gl.bindVertexArray(vao);
    
    // Set uniforms
    gl.uniform2f(uniforms.u_resolution, config.width, config.height);
    gl.uniform3f(uniforms.u_paperTone, ...hexToRgb(config.paperTone));
    gl.uniform1f(uniforms.u_time, time);
    gl.uniform1f(uniforms.u_brightness, config.brightness / 100);
    
    // Texture parameters
    gl.uniform1f(uniforms.u_macroFrequency, config.texture.macroFrequency);
    gl.uniform1f(uniforms.u_macroAmplitude, config.texture.macroAmplitude);
    gl.uniform1f(uniforms.u_mesoFrequency, config.texture.mesoFrequency);
    gl.uniform1f(uniforms.u_mesoAmplitude, config.texture.mesoAmplitude);
    gl.uniform1f(uniforms.u_microFrequency, config.texture.microFrequency);
    gl.uniform1f(uniforms.u_microAmplitude, config.texture.microAmplitude);
    gl.uniform1f(uniforms.u_anisotropyRatio, config.texture.anisotropyRatio);
    gl.uniform1f(uniforms.u_anisotropyAngle, config.texture.anisotropyAngle);
    
    // Lighting parameters
    gl.uniform1f(uniforms.u_diffuseIntensity, config.lighting.diffuseIntensity);
    gl.uniform1f(uniforms.u_diffuseAngle, config.lighting.diffuseAngle);
    gl.uniform1f(uniforms.u_gradientIntensity, config.lighting.gradientIntensity);
    gl.uniform1f(uniforms.u_edgeDarkening, config.lighting.edgeDarkening);
    
    // Draw
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    
    // Unbind
    gl.bindVertexArray(null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }
  
  function destroy() {
    gl.deleteTexture(texture);
    gl.deleteFramebuffer(framebuffer);
    gl.deleteVertexArray(vao);
    gl.deleteBuffer(vertexBuffer);
    gl.deleteProgram(program);
  }
  
  return {
    canvas,
    gl,
    texture,
    framebuffer,
    update,
    getTexture: () => texture,
    destroy,
  };
}

// Singleton instance for shared texture
let sharedRenderer: GPUTextureRenderer | null = null;

export function getSharedGPUTextureRenderer(width: number, height: number): GPUTextureRenderer {
  if (!sharedRenderer) {
    sharedRenderer = createGPUTextureRenderer(width, height);
  }
  return sharedRenderer;
}

export function releaseSharedGPUTextureRenderer() {
  if (sharedRenderer) {
    sharedRenderer.destroy();
    sharedRenderer = null;
  }
}
