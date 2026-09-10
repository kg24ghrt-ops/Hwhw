<script lang="ts">
  // Realistic school notebook paper background using actual photographed paper texture
  // Downloaded realistic paper image from the internet for maximum authenticity
  
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
    /* Use realistic photographed paper texture from internet */
    background: 
      url('/notebook-paper.jpg') center center / cover no-repeat,
      #f7f5f0;
  }
  
  /* Realistic lighting - soft vignette for depth */
  :global(body::after) {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    background: 
      radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,0.08) 100%);
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
