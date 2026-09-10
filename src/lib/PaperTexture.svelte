<script lang="ts">
  import { PAPER_SPEC_A4_COLLEGE, mmToPx, type PaperSpec } from './paperConfig';
  
  export let spec: PaperSpec = PAPER_SPEC_A4_COLLEGE;
  export let widthPx: number;
  export let heightPx: number;
  export let dpi: number = 96;
  
  let textureUrl: string | null = null;
  let textureId: string = `paper-texture-${Math.random().toString(36).substr(2, 9)}`;
  
  function generateTextureSvg(): string {
    const { texture } = spec;
    const svg = `
      <svg viewBox="0 0 ${widthPx} ${heightPx}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="${textureId}-macro" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="${texture.macroFrequency * widthPx}" numOctaves="1" seed="1" stitchTiles="stitch"/>
            <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${texture.macroAmplitude} 0"/>
          </filter>
          <filter id="${textureId}-meso" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="${texture.mesoFrequency * widthPx} ${texture.mesoFrequency * widthPx * texture.anisotropyRatio}" numOctaves="2" seed="2" stitchTiles="stitch"/>
            <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${texture.mesoAmplitude} 0"/>
          </filter>
          <filter id="${textureId}-micro" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="${texture.microFrequency * widthPx}" numOctaves="3" seed="3" stitchTiles="stitch"/>
            <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${texture.microAmplitude} 0"/>
          </filter>
          <filter id="${textureId}-aniso" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="turbulence" baseFrequency="0.001 ${texture.microFrequency * widthPx * 0.3}" numOctaves="1" seed="4" stitchTiles="stitch"/>
            <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 ${texture.microAmplitude * 0.3} 0"/>
          </filter>
        </defs>
        <rect width="${widthPx}" height="${heightPx}" fill="${spec.paperTone}"/>
        <rect width="${widthPx}" height="${heightPx}" filter="url(#${textureId}-macro)"/>
        <rect width="${widthPx}" height="${heightPx}" filter="url(#${textureId}-meso)"/>
        <rect width="${widthPx}" height="${heightPx}" filter="url(#${textureId}-micro)"/>
        <rect width="${widthPx}" height="${heightPx}" filter="url(#${textureId}-aniso)"/>
      </svg>
    `;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
  }
  
  import { onMount } from 'svelte';
  onMount(() => {
    textureUrl = generateTextureSvg();
  });
  textureUrl = generateTextureSvg();
</script>

<div class="paper-texture" style="width: {widthPx}px; height: {heightPx}px;">
  <div 
    class="texture-layer" 
    style="
      width: 100%;
      height: 100%;
      background: {textureUrl};
      background-size: cover;
      opacity: 1;
    "
  ></div>
</div>

<style>
  .paper-texture {
    position: absolute;
    top: 0;
    left: 0;
    overflow: hidden;
    pointer-events: none;
  }
  .texture-layer {
    position: absolute;
    top: 0;
    left: 0;
  }
</style>
