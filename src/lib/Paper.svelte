<script lang="ts">
  import { onMount, afterUpdate } from 'svelte';
  import { PAPER_SPEC_A4_COLLEGE, mmToPx, getAspectRatio, DEBUG_PAPER_GEOMETRY, type PaperSpec } from './paperConfig';
  
  export let spec: PaperSpec = PAPER_SPEC_A4_COLLEGE;
  export let dpi: number = 96;
  
  let containerWidth: number = 0;
  let containerHeight: number = 0;
  let paperWidth: number = 0;
  let paperHeight: number = 0;
  
  const aspectRatio = getAspectRatio(spec);
  let container: HTMLDivElement;
  
  let topPadding = 0;
  let leftPadding = 0;
  let rightPadding = 0;
  
  // Realistic notebook paper image from Unsplash
  const notebookPaperImage = "https://images.unsplash.com/photo-1596541223130-5d31a73fb6c6?w=1200&q=80";
  
  function calculateDimensions() {
    if (!container) return;
    const rect = container.getBoundingClientRect();
    containerWidth = rect.width;
    containerHeight = rect.height;
    
    const marginRatio = 0.05;
    const availableWidth = containerWidth * (1 - marginRatio * 2);
    const availableHeight = containerHeight * (1 - marginRatio * 2);
    
    const widthBasedHeight = availableWidth / aspectRatio;
    const heightBasedWidth = availableHeight * aspectRatio;
    
    if (widthBasedHeight <= availableHeight) {
      paperWidth = availableWidth;
      paperHeight = widthBasedHeight;
    } else {
      paperWidth = heightBasedWidth;
      paperHeight = availableHeight;
    }
    
    topPadding = mmToPx(20, dpi);
    leftPadding = mmToPx(spec.marginMm + 5, dpi);
    rightPadding = mmToPx(20, dpi);
  }
  
  function handleResize() {
    calculateDimensions();
  }
  
  onMount(() => {
    calculateDimensions();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  });
  
  afterUpdate(() => {
    calculateDimensions();
  });
</script>

<div class="paper-container" bind:this={container}>
  {#if DEBUG_PAPER_GEOMETRY}
    <div class="debug-overlay">
      <div class="debug-info">
        <div>Physical: {spec.widthMm}mm &times; {spec.heightMm}mm</div>
        <div>Screen: {paperWidth.toFixed(1)}px &times; {paperHeight.toFixed(1)}px</div>
        <div>Aspect Ratio: {aspectRatio.toFixed(4)}</div>
        <div>DPI: {dpi}</div>
        <div>Ruling: {spec.rulingSpacingMm}mm spacing</div>
        <div>Margin: {spec.marginMm}mm</div>
      </div>
      <div class="debug-measurements">
        <div class="debug-line h-25" style="top: {paperHeight * 0.25}px;"></div>
        <div class="debug-line h-50" style="top: {paperHeight * 0.5}px;"></div>
        <div class="debug-line h-75" style="top: {paperHeight * 0.75}px;"></div>
        <div class="debug-line v-25" style="left: {paperWidth * 0.25}px;"></div>
        <div class="debug-line v-50" style="left: {paperWidth * 0.5}px;"></div>
        <div class="debug-line v-75" style="left: {paperWidth * 0.75}px;"></div>
      </div>
    </div>
  {/if}
  
  <div class="environment">
    <div 
      class="contact-shadow"
      style="
        width: {paperWidth}px;
        height: {paperHeight}px;
        box-shadow: 0 {spec.lighting.contactShadowBlur}px 
          {spec.lighting.contactShadowBlur * 2}px 
          rgba(0, 0, 0, {spec.lighting.contactShadowOpacity});
      "
    ></div>
  </div>
  
  <!-- Realistic notebook paper image background -->
  <div 
    class="notebook-paper-bg"
    style="
      width: {paperWidth}px;
      height: {paperHeight}px;
      background-image: url('{notebookPaperImage}');
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
    "
  ></div>
  
  <div 
    class="paper-object"
    style="
      width: {paperWidth}px;
      height: {paperHeight}px;
    "
  >
    <div 
      class="paper-substrate"
      style="background-color: {spec.paperTone};"
    ></div>
    
    <div 
      class="paper-edge"
      style="
        width: 100%;
        height: 100%;
        border: {mmToPx(spec.edge.edgeThickness, dpi)}px solid 
          rgba(0, 0, 0, {spec.edge.edgeDarkening});
        box-shadow: 
          inset 0 0 {mmToPx(spec.edge.edgeThickness * 2, dpi)}px 
          rgba(0, 0, 0, {spec.edge.edgeDarkening * 0.5});
      "
    ></div>
    
    <div 
      class="paper-content"
      style="
        padding: {topPadding}px;
        padding-left: {leftPadding}px;
        padding-right: {rightPadding}px;
      "
    >
      <slot />
    </div>
  </div>
</div>

<style>
  .paper-container {
    position: relative;
    width: 100%;
    height: 100%;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    background: #e8e6e1;
  }
  
  .environment {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .contact-shadow {
    position: relative;
    border-radius: 0;
    transform: translateY(2px);
  }
  
  .paper-object {
    position: relative;
    overflow: hidden;
    border-radius: 0.5px;
  }
  
  .paper-substrate {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
  
  .notebook-paper-bg {
    position: absolute;
    top: 0;
    left: 0;
    pointer-events: none;
    z-index: 1;
  }
  
  .paper-edge {
    position: absolute;
    top: 0;
    left: 0;
    pointer-events: none;
  }
  
  .paper-content {
    position: relative;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    overflow-y: auto;
    z-index: 10;
    background-color: rgba(255, 255, 255, 0.85);
  }
  
  .debug-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 1000;
  }
  
  .debug-info {
    position: absolute;
    top: 10px;
    left: 10px;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    font-family: monospace;
    font-size: 11px;
    padding: 8px;
    border-radius: 4px;
    line-height: 1.4;
    pointer-events: auto;
  }
  
  .debug-measurements {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
  
  .debug-line {
    position: absolute;
    background: rgba(255, 0, 0, 0.3);
    pointer-events: none;
  }
  
  .debug-line.h-25,
  .debug-line.h-50,
  .debug-line.h-75 {
    width: 100%;
    height: 1px;
    left: 0;
  }
  
  .debug-line.v-25,
  .debug-line.v-50,
  .debug-line.v-75 {
    width: 1px;
    height: 100%;
    top: 0;
  }
</style>
