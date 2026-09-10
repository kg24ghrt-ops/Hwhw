<script lang="ts">
  // Realistic school notebook paper background only
  // Based on researched specifications:
  // - US Letter size: 8.5" x 11" (215.9mm x 279.4mm)
  // - College ruled: 5.5mm line spacing (~0.21875")
  // - Left margin: 1.25" (31.75mm) - red margin line
  // - Paper color: warm off-white #faf9f6
  
  // Generate realistic notebook lines based on college ruling standard
  const lineHeight = 28; // pixels at 96dpi ~ 5.5mm
  const lineCount = 40;
  const lines = Array.from({ length: lineCount }, (_, i) => i + 1);
</script>

<div class="notebook-page">
  <!-- Red margin line (national/global standard) -->
  <div class="margin-line"></div>
  
  <!-- Blue horizontal ruling lines -->
  {#each lines as num}
    <div class="ruled-line" style="top: {40 + (num - 1) * lineHeight}px;"></div>
  {/each}
</div>

<style>
  :global(body) {
    margin: 0;
    min-height: 100vh;
    /* Realistic paper base with subtle fiber texture */
    background: 
      url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='paperGrain'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23paperGrain)' opacity='0.06'/%3E%3C/svg%3E"),
      #faf9f6;
    background-blend-mode: multiply;
  }
  
  /* Realistic lighting - soft vignette */
  :global(body::after) {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    background: radial-gradient(ellipse at 50% 50%, transparent 50%, rgba(0,0,0,0.03) 100%);
    z-index: 1000;
  }

  .notebook-page {
    position: relative;
    max-width: 816px; /* US Letter at 96dpi: 8.5" */
    min-height: 1056px; /* US Letter at 96dpi: 11" */
    margin: 2rem auto;
    background: transparent;
    box-shadow: 
      0 1px 3px rgba(0,0,0,0.08),
      0 4px 12px rgba(0,0,0,0.12);
    border-radius: 2px;
    overflow: hidden;
  }

  /* Red margin line - national/global standard at 1.25" from left */
  .margin-line {
    position: absolute;
    top: 0;
    left: 96px; /* 1.25 inches at 96dpi */
    width: 2px;
    height: 100%;
    background: linear-gradient(to bottom, #dc2626 0%, #b91c1c 100%);
    opacity: 0.7;
    z-index: 1;
  }

  /* Blue horizontal ruling lines - college ruled at 5.5mm spacing */
  .ruled-line {
    position: absolute;
    left: 104px; /* Margin + small offset */
    right: 20px;
    height: 1px;
    background: linear-gradient(to right, #6b8dbf, #5b7c99);
    opacity: 0.5;
  }
</style>
