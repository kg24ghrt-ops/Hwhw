<script lang="ts">
  import { PAPER_SPEC_A4_COLLEGE, type PaperSpec } from './paperConfig';
  import { computePageMetrics } from './handwriting';
  import PaperTexture from './PaperTexture.svelte';
  import PaperRuling from './PaperRuling.svelte';
  import PaperLighting from './PaperLighting.svelte';

  interface Props {
    spec?: PaperSpec;
    width?: number;
    height?: number;
    agePreset?: string;
    children?: import('svelte').Snippet;
  }

  let { spec = PAPER_SPEC_A4_COLLEGE, width = 793, height = 1123, agePreset = 'new', children }: Props = $props();

  const metrics = $derived(computePageMetrics(spec, width, height));
  const edgeWidth = $derived(Math.max(1, metrics.effectiveDpi * 0.02));
</script>

<div class="paper-object" style="width:{width}px;height:{height}px;">
  <div class="paper-substrate" style="background-color:{spec.paperTone};"></div>

  <PaperTexture spec={spec} agePreset={agePreset} />
  <PaperLighting spec={spec} />
  <PaperRuling spec={spec} widthPx={width} heightPx={height} />

  <div
    class="paper-edge"
    style="border-width:{edgeWidth}px; box-shadow: inset 0 0 {edgeWidth * 3}px rgba(0,0,0,0.05);"
  ></div>

  <div
    class="paper-content"
    style="padding:{metrics.topPx}px {metrics.rightPx}px {metrics.bottomPx}px {metrics.textLeftPx}px;"
  >
    {@render children?.()}
  </div>
</div>

<style>
  .paper-object {
    position: relative;
    overflow: hidden;
    background: #fdfcf9;
    isolation: isolate;
  }

  .paper-substrate {
    position: absolute;
    inset: 0;
  }

  .paper-edge {
    position: absolute;
    inset: 0;
    border-style: solid;
    border-color: rgba(80, 70, 55, 0.08);
    pointer-events: none;
  }

  .paper-content {
    position: relative;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
  }
</style>
