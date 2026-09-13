# GPU-Accelerated Paper Rendering Documentation

## Overview

This document provides comprehensive information about the GPU-accelerated paper rendering system implemented in the Hwhw notebook application. It covers:

- **Paper Sizes**: Standard and custom paper dimensions
- **GPU Architecture**: WebGL2-based rendering pipeline
- **Texture Generation**: Procedural paper texture algorithms
- **Performance Optimization**: Techniques for smooth rendering
- **Integration Guide**: How to use the GPU renderer in your application

---

## Table of Contents

1. [Paper Sizes and Specifications](#1-paper-sizes-and-specifications)
2. [GPU Rendering Architecture](#2-gpu-rendering-architecture)
3. [Texture Generation](#3-texture-generation)
4. [Performance Considerations](#4-performance-considerations)
5. [API Reference](#5-api-reference)
6. [Integration Examples](#6-integration-examples)
7. [Troubleshooting](#7-troubleshooting)
8. [Future Enhancements](#8-future-enhancements)

---

## 1. Paper Sizes and Specifications

### ISO 216 Standard Paper Sizes

The application supports the following ISO 216 paper sizes with their respective specifications:

#### A Series (International Standard)

| Size | Dimensions (mm) | Dimensions (inches) | Aspect Ratio | Typical Use |
|------|----------------|-------------------|--------------|-------------|
| **A3** | 297 × 420 | 11.7 × 16.5 | 1:√2 | Large notebooks, presentations |
| **A4** | 210 × 297 | 8.27 × 11.69 | 1:√2 | Standard notebook paper |
| **A5** | 148 × 210 | 5.83 × 8.27 | 1:√2 | Pocket notebooks, organizers |
| **A6** | 105 × 148 | 4.13 × 5.83 | 1:√2 | Small notebooks, cards |

#### US Standard Paper Sizes

| Size | Dimensions (mm) | Dimensions (inches) | Typical Use |
|------|----------------|-------------------|-------------|
| **Letter** | 215.9 × 279.4 | 8.5 × 11 | Standard US notebook paper |

### Ruling Types

| Ruling | Line Spacing (mm) | Line Spacing (inches) | Lines per Page (A4) | Typical Use |
|--------|------------------|---------------------|---------------------|-------------|
| **College** | 5.5 | 7/32" (~0.219") | ~36 | Standard school notebooks |
| **Wide** | 8.7 | 8.7/32" (~0.272") | ~28 | Elementary schools, larger writing |

### Paper Characteristics

All paper types share the following base characteristics:

- **Weight**: 75-80 GSM (Grams per Square Meter)
- **Brightness**: 92% (standard office paper)
- **Opacity**: 94%
- **Finish**: Smooth
- **Color**: Natural white (#FAF9F6 - warm off-white)

#### Color Specifications

| Element | Hex Code | RGB | Description |
|---------|----------|-----|-------------|
| Paper Base | #FAF9F6 | 250, 249, 246 | Warm off-white |
| Blue Lines | #5B7C99 | 91, 124, 153 | Standard ruling blue |
| Red Margin | #C45A5A | 196, 90, 90 | Standard margin red |

### Custom Paper Size Configuration

To add a custom paper size, extend the `PaperSpec` interface:

```typescript
{
  widthMm: number;        // Width in millimeters
  heightMm: number;       // Height in millimeters
  rulingSpacingMm: number; // Line spacing in millimeters
  marginMm: number;       // Left margin in millimeters
  paperTone: string;      // Base color in hex format
  brightness: number;     // Brightness percentage (0-100)
  texture: {              // Texture parameters
    macroFrequency: number;
    macroAmplitude: number;
    mesoFrequency: number;
    mesoAmplitude: number;
    microFrequency: number;
    microAmplitude: number;
    anisotropyRatio: number;
    anisotropyAngle: number;
  };
  lighting: {             // Lighting parameters
    diffuseIntensity: number;
    diffuseAngle: number;
    gradientIntensity: number;
    edgeDarkening: number;
    contactShadowOpacity: number;
    contactShadowBlur: number;
  };
  edge: {                 // Edge parameters
    edgeDarkening: number;
    edgeVariation: number;
    edgeThickness: number;
  };
  ruling: {              // Ruling parameters
    lineColor: string;
    lineOpacity: number;
    lineWidthMm: number;
    lineSoftness: number;
    marginColor: string;
    marginOpacity: number;
    marginWidthMm: number;
  };
}
```

---

## 2. GPU Rendering Architecture

### System Overview

The GPU-accelerated rendering system uses **WebGL2** to generate high-quality paper textures in real-time. This provides several advantages over CPU-based rendering:

1. **Performance**: GPU parallel processing enables fast texture generation
2. **Quality**: Higher precision calculations for more realistic textures
3. **Memory Efficiency**: Textures are generated and stored on the GPU
4. **Scalability**: Resolution-independent rendering

### Architecture Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                          │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    │
│  │   Notebook   │    │   Paper      │    │   Controls   │    │
│  │   Component  │◄───►│   Component  │◄───►│   Component  │    │
│  └─────────────┘    └─────────────┘    └─────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    GPU Rendering Layer                        │
│  ┌─────────────────────────────────────────────────────────┐│
│  │              PaperTextureGPU.ts                           ││
│  │  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐  ││
│  │  │ Vertex       │    │ Fragment     │    │ Framebuffer  │  ││
│  │  │ Shader       │    │ Shader       │    │ & Texture    │  ││
│  │  └─────────────┘    └─────────────┘    └─────────────┘  ││
│  │  ┌─────────────────────────────────────────────────────┐││
│  │  │                    WebGL2 Context                      │││
│  │  └─────────────────────────────────────────────────────┘││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Browser Graphics Pipeline                   │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    │
│  │    CPU      │    │    GPU      │    │   Display   │    │
│  │  JavaScript │────►│  Shaders    │────►│   Output    │    │
│  └─────────────┘    └─────────────┘    └─────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Shader Pipeline

#### Vertex Shader
- **Purpose**: Transforms 2D coordinates to clip space
- **Input**: Position and texture coordinates
- **Output**: Transformed position and interpolated texture coordinates

#### Fragment Shader
- **Purpose**: Generates paper texture for each pixel
- **Features**:
  - Procedural noise generation (fBM - Fractional Brownian Motion)
  - Anisotropic filtering for realistic paper grain
  - Fiber pattern simulation
  - Dynamic lighting effects
  - Edge darkening (vignette)

### Rendering Process

1. **Initialization**: Create WebGL2 context, compile shaders, set up buffers
2. **Configuration**: Pass paper specifications to shader uniforms
3. **Rendering**: Draw full-screen quad with texture shader
4. **Output**: Generate texture for use in paper component

---

## 3. Texture Generation

### Procedural Noise Algorithms

The system uses multiple layers of noise to create realistic paper textures:

#### 1. Macro Texture (Large Scale)
- **Frequency**: ~0.0004-0.0006
- **Amplitude**: ~0.01-0.012
- **Purpose**: Large-scale paper variations and shading

#### 2. Meso Texture (Medium Scale)
- **Frequency**: ~0.0018-0.0022
- **Amplitude**: ~0.025-0.035
- **Purpose**: Medium-scale fiber patterns

#### 3. Micro Texture (Fine Scale)
- **Frequency**: ~0.018-0.022
- **Amplitude**: ~0.018-0.025
- **Purpose**: Fine grain and surface detail

### Anisotropic Filtering

Paper fibers typically align in one direction. The system simulates this with:

```glsl
float anisotropicNoise(vec2 p, float frequency, float amplitude, float ratio, float angle) {
  mat2 rotation = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
  vec2 scaled = p * vec2(frequency, frequency * ratio);
  vec2 rotated = scaled * rotation;
  return fbm(rotated, 1.0, amplitude, 4);
}
```

- **Ratio**: Controls the stretch of noise in one direction (typically 1.1-1.2)
- **Angle**: Rotation of the anisotropy axis

### Fiber Pattern Generation

Realistic paper fibers are simulated using:

```glsl
float fibers(vec2 uv, float scale, float density) {
  vec2 grid = uv * scale;
  vec2 cell = floor(grid);
  vec2 cellCoord = fract(grid);
  
  // Random parameters for each cell
  float fiberWidth = mix(0.1, 0.4, hash(cell + 0.5));
  float fiberDir = hash(cell + vec2(0.37, 0.61)) * PI * 2.0;
  
  // Calculate distance to fiber
  vec2 fiberCenter = vec2(hash(cell + vec2(0.73, 0.29)), hash(cell + vec2(0.11, 0.89)));
  vec2 toCenter = cellCoord - fiberCenter;
  vec2 fiberVec = vec2(cos(fiberDir), sin(fiberDir));
  float fiberDist = abs(dot(toCenter, fiberVec));
  
  // Create fiber shape
  float fiber = smoothstep(fiberWidth + 0.01, fiberWidth, fiberDist);
  return fiber;
}
```

### Lighting Model

The lighting system simulates:

1. **Diffuse Lighting**: Directional light source
2. **Gradient**: Vertical color gradient
3. **Edge Darkening**: Vignette effect at paper edges
4. **Brightness Adjustment**: Gamma correction

---

## 4. Performance Considerations

### GPU Memory Management

- **Texture Size**: Default render target matches paper dimensions
- **Precision**: Uses `highp` precision for all calculations
- **Antialiasing**: Disabled for performance (not needed for texture generation)

### Optimization Techniques

1. **Shared Renderer**: Singleton pattern for GPU renderer to avoid duplicate contexts
2. **Lazy Initialization**: WebGL context created only when needed
3. **Efficient Uniform Updates**: Only update uniforms that have changed
4. **Power Preference**: Uses `high-performance` WebGL context attribute

### Performance Metrics

| Resolution | Target FPS | Estimated Memory | Render Time |
|-----------|------------|-----------------|-------------|
| 800×600 | 60 | ~8MB | <2ms |
| 1200×900 | 60 | ~16MB | <3ms |
| 1920×1080 | 30 | ~32MB | <5ms |

### Fallback Mechanism

If WebGL2 is not available:
1. Attempt to use WebGL1 with polyfilled features
2. Fall back to CPU-based SVG texture generation
3. Use static pre-generated textures

---

## 5. API Reference

### `PaperTextureGPU.ts`

#### Types

```typescript
interface GPUTextureConfig {
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

interface GPUTextureRenderer {
  canvas: HTMLCanvasElement;
  gl: WebGL2RenderingContext;
  texture: WebGLTexture | null;
  framebuffer: WebGLFramebuffer | null;
  update: (config: GPUTextureConfig) => void;
  getTexture: () => WebGLTexture | null;
  destroy: () => void;
}
```

#### Functions

```typescript
// Create a new GPU texture renderer
function createGPUTextureRenderer(width: number, height: number): GPUTextureRenderer

// Get shared renderer instance (singleton)
function getSharedGPUTextureRenderer(width: number, height: number): GPUTextureRenderer

// Release shared renderer
function releaseSharedGPUTextureRenderer(): void
```

### `paperConfig.ts`

#### Paper Specifications

```typescript
// A4 College Ruled
PAPER_SPEC_A4_COLLEGE: PaperSpec

// A4 Wide Ruled
PAPER_SPEC_A4_WIDE: PaperSpec

// A5 College Ruled
PAPER_SPEC_A5_COLLEGE: PaperSpec

// A5 Wide Ruled
PAPER_SPEC_A5_WIDE: PaperSpec

// A3 College Ruled
PAPER_SPEC_A3_COLLEGE: PaperSpec

// A6 College Ruled
PAPER_SPEC_A6_COLLEGE: PaperSpec

// US Letter College Ruled
PAPER_SPEC_LETTER_COLLEGE: PaperSpec

// US Letter Wide Ruled
PAPER_SPEC_LETTER_WIDE: PaperSpec
```

#### Paper Variants

```typescript
PAPER_VARIANTS: PaperVariant[]
// Array of all available paper types with their IDs and labels
```

#### Utility Functions

```typescript
// Convert millimeters to pixels at specified DPI
function mmToPx(mm: number, dpi: number = 96): number

// Get aspect ratio of a paper specification
function getAspectRatio(spec: PaperSpec): number
```

---

## 6. Integration Examples

### Basic GPU Texture Usage

```typescript
import { createGPUTextureRenderer, type GPUTextureConfig } from './lib/PaperTextureGPU';
import { PAPER_SPEC_A4_COLLEGE } from './lib/paperConfig';

// Create renderer
const renderer = createGPUTextureRenderer(800, 600);

// Configure texture
const config: GPUTextureConfig = {
  width: 800,
  height: 600,
  paperTone: PAPER_SPEC_A4_COLLEGE.paperTone,
  texture: PAPER_SPEC_A4_COLLEGE.texture,
  lighting: PAPER_SPEC_A4_COLLEGE.lighting,
};

// Generate texture
renderer.update(config);

// Get the WebGL texture for rendering
const texture = renderer.getTexture();

// Clean up when done
renderer.destroy();
```

### Integration with Svelte Component

```svelte
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { getSharedGPUTextureRenderer, type GPUTextureConfig } from './lib/PaperTextureGPU';
  import type { PaperSpec } from './lib/paperConfig';

  interface Props {
    spec: PaperSpec;
    width: number;
    height: number;
  }

  let { spec, width, height }: Props = $props();
  let renderer = $state<GPUTextureRenderer | null>(null);

  onMount(() => {
    // Get shared renderer
    renderer = getSharedGPUTextureRenderer(width, height);
    
    // Update with current spec
    updateTexture();
  });

  onDestroy(() => {
    // Release renderer
    if (renderer) {
      renderer.destroy();
      renderer = null;
    }
  });

  $effect(() => {
    // Update texture when spec changes
    updateTexture();
  });

  function updateTexture() {
    if (!renderer) return;
    
    const config: GPUTextureConfig = {
      width,
      height,
      paperTone: spec.paperTone,
      texture: spec.texture,
      lighting: spec.lighting,
    };
    
    renderer.update(config);
  }
</script>

<canvas bind:this={renderer?.canvas} style="width:100%; height:100%;" />
```

### Adding Custom Paper Size

```typescript
// In paperConfig.ts

export const PAPER_SPEC_CUSTOM: PaperSpec = {
  widthMm: 150,        // Custom width
  heightMm: 200,       // Custom height
  rulingSpacingMm: 6,  // Custom line spacing
  marginMm: 20,        // Custom margin
  paperTone: '#f8f7f4', // Custom color
  brightness: 90,
  texture: {
    macroFrequency: 0.0005,
    macroAmplitude: 0.01,
    mesoFrequency: 0.002,
    mesoAmplitude: 0.03,
    microFrequency: 0.02,
    microAmplitude: 0.02,
    anisotropyRatio: 1.15,
    anisotropyAngle: 0,
  },
  lighting: {
    diffuseIntensity: 0.95,
    diffuseAngle: -30,
    gradientIntensity: 0.02,
    edgeDarkening: 0.03,
    contactShadowOpacity: 0.02,
    contactShadowBlur: 8,
  },
  edge: {
    edgeDarkening: 0.015,
    edgeVariation: 0.008,
    edgeThickness: 0.1,
  },
  ruling: {
    lineColor: '#5b7c99',
    lineOpacity: 0.45,
    lineWidthMm: 0.08,
    lineSoftness: 0.3,
    marginColor: '#c45a5a',
    marginOpacity: 0.55,
    marginWidthMm: 0.15,
  },
};

// Add to variants
PAPER_VARIANTS.push({
  id: 'custom',
  label: 'Custom Paper',
  spec: PAPER_SPEC_CUSTOM,
});
```

---

## 7. Troubleshooting

### Common Issues

#### WebGL2 Not Supported

**Symptoms**: Application fails to initialize GPU renderer

**Solutions**:
1. Check browser compatibility (Chrome, Firefox, Edge, Safari 15+ support WebGL2)
2. Update graphics drivers
3. Enable WebGL in browser settings
4. Fall back to WebGL1 or CPU rendering

**Detection**:
```javascript
const canvas = document.createElement('canvas');
const gl = canvas.getContext('webgl2');
if (!gl) {
  console.warn('WebGL2 not supported, falling back to WebGL1');
  // Attempt WebGL1 fallback
}
```

#### Texture Artifacts

**Symptoms**: Strange patterns or artifacts in rendered texture

**Causes**:
- Floating point precision issues
- Incorrect shader compilation
- Texture filtering problems

**Solutions**:
1. Check shader compilation logs
2. Verify texture parameters (min/mag filters)
3. Adjust precision qualifiers in shaders
4. Ensure framebuffer completeness

#### Performance Issues

**Symptoms**: Low frame rate, stuttering

**Causes**:
- Large texture sizes
- Complex shader operations
- Too many uniform updates

**Solutions**:
1. Reduce texture resolution
2. Simplify shader code
3. Batch uniform updates
4. Use shared renderer instance

### Debugging Tools

1. **WebGL Inspector**: Browser extension for debugging WebGL contexts
2. **Chrome DevTools**: Canvas tab for inspecting WebGL calls
3. **Shader Editor**: Online tools for testing GLSL shaders
4. **Performance Profiler**: Identify rendering bottlenecks

---

## 8. Future Enhancements

### Planned Features

1. **Dynamic Resolution Scaling**: Automatically adjust texture resolution based on device capabilities
2. **Texture Caching**: Cache generated textures to avoid recomputation
3. **Multi-Layer Rendering**: Separate passes for texture, ruling, and ink
4. **Custom Shader Support**: Allow users to define custom shader programs
5. **3D Paper Effect**: Simulate paper curl and depth
6. **Ink Bleed Simulation**: Realistic ink absorption on paper
7. **Watercolor Effects**: Wet-on-wet simulation for artistic rendering

### Performance Improvements

1. **Compute Shaders**: Use WebGL2 compute shaders for texture generation
2. **Texture Atlases**: Combine multiple textures into a single atlas
3. **Mipmapping**: Generate mipmaps for better quality at different scales
4. **Compression**: Use compressed texture formats where supported

### User Experience

1. **Real-time Customization**: Live preview of texture parameters
2. **Presets**: Pre-defined texture styles (old paper, parchment, etc.)
3. **Export**: Save generated textures as images
4. **Import**: Load custom textures from images

---

## Appendix A: GLSL Shader Reference

### Built-in Functions

| Function | Description |
|----------|-------------|
| `fract(x)` | Fractional part of x |
| `floor(x)` | Floor of x |
| `mix(a, b, t)` | Linear interpolation |
| `smoothstep(edge0, edge1, x)` | Smooth Hermite interpolation |
| `length(v)` | Vector length |
| `dot(a, b)` | Dot product |
| `normalize(v)` | Normalize vector |
| `cos(x)` | Cosine |
| `sin(x)` | Sine |
| `pow(x, y)` | Power function |

### Custom Functions

```glsl
// Hash function for pseudo-random numbers
float hash(float n) {
  return fract(sin(n) * 1e4);
}

// 2D hash function
float hash(vec2 p) {
  return fract(1e4 * sin(17.0 * p.x + p.y * 0.1) * (0.1 + abs(sin(p.y * 13.0 + p.x))));
}

// 2D noise function
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
```

---

## Appendix B: Paper Size Reference

### ISO 216 A Series

| Size | Dimensions (mm) | Dimensions (inches) | Area (m²) |
|------|----------------|-------------------|-----------|
| A0 | 841 × 1189 | 33.1 × 46.8 | 1.000 |
| A1 | 594 × 841 | 23.4 × 33.1 | 0.500 |
| A2 | 420 × 594 | 16.5 × 23.4 | 0.250 |
| A3 | 297 × 420 | 11.7 × 16.5 | 0.125 |
| A4 | 210 × 297 | 8.27 × 11.69 | 0.0625 |
| A5 | 148 × 210 | 5.83 × 8.27 | 0.03125 |
| A6 | 105 × 148 | 4.13 × 5.83 | 0.015625 |
| A7 | 74 × 105 | 2.91 × 4.13 | 0.0078125 |
| A8 | 52 × 74 | 2.05 × 2.91 | 0.00390625 |

### US Paper Sizes

| Size | Dimensions (inches) | Dimensions (mm) | Typical Use |
|------|-------------------|----------------|-------------|
| Letter | 8.5 × 11 | 215.9 × 279.4 | Business, academic |
| Legal | 8.5 × 14 | 215.9 × 355.6 | Legal documents |
| Tabloid | 11 × 17 | 279.4 × 431.8 | Newspapers |
| Executive | 7.25 × 10.5 | 184.15 × 266.7 | Business |

---

## Appendix C: Ruling Specifications

### Standard Ruling Patterns

| Pattern | Line Spacing | Description |
|---------|--------------|-------------|
| College | 7/32" (5.5mm) | Most common for US school notebooks |
| Wide | 8.7/32" (8.7mm) | Elementary schools, larger writing |
| Narrow | 6/32" (4.75mm) | More lines per page |
| Quad | 4×4 grid | Graph paper |
| Dotted | Variable | Dots instead of lines |

### Margin Specifications

| Type | Left Margin | Top Margin | Right Margin | Bottom Margin |
|------|-------------|------------|--------------|---------------|
| Standard | 1.25" (31.75mm) | 0.79" (20mm) | 0.79" (20mm) | 0.79" (20mm) |
| Narrow | 0.75" (19mm) | 0.5" (12.7mm) | 0.5" (12.7mm) | 0.5" (12.7mm) |
| Wide | 1.5" (38.1mm) | 1" (25.4mm) | 1" (25.4mm) | 1" (25.4mm) |

---

## Support

For issues, questions, or contributions:

- **Repository**: [kg24ghrt-ops/Hwhw](https://github.com/kg24ghrt-ops/Hwhw)
- **Issues**: Report bugs and request features
- **Contributions**: Pull requests welcome

---

*Documentation generated for Hwhw Notebook Application*
*Last updated: 2024*
*Version: 1.0*
