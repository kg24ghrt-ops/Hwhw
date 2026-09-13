<script lang="ts">
  const grainTile = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter><rect width="200" height="200" filter="url(#g)"/></svg>`;
  const fiberTile = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240"><filter id="f"><feTurbulence type="fractalNoise" baseFrequency="0.014 0.28" numOctaves="2" seed="7" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter><rect width="240" height="240" filter="url(#f)"/></svg>`;

  const grainUrl = `url("data:image/svg+xml,${encodeURIComponent(grainTile)}")`;
  const fiberUrl = `url("data:image/svg+xml,${encodeURIComponent(fiberTile)}")`;
</script>

<div class="paper-texture">
  <div class="texture-layer grain" style="background-image:{grainUrl};"></div>
  <div class="texture-layer fiber" style="background-image:{fiberUrl};"></div>
</div>

<style>
  .paper-texture {
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
  }

  .texture-layer {
    position: absolute;
    inset: 0;
    background-repeat: repeat;
    mix-blend-mode: multiply;
  }

  .grain {
    background-size: 200px 200px;
    opacity: 0.06;
  }

  .fiber {
    background-size: 240px 240px;
    opacity: 0.045;
  }
</style>
