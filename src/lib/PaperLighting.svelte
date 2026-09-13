<script lang="ts">
  import { type PaperSpec } from './paperConfig';
  import { PAPER_SPEC_A4_COLLEGE } from './paperConfig';
  
  // Runes-compatible props access
  declare function $props<T>(): T;
  const { spec = PAPER_SPEC_A4_COLLEGE } = $props<{ spec?: PaperSpec }>();
  
  // Generate random seed based on paper spec for consistent but varied lighting
  const lightingSeed = $derived(Math.abs(
    spec.widthMm * 100 + spec.heightMm + spec.rulingSpacingMm * 10
  ));
  
  // Subtle random variations for realism
  const randomVariation = (seed: number, range: number = 1) => {
    // Simple pseudo-random based on seed
    const x = Math.sin(seed * 12.9898) * 43758.5453;
    return (x - Math.floor(x)) * range * 2 - range;
  };
  
  // Get noise value for organic variations
  const noise2D = (x: number, y: number, seed: number) => {
    const n = x + y * 57 + seed * 131;
    const noise = (n * (n * n * 15731 + 789221) + 1376312589) & 0x7fffffff;
    return noise / 1073741824.0 * 2 - 1;
  };
  
  function getDiffuseGradient(): string {
    const { lighting } = spec;
    const angleRad = (lighting.diffuseAngle * Math.PI) / 180;
    
    // Add subtle random offset to light position (0-5% variation)
    const offsetX = randomVariation(lightingSeed, 5);
    const offsetY = randomVariation(lightingSeed + 1, 5);
    
    const xPercent = 50 + Math.cos(angleRad) * (20 + offsetX);
    const yPercent = 50 + Math.sin(angleRad) * (20 + offsetY);
    
    // Make the diffuse highlight less perfect - add organic shape
    const shapeX = 1 + noise2D(0, 0, lightingSeed) * 0.15;
    const shapeY = 1 + noise2D(1, 0, lightingSeed) * 0.15;
    
    return `radial-gradient(
      ellipse ${shapeX * 100}% ${shapeY * 100}% at ${xPercent}% ${yPercent}%,
      rgba(255, 255, 255, ${lighting.diffuseIntensity * 0.015}) 0%,
      transparent ${lighting.diffuseIntensity * 35 + 15 + randomVariation(lightingSeed + 2, 5)}%
    )`;
  }
  
  function getDirectionalGradient(): string {
    const { lighting } = spec;
    const angle = lighting.diffuseAngle + 180 + randomVariation(lightingSeed + 3, 3);
    
    // Add subtle color variation - not pure black
    const intensity = lighting.gradientIntensity * (0.8 + randomVariation(lightingSeed + 4, 0.2));
    
    return `linear-gradient(
      ${angle}deg,
      transparent 0%,
      rgba(40, 30, 20, ${intensity}) 100%
    )`;
  }
  
  function getEdgeVignette(): string {
    const { lighting } = spec;
    
    // Make vignette less symmetrical - offset the center
    const centerX = 50 + randomVariation(lightingSeed + 5, 3);
    const centerY = 50 + randomVariation(lightingSeed + 6, 3);
    
    // Add organic shape to vignette
    const shapeX = 1 + noise2D(0, 1, lightingSeed) * 0.2;
    const shapeY = 1 + noise2D(1, 1, lightingSeed) * 0.2;
    
    return `radial-gradient(
      ellipse ${shapeX * 100}% ${shapeY * 100}% at ${centerX}% ${centerY}%,
      transparent 0%,
      transparent ${100 - lighting.edgeDarkening * 90 + randomVariation(lightingSeed + 7, 5)}%,
      rgba(30, 25, 20, ${lighting.edgeDarkening * 0.8}) 100%
    )`;
  }
  
  function getContactShadow(): string {
    const { lighting } = spec;
    const blur = lighting.contactShadowBlur;
    const opacity = lighting.contactShadowOpacity * (0.6 + randomVariation(lightingSeed + 8, 0.2));
    
    // Offset shadow slightly based on light angle
    const angleRad = (lighting.diffuseAngle * Math.PI) / 180;
    const offsetX = Math.cos(angleRad) * 2;
    const offsetY = Math.sin(angleRad) * 2;
    
    return `drop-shadow(${offsetX}px ${offsetY}px ${blur}px rgba(25, 20, 15, ${opacity}))`;
  }
  
  function getPaperWrinkles(): string {
    const { lighting } = spec;
    
    // Generate subtle wrinkle/crease patterns using SVG filters
    const wrinkleIntensity = lighting.edgeDarkening * 0.3 + randomVariation(lightingSeed + 9, 0.1);
    
    if (wrinkleIntensity < 0.01) return 'none';
    
    // Create a subtle noise pattern for paper surface variations
    return `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Cfilter id='wrinkles'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.05' numOcta[...]`;
  }
  
  function getLightFlicker(): string {
    const { lighting } = spec;
    
    // Subtle animated flicker effect (only if supported)
    if (typeof document !== 'undefined' && 'CSS' in window && 'supports' in CSS) {
      // This would need to be handled via CSS animations, but we'll keep it static for now
      return 'none';
    }
    return 'none';
  }
</script>

<div class="paper-lighting">
  <div class="light-layer diffuse" style="background: {getDiffuseGradient()};" ></div>
  <div class="light-layer directional" style="background: {getDirectionalGradient()};" ></div>
  <div class="light-layer vignette" style="background: {getEdgeVignette()};" ></div>
  
  <!-- Contact shadow for depth -->
  <div class="light-layer contact-shadow" style="filter: {getContactShadow()};" ></div>
  
  <!-- Subtle wrinkles for paper texture -->
  {#if getPaperWrinkles() !== 'none'}
    <div class="light-layer wrinkles" style="background: {getPaperWrinkles()}; background-size: 300px 300px;" ></div>
  {/if}
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
    opacity: 0.95;
  }
  .directional {
    mix-blend-mode: multiply;
    opacity: 0.75;
  }
  .vignette {
    mix-blend-mode: multiply;
    opacity: 0.9;
  }
  .contact-shadow {
    mix-blend-mode: multiply;
    opacity: 0.85;
    pointer-events: none;
  }
  .wrinkles {
    mix-blend-mode: multiply;
    opacity: 0.3;
    pointer-events: none;
  }
</style>
