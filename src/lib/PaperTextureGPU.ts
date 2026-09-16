/**
 * GPU-Accelerated Paper Texture Renderer
 * Uses WebGL2 for high-performance paper texture generation
 * Supports procedural noise, fiber patterns, realistic aging, and customizable textures
 */

export interface PaperAgePreset {
  name: string;
  baseColor: string;
  ageColor: string;
  ageIntensity: number;
  yellowing: number;
  stains: number;
  stainOpacity: number;
  stainScale: number;
  grainAmount: number;
  edgeDarkening: number;
  brightness: number;
}

export interface GPUTextureConfig {
  width: number;
  height: number;
  paperTone: string;
  ageColor?: string;
  ageIntensity?: number;
  yellowing?: number;
  stains?: number;
  stainOpacity?: number;
  stainScale?: number;
  grainAmount?: number;
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
  brightness?: number;
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

// Paper age presets for realistic aging effects
export const PAPER_AGE_PRESETS: PaperAgePreset[] = [
  {
    name: 'new',
    baseColor: '#faf9f6',
    ageColor: '#faf9f6',
    ageIntensity: 0.0,
    yellowing: 0.0,
    stains: 0.0,
    stainOpacity: 0.0,
    stainScale: 0.0,
    grainAmount: 0.02,
    edgeDarkening: 0.03,
    brightness: 92,
  },
  {
    name: 'slightly_used',
    baseColor: '#f8f6f2',
    ageColor: '#f5e8d0',
    ageIntensity: 0.15,
    yellowing: 0.05,
    stains: 0.02,
    stainOpacity: 0.05,
    stainScale: 0.5,
    grainAmount: 0.03,
    edgeDarkening: 0.04,
    brightness: 88,
  },
  {
    name: 'aged',
    baseColor: '#f0e8d8',
    ageColor: '#e8d0a8',
    ageIntensity: 0.35,
    yellowing: 0.15,
    stains: 0.05,
    stainOpacity: 0.12,
    stainScale: 0.8,
    grainAmount: 0.05,
    edgeDarkening: 0.06,
    brightness: 82,
  },
  {
    name: 'vintage',
    baseColor: '#e8dcc0',
    ageColor: '#d8b880',
    ageIntensity: 0.6,
    yellowing: 0.25,
    stains: 0.12,
    stainOpacity: 0.2,
    stainScale: 1.2,
    grainAmount: 0.08,
    edgeDarkening: 0.08,
    brightness: 75,
  },
  {
    name: 'old_parchment',
    baseColor: '#d8c8a0',
    ageColor: '#c8a870',
    ageIntensity: 0.8,
    yellowing: 0.4,
    stains: 0.2,
    stainOpacity: 0.28,
    stainScale: 1.5,
    grainAmount: 0.12,
    edgeDarkening: 0.12,
    brightness: 70,
  },
  {
    name: 'antique',
    baseColor: '#c8b088',
    ageColor: '#b09060',
    ageIntensity: 1.0,
    yellowing: 0.5,
    stains: 0.3,
    stainOpacity: 0.35,
    stainScale: 2.0,
    grainAmount: 0.15,
    edgeDarkening: 0.15,
    brightness: 65,
  },
];

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
uniform vec3 u_ageColor;
uniform float u_time;
uniform float u_brightness;
uniform float u_ageIntensity;
uniform float u_yellowing;
uniform float u_stains;
uniform float u_stainOpacity;
uniform float u_stainScale;
uniform float u_grainAmount;

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

// Constants
const float PI = 3.14159265359;
const float TWO_PI = 6.28318530718;

// Noise functions
float hash(float n) {
  return fract(sin(n) * 1e4);
}

float hash(vec2 p) {
  return fract(1e4 * sin(17.0 * p.x + p.y * 0.1) * (0.1 + abs(sin(p.y * 13.0 + p.x))));
}

float hash(vec3 p) {
  return fract(1e4 * sin(17.0 * p.x + p.y * 0.1 + p.z * 0.01) * (0.1 + abs(sin(p.y * 13.0 + p.x + p.z * 0.5))));
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

// Improved noise with better distribution
float noise2(vec2 x) {
  vec2 p = floor(x);
  vec2 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  
  vec2 uv = p + f * (1.0 + 63.0 * f);
  
  float a = hash(p);
  float b = hash(p + vec2(1.0, 0.0));
  float c = hash(p + vec2(0.0, 1.0));
  float d = hash(p + vec2(1.0, 1.0));
  
  vec2 u = f * vec2(1.0, 0.0);
  vec2 v = f * vec2(0.0, 1.0);
  
  return mix(mix(a, b, u.x), mix(c, d, u.x), v.y);
}

// Paper fiber pattern with more variation
float fibers(vec2 uv, float scale, float density) {
  vec2 grid = uv * scale;
  vec2 cell = floor(grid);
  vec2 cellCoord = fract(grid);
  
  // Random parameters for each cell
  float n = hash(cell + 0.5);
  float fiberWidth = mix(0.08, 0.35, n * n);
  float fiberDir = hash(cell + vec2(0.37, 0.61)) * TWO_PI;
  
  vec2 fiberCenter = vec2(
    hash(cell + vec2(0.73, 0.29)),
    hash(cell + vec2(0.11, 0.89))
  );
  vec2 toCenter = cellCoord - fiberCenter;
  
  float dist = length(toCenter);
  vec2 fiberVec = vec2(cos(fiberDir), sin(fiberDir));
  float proj = dot(toCenter, fiberVec);
  float fiberDist = abs(proj);
  
  // Create fiber shape with soft edges
  float fiber = smoothstep(fiberWidth + 0.015, fiberWidth, fiberDist);
  fiber *= smoothstep(0.0, 0.5, 0.5 - dist);
  
  // Add some irregularity
  fiber *= 1.0 + noise2(cell * 0.3 + uv * 20.0) * 0.3;
  
  return fiber * density;
}

// Water/coffee stain effect
float stain(vec2 uv, float scale, float seed) {
  vec2 p = uv * scale * vec2(1.0, 0.8);
  
  // Create irregular blob shapes
  float n1 = noise2(p * 0.5 + seed);
  float n2 = noise2(p * 1.0 + seed * 2.0);
  float n3 = noise2(p * 2.0 + seed * 3.0);
  
  // Combine for interesting shapes
  float stainShape = n1 * n2 * (1.0 - n3 * 0.5);
  
  // Add radial falloff
  vec2 center = vec2(0.5);
  float distFromCenter = length(uv - center);
  float radial = smoothstep(0.8, 0.3, distFromCenter);
  
  // Threshold to create defined stains
  float threshold = 0.4 + hash(seed) * 0.2;
  float stainVal = smoothstep(threshold - 0.05, threshold + 0.05, stainShape * radial);
  
  // Add edge detail
  float edgeDetail = noise2(p * 10.0 + seed * 100.0) * 0.2;
  stainVal *= 1.0 + edgeDetail;
  
  return clamp(stainVal, 0.0, 1.0);
}

// Color variation for realistic paper
vec3 applyAging(vec2 uv, vec3 baseColor, vec3 ageColor, float ageIntensity, float yellowing) {
  // Calculate variation based on position and noise
  float variation = noise2(uv * 50.0) * 0.5 + 0.5;
  
  // Mix between base and age color based on intensity and variation
  vec3 agedColor = mix(baseColor, ageColor, ageIntensity * variation);
  
  // Add yellowing effect (warm tone)
  vec3 yellowTint = vec3(1.0, 0.92, 0.8);
  agedColor = mix(agedColor, agedColor * yellowTint, yellowing * variation);
  
  // Slight color noise for realism
  float colorNoise = (noise2(uv * 100.0) - 0.5) * 0.03 * ageIntensity;
  agedColor += vec3(colorNoise, colorNoise * 0.7, colorNoise * 0.4);
  
  return clamp(agedColor, 0.0, 1.0);
}

// Edge wear and tear effect
float edgeWear(vec2 uv, float intensity) {
  vec2 centerUV = uv - vec2(0.5);
  float edgeDist = length(centerUV) * 2.0;
  
  // More wear at edges
  float wear = smoothstep(0.8, 1.0, edgeDist) * intensity;
  
  // Add irregular wear patterns
  wear += noise2(uv * 100.0) * 0.1 * intensity;
  
  return clamp(wear, 0.0, 1.0);
}

// Paper texture with aging
vec3 paperTexture(vec2 uv) {
  vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
  vec2 scaledUV = uv * aspect;
  
  // Macro texture (large-scale variations)
  float macro = anisotropicNoise(scaledUV, u_macroFrequency, u_macroAmplitude,
                                  u_anisotropyRatio, u_anisotropyAngle);
  
  // Meso texture (medium-scale)
  float meso = anisotropicNoise(scaledUV, u_mesoFrequency, u_mesoAmplitude,
                                 u_anisotropyRatio, u_anisotropyAngle);
  
  // Micro texture (fine grain) - enhanced for aging
  float micro = fbm(scaledUV, u_microFrequency, u_microAmplitude * (1.0 + u_grainAmount * 2.0), 4);
  
  // Fiber pattern
  float fiberPattern = fibers(uv, 200.0, 0.3 + u_grainAmount);
  
  // Combine all layers with enhanced grain
  float texture = macro + meso + micro + (fiberPattern * 0.05);
  
  // Apply to base color with aging
  vec3 baseColor = u_paperTone;
  vec3 agedColor = applyAging(uv, baseColor, u_ageColor, u_ageIntensity, u_yellowing);
  
  // Apply texture variations
  vec3 shaded = agedColor * (1.0 + texture * (0.15 + u_grainAmount * 0.1));
  
  return shaded;
}

// Stain effects
vec3 applyStains(vec2 uv, vec3 color) {
  if (u_stains <= 0.0 || u_stainOpacity <= 0.0) {
    return color;
  }
  
  // Generate multiple stains at different scales
  float stain1 = stain(uv, u_stainScale * 0.8, 100.0);
  float stain2 = stain(uv, u_stainScale * 1.2, 200.0);
  float stain3 = stain(uv, u_stainScale * 0.5, 300.0);
  
  // Combine stains
  float totalStain = max(stain1, max(stain2, stain3));
  
  // Stain color - brownish/yellowish
  vec3 stainColor = vec3(0.6, 0.45, 0.3);
  
  // Apply stain
  vec3 stained = mix(color, stainColor, totalStain * u_stainOpacity * u_stains);
  
  // Darken slightly where stains are
  stained *= 1.0 - totalStain * u_stainOpacity * u_stains * 0.3;
  
  return stained;
}

// Lighting effects with aging
vec3 applyLighting(vec2 uv, vec3 color) {
  // Diffuse lighting
  vec2 lightDir = vec2(cos(u_diffuseAngle * PI / 180.0), 
                       sin(u_diffuseAngle * PI / 180.0));
  float diffuse = dot(vec2(0.0, 1.0), lightDir) * u_diffuseIntensity;
  
  // Gradient
  float gradient = uv.y * u_gradientIntensity;
  
  // Edge darkening (vignette) with wear
  vec2 centerUV = uv - vec2(0.5);
  float edgeDist = length(centerUV) * 2.0;
  float edgeDarken = smoothstep(0.8, 1.2, edgeDist) * u_edgeDarkening;
  
  // Edge wear effect
  float wear = edgeWear(uv, u_ageIntensity * 0.5);
  
  // Combine lighting effects
  vec3 lit = color * (diffuse + gradient + (1.0 - edgeDarken) - wear * 0.15);
  
  return lit;
}

void main() {
  vec2 uv = v_texCoord;
  
  // Generate paper texture with aging
  vec3 textureColor = paperTexture(uv);
  
  // Apply stains
  vec3 stainedColor = applyStains(uv, textureColor);
  
  // Apply lighting
  vec3 finalColor = applyLighting(uv, stainedColor);
  
  // Brightness adjustment
  finalColor = pow(finalColor, vec3(1.0 / (u_brightness / 100.0)));
  
  // Add subtle time-based variation for realism
  float timeVar = sin(u_time * 0.1) * 0.005;
  finalColor += vec3(timeVar);
  
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
    u_ageColor: gl.getUniformLocation(program, 'u_ageColor'),
    u_time: gl.getUniformLocation(program, 'u_time'),
    u_brightness: gl.getUniformLocation(program, 'u_brightness'),
    u_ageIntensity: gl.getUniformLocation(program, 'u_ageIntensity'),
    u_yellowing: gl.getUniformLocation(program, 'u_yellowing'),
    u_stains: gl.getUniformLocation(program, 'u_stains'),
    u_stainOpacity: gl.getUniformLocation(program, 'u_stainOpacity'),
    u_stainScale: gl.getUniformLocation(program, 'u_stainScale'),
    u_grainAmount: gl.getUniformLocation(program, 'u_grainAmount'),
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
  
  let isContextLost = false;
  
  // Handle WebGL context loss
  canvas.addEventListener('webglcontextlost', (event) => {
    event.preventDefault();
    isContextLost = true;
  });
  
  canvas.addEventListener('webglcontextrestored', () => {
    isContextLost = false;
  });
  
  let time = 0;
  
  function update(config: GPUTextureConfig) {
    // Check if context is lost or resources are missing
    if (isContextLost || !gl || !framebuffer || !program || !vao) {
      return;
    }
    
    time += 0.016; // ~60fps
    
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.viewport(0, 0, width, height);
    
    gl.useProgram(program);
    gl.bindVertexArray(vao);
    
    // Set uniforms
    gl.uniform2f(uniforms.u_resolution, config.width, config.height);
    gl.uniform3f(uniforms.u_paperTone, ...hexToRgb(config.paperTone));
    gl.uniform3f(uniforms.u_ageColor, ...hexToRgb(config.ageColor || config.paperTone));
    gl.uniform1f(uniforms.u_time, time);
    gl.uniform1f(uniforms.u_brightness, config.brightness || 92.0);
    
    // Aging parameters
    gl.uniform1f(uniforms.u_ageIntensity, config.ageIntensity || 0.0);
    gl.uniform1f(uniforms.u_yellowing, config.yellowing || 0.0);
    gl.uniform1f(uniforms.u_stains, config.stains || 0.0);
    gl.uniform1f(uniforms.u_stainOpacity, config.stainOpacity || 0.0);
    gl.uniform1f(uniforms.u_stainScale, config.stainScale || 1.0);
    gl.uniform1f(uniforms.u_grainAmount, config.grainAmount || 0.02);
    
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
    if (!gl) {
      return;
    }
    
    if (texture) {
      gl.deleteTexture(texture);
    }
    if (framebuffer) {
      gl.deleteFramebuffer(framebuffer);
    }
    if (vao) {
      gl.deleteVertexArray(vao);
    }
    if (vertexBuffer) {
      gl.deleteBuffer(vertexBuffer);
    }
    if (program) {
      gl.deleteProgram(program);
    }
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

// Helper function to apply aging preset to config
export function applyAgingPreset(config: GPUTextureConfig, preset: PaperAgePreset): GPUTextureConfig {
  return {
    ...config,
    paperTone: preset.baseColor,
    ageColor: preset.ageColor,
    ageIntensity: preset.ageIntensity,
    yellowing: preset.yellowing,
    stains: preset.stains,
    stainOpacity: preset.stainOpacity,
    stainScale: preset.stainScale,
    grainAmount: preset.grainAmount,
    lighting: {
      ...config.lighting,
      edgeDarkening: preset.edgeDarkening,
    },
    brightness: preset.brightness,
  };
}

// Helper to get preset by name
export function getAgingPreset(name: string): PaperAgePreset | undefined {
  return PAPER_AGE_PRESETS.find(p => p.name === name);
}
