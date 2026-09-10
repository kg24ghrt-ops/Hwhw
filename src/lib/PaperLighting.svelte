<script lang="ts">
  import { type PaperSpec } from './paperConfig';
  import { PAPER_SPEC_A4_COLLEGE } from './paperConfig';
  
  export let spec: PaperSpec = PAPER_SPEC_A4_COLLEGE;
  export let widthPx: number;
  export let heightPx: number;
  
  function getDiffuseGradient(): string {
    const { lighting } = spec;
    const angleRad = (lighting.diffuseAngle * Math.PI) / 180;
    const xPercent = 50 + Math.cos(angleRad) * 20;
    const yPercent = 50 + Math.sin(angleRad) * 20;
    return `radial-gradient(
      ellipse at ${xPercent}% ${yPercent}%,
      rgba(255, 255, 255, ${lighting.diffuseIntensity * 0.02}) 0%,
      transparent ${lighting.diffuseIntensity * 40 + 20}%
    )`;
  }
  
  function getDirectionalGradient(): string {
    const { lighting } = spec;
    const angle = lighting.diffuseAngle + 180;
    return `linear-gradient(
      ${angle}deg,
      transparent 0%,
      rgba(0, 0, 0, ${lighting.gradientIntensity}) 100%
    )`;
  }
  
  function getEdgeVignette(): string {
    const { lighting } = spec;
    return `radial-gradient(
      ellipse at 50% 50%,
      transparent 0%,
      transparent ${100 - lighting.edgeDarkening * 100}%,
      rgba(0, 0, 0, ${lighting.edgeDarkening}) 100%
    )`;
  }
</script>

<div class="paper-lighting">
  <div class="light-layer diffuse" style="background: {getDiffuseGradient()};" ></div>
  <div class="light-layer directional" style="background: {getDirectionalGradient()};" ></div>
  <div class="light-layer vignette" style="background: {getEdgeVignette()};" ></div>
</div>

<style>
  .paper-lighting {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    overflow: hidden;
  }
  .light-layer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
  .diffuse {
    mix-blend-mode: overlay;
    opacity: 1;
  }
  .directional {
    mix-blend-mode: multiply;
    opacity: 0.8;
  }
  .vignette {
    mix-blend-mode: multiply;
    opacity: 1;
  }
</style>
