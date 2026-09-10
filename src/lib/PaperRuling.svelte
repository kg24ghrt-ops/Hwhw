<script lang="ts">
  import { mmToPx, type PaperSpec } from './paperConfig';
  import { PAPER_SPEC_A4_COLLEGE } from './paperConfig';
  
  export let spec: PaperSpec = PAPER_SPEC_A4_COLLEGE;
  export let widthPx: number;
  export let heightPx: number;
  export let dpi: number = 96;
  
  const mmToScreen = (mm: number) => mmToPx(mm, dpi);
  const lineSpacingPx = mmToScreen(spec.rulingSpacingMm);
  const marginPx = mmToScreen(spec.marginMm);
  const lineWidthPx = Math.max(1, mmToScreen(spec.ruling.lineWidthMm));
  const marginWidthPx = Math.max(1, mmToScreen(spec.ruling.marginWidthMm));
  
  const topMarginMm = 20;
  const topMarginPx = mmToScreen(topMarginMm);
  const startY = topMarginPx;
  const endY = heightPx - 10;
  const lineCount = Math.floor((endY - startY) / lineSpacingPx) + 1;
  const lines = Array.from({ length: lineCount }, (_, i) => startY + i * lineSpacingPx);
  
  function getLineStyle(y: number): string {
    const softness = spec.ruling.lineSoftness * 2;
    return `
      position: absolute;
      left: ${marginPx + marginWidthPx}px;
      right: 10px;
      top: ${y}px;
      height: ${lineWidthPx}px;
      background: ${spec.ruling.lineColor};
      opacity: ${spec.ruling.lineOpacity};
      box-shadow: 0 ${softness}px ${softness * 2}px rgba(91, 124, 153, ${spec.ruling.lineOpacity * 0.3});
    `;
  }
  
  function getMarginStyle(): string {
    const softness = spec.ruling.lineSoftness * 2;
    return `
      position: absolute;
      left: ${marginPx}px;
      top: ${startY}px;
      bottom: 10px;
      width: ${marginWidthPx}px;
      background: ${spec.ruling.marginColor};
      opacity: ${spec.ruling.marginOpacity};
      box-shadow: ${softness}px 0 ${softness * 2}px rgba(196, 90, 90, ${spec.ruling.marginOpacity * 0.3});
    `;
  }
</script>

<div class="paper-ruling">
  <div class="margin-line" style={getMarginStyle()}></div>
  {#each lines as y}
    <div class="ruled-line" style={getLineStyle(y)}></div>
  {/each}
</div>

<style>
  .paper-ruling {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    overflow: hidden;
  }
  .margin-line, .ruled-line {
    mix-blend-mode: multiply;
  }
</style>
