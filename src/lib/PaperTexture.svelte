<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { createGPUTextureRenderer, type GPUTextureConfig, type PaperAgePreset, PAPER_AGE_PRESETS, getAgingPreset, applyAgingPreset } from './PaperTextureGPU';
  import type { PaperSpec } from './paperConfig';

  interface Props {
    spec?: PaperSpec;
    width?: number;
    height?: number;
    useGPU?: boolean;
    agePreset?: string;
  }

  let { spec, width = 800, height = 600, useGPU = true, agePreset = 'new' } = $props();
  
  let gpuRenderer = $state<any>(null);
  let canvas = $state<HTMLCanvasElement | null>(null);
  let gpuSupported = $state(true);
  let fallbackMode = $state(false);
  
  // Get the aging preset
  const currentPreset = $derived(PAPER_AGE_PRESETS.find(p => p.name === agePreset) || PAPER_AGE_PRESETS[0]);

  // Fallback SVG textures (original implementation)
  const grainTile = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter><rect width="200" height="200" filter="url(#g)"/></svg>`;
  const fiberTile = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240"><filter id="f"><feTurbulence type="fractalNoise" baseFrequency="0.014 0.28" numOctaves="2" seed="7" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter><rect width="240" height="240" filter="url(#f)"/></svg>`;

  const grainUrl = `url("data:image/svg+xml,${encodeURIComponent(grainTile)}")`;
  const fiberUrl = `url("data:image/svg+xml,${encodeURIComponent(fiberTile)}")`;

  onMount(() => {
    if (useGPU && typeof window !== 'undefined') {
      try {
        // Test WebGL2 support
        const testCanvas = document.createElement('canvas');
        const gl = testCanvas.getContext('webgl2');
        
        if (gl) {
          gpuSupported = true;
          // Create GPU renderer
          gpuRenderer = createGPUTextureRenderer(width, height);
          updateGPUTexture();
          
          // Set up a check for context loss during rendering
          const checkContextLoss = setInterval(() => {
            if (gpuRenderer?.isContextLost()) {
              console.warn('GPU context lost, falling back to SVG textures');
              gpuSupported = false;
              fallbackMode = true;
              clearInterval(checkContextLoss);
            }
          }, 1000);
        } else {
          gpuSupported = false;
          fallbackMode = true;
          console.warn('WebGL2 not supported, falling back to SVG textures');
        }
      } catch (e) {
        gpuSupported = false;
        fallbackMode = true;
        console.warn('GPU texture initialization failed:', e);
      }
    } else {
      fallbackMode = true;
    }
  });

  onDestroy(() => {
    if (gpuRenderer) {
      try {
        gpuRenderer.destroy();
      } catch (e) {
        console.warn('Error destroying GPU renderer:', e);
      }
      gpuRenderer = null;
    }
  });

  $effect(() => {
    if (gpuRenderer && spec) {
      updateGPUTexture();
    }
  });

  function updateGPUTexture() {
    if (!gpuRenderer || !spec) return;
    
    try {
      const config: GPUTextureConfig = {
        width,
        height,
        paperTone: spec.paperTone || '#faf9f6',
        ageColor: currentPreset.ageColor,
        ageIntensity: currentPreset.ageIntensity,
        yellowing: currentPreset.yellowing,
        stains: currentPreset.stains,
        stainOpacity: currentPreset.stainOpacity,
        stainScale: currentPreset.stainScale,
        grainAmount: currentPreset.grainAmount,
        texture: spec.texture || {
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
          ...spec.lighting,
          edgeDarkening: currentPreset.edgeDarkening,
        },
        brightness: currentPreset.brightness,
      };
      
      gpuRenderer.update(config);
    } catch (e) {
      console.warn('Error updating GPU texture:', e);
      fallbackMode = true;
    }
  }

  $effect(() => {
    // Update GPU renderer size when dimensions change
    if (gpuRenderer && (width !== gpuRenderer.canvas.width || height !== gpuRenderer.canvas.height)) {
      // Recreate renderer with new size
      try {
        gpuRenderer.destroy();
        gpuRenderer = createGPUTextureRenderer(width, height);
        updateGPUTexture();
      } catch (e) {
        console.warn('Error resizing GPU renderer:', e);
        fallbackMode = true;
      }
    }
  });
</script>

<div class="paper-texture">
  {#if gpuSupported && gpuRenderer && !fallbackMode}
    <canvas 
      bind:this={canvas} 
      width={width} 
      height={height}
      style="width:100%; height:100%; display:block;"
      aria-label="GPU-accelerated paper texture"
    ></canvas>
  {:else}
    <!-- Fallback SVG textures -->
    <div class="texture-layer grain" style="background-image:{grainUrl};"></div>
    <div class="texture-layer fiber" style="background-image:{fiberUrl};"></div>
  {/if}
</div>

<style>
  .paper-texture {
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
  }

  .texture-layer {
    position: absolute;
    inset: 0;
    background-repeat: repeat;
    mix-blend-mode: multiply;
  }

  .grain {
    background-size: 200px 200px;
    opacity: 0.06;
  }

  .fiber {
    background-size: 240px 240px;
    opacity: 0.045;
  }

  canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    mix-blend-mode: multiply;
    opacity: 0.85;
  }
</style>
