<script lang="ts">
  import { PAPER_SPEC_A4_COLLEGE, type PaperSpec } from './paperConfig';
  import { computePageMetrics } from './handwriting';

  interface Props {
    spec?: PaperSpec;
    widthPx: number;
    heightPx: number;
  }

  let { spec = PAPER_SPEC_A4_COLLEGE, widthPx, heightPx }: Props = $props();

  const metrics = $derived(computePageMetrics(spec, widthPx, heightPx));

  const lines = $derived.by(() => {
    const result: number[] = [];
    for (let i = 0; i < metrics.linesPerPage; i++) {
      result.push(metrics.topPx + (i + 1) * metrics.lineSpacing);
    }
    return result;
  });

  const lineWidth = $derived(Math.max(1, metrics.effectiveDpi * 0.008));
  const marginWidth = $derived(Math.max(1, metrics.effectiveDpi * 0.012));
</script>

<div class="paper-ruling">
  <div
    class="margin-line"
    style="left:{metrics.marginPx}px; top:{metrics.topPx - metrics.lineSpacing * 0.6}px; width:{marginWidth}px; background:{spec.ruling.marginColor}; opacity:{spec.ruling.marginOpacity};"
  ></div>

  {#each lines as y}
    <div
      class="ruled-line"
      style="left:{metrics.marginPx + 2}px; top:{y}px; height:{lineWidth}px; background:{spec.ruling.lineColor}; opacity:{spec.ruling.lineOpacity};"
    ></div>
  {/each}
</div>

<style>
  .paper-ruling {
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
  }

  .margin-line,
  .ruled-line {
    position: absolute;
    mix-blend-mode: multiply;
  }

  .margin-line {
    bottom: 12px;
    border-radius: 1px;
  }

  .ruled-line {
    right: 7px;
    border-radius: 1px;
  }
</style>
