<script lang="ts">
  import { onMount } from 'svelte';
  import type { PaperSpec } from '../../domain/entities/Paper';
  import { handwritingRenderer, type RenderOptions } from '../../infrastructure/render/HandwritingRenderer';
  import { DEFAULT_HANDWRITING_STYLES, type HandwritingStyle } from '../../domain/entities/HandwritingStyle';

  interface Props {
    spec: PaperSpec;
    text: string;
    fontFamily: string;
    inkColor: string;
    agePreset: string;
    jitterSeed: number;
    width?: number;
    height?: number;
  }

  let {
    spec,
    text = '',
    fontFamily = 'Caveat',
    inkColor = '#1b2a52',
    agePreset = 'new',
    jitterSeed = 0,
    width = 600,
    height = 800,
  }: Props = $props();

  let canvasRef: HTMLCanvasElement;
  let renderVersion = $state(0);

  // Get handwriting style config
  const handwritingStyle = $derived(
    DEFAULT_HANDWRITING_STYLES.find(s => s.id === fontFamily) ?? DEFAULT_HANDWRITING_STYLES[0]
  );

  // Calculate metrics similar to Notebook.svelte
  const pageWidthMm = spec.widthMm;
  const pageHeightMm = spec.heightMm;
  const marginMm = spec.marginMm;
  const contentWidthMm = pageWidthMm - 2 * marginMm;
  const contentHeightMm = pageHeightMm - 2 * marginMm;
  
  // Convert to pixels (at 96 DPI base, will be scaled by devicePixelRatio in renderer)
  const mmToPx = (mm: number) => mm * 96 / 25.4;
  const contentWidthPx = mmToPx(contentWidthMm);
  const contentHeightPx = mmToPx(contentHeightMm);
  const lineHeightMm = spec.rulingSpacingMm;
  const lineHeightPx = mmToPx(lineHeightMm);
  const linesPerPage = Math.floor(contentHeightMm / lineHeightMm);
  
  // Font size based on line spacing
  const fontSize = $derived(lineHeightPx * 0.82);

  // Render to canvas whenever inputs change
  $effect(() => {
    if (!canvasRef || !text) {
      renderVersion++;
      return;
    }

    let cancelled = false;

    const render = async () => {
      // Wait for font to be loaded
      await handwritingRenderer.ensureFontLoaded(fontFamily, fontSize);
      
      if (cancelled) return;

      const renderOptions: RenderOptions = {
        text,
        fontFamily,
        fontSize,
        inkColor,
        lineHeight: lineHeightPx,
        contentWidth: contentWidthPx,
        contentHeight: contentHeightPx,
        linesPerPage,
        jitterSeed,
        handwritingStyle,
        bleedAmount: 0.2,
      };

      const canvas = handwritingRenderer.renderToCanvas(renderOptions);
      
      if (!cancelled && canvasRef) {
        // Clear and copy to our canvas
        const ctx = canvasRef.getContext('2d');
        if (ctx) {
          canvasRef.width = canvas.width;
          canvasRef.height = canvas.height;
          ctx.clearRect(0, 0, canvasRef.width, canvasRef.height);
          ctx.drawImage(canvas, 0, 0);
        }
        renderVersion++;
      }
    };

    render();

    return () => {
      cancelled = true;
    };
  });

  // Expose the canvas for export
  function getCanvas(): HTMLCanvasElement | null {
    return canvasRef;
  }

  // Expose render options for exporters
  function getRenderOptions(): RenderOptions {
    return {
      text,
      fontFamily,
      fontSize,
      inkColor,
      lineHeight: lineHeightPx,
      contentWidth: contentWidthPx,
      contentHeight: contentHeightPx,
      linesPerPage,
      jitterSeed,
      handwritingStyle,
      bleedAmount: 0.2,
    };
  }

  // Expose paper spec
  function getPaperSpec(): PaperSpec {
    return spec;
  }
</script>

<div class="paper-canvas-container" style="width: {width}px; height: {height}px;">
  <canvas 
    ref={canvasRef} 
    class="paper-canvas"
    aria-label="Handwriting preview canvas"
  ></canvas>
</div>

<style>
  .paper-canvas-container {
    position: relative;
    overflow: hidden;
  }

  .paper-canvas {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    image-rendering: -webkit-optimize-contrast;
    image-rendering: crisp-edges;
  }
</style>
