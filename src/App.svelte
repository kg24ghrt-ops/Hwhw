<script lang="ts">
  import { onMount } from 'svelte';
  import Notebook from './lib/Notebook.svelte';
  import { PAPER_VARIANTS } from './lib/paperConfig';
  import { DEFAULT_HANDWRITING_STYLES } from './domain/entities/HandwritingStyle';
  import { editorStore } from './presentation/stores/editorStore';
  import { themeStore } from './presentation/stores/themeStore';
  import ThemeSwitcher from './presentation/components/ThemeSwitcher.svelte';
  import FontPicker from './presentation/components/FontPicker.svelte';
  import { pngExporter } from './infrastructure/export/PngExporter';
  import { svgExporter } from './infrastructure/export/SvgExporter';
  
  const INKS = [
    { id: 'blue', color: '#1b2a52', label: 'Blue ink' },
    { id: 'black', color: '#1c1c1e', label: 'Black ink' },
    { id: 'red', color: '#8f1f1f', label: 'Red ink' },
    { id: 'green', color: '#1f4d33', label: 'Green ink' },
    { id: 'cream', color: '#f5deb3', label: 'Cream ink (dark paper)' },
    { id: 'white', color: '#f8f8f8', label: 'White ink (dark paper)' },
    { id: 'cyan', color: '#00ffff', label: 'Cyan ink (blueprint)' },
    { id: 'amber', color: '#ffbf00', label: 'Amber ink (night grid)' },
  ];
  
  const AGE_PRESETS = [
    { id: 'new', label: 'New' },
    { id: 'slightly_used', label: 'Slightly Used' },
    { id: 'aged', label: 'Aged' },
    { id: 'vintage', label: 'Vintage' },
    { id: 'old_parchment', label: 'Old Parchment' },
    { id: 'antique', label: 'Antique' },
  ];

  let loaded = $state(false);
  let desk: HTMLElement;
  let exportStatus = $state<'idle' | 'exporting'>('idle');
  let exportFormat = $state<'png' | 'svg'>('png');
  
  // Sync with editor store
  const text = $derived(editorStore.text);
  const paperId = $derived(editorStore.paperId);
  const handwritingStyleId = $derived(editorStore.handwritingStyleId);
  const inkColor = $derived(editorStore.inkColor);
  const agePreset = $derived(editorStore.agePreset);
  const jitterSeed = $derived(editorStore.jitterSeed);
  
  const spec = $derived(PAPER_VARIANTS.find((variant) => variant.id === paperId)?.spec ?? PAPER_VARIANTS[0].spec);

  onMount(async () => {
    await editorStore.load();
    loaded = true;
  });

  function clearPage() {
    if (text.length === 0) return;
    if (confirm('Erase everything and start a fresh page?')) {
      editorStore.clearPage();
    }
  }

  async function downloadExport() {
    exportStatus = 'exporting';
    try {
      const pages = desk?.querySelector('.pages') as HTMLElement | null;
      if (!pages) {
        alert('No pages to export');
        return;
      }

      // Get the first page for export (in a real app, you'd export all pages)
      const firstPage = pages.querySelector('.page-slot');
      if (!firstPage) {
        alert('No page found');
        return;
      }

      // For now, use the existing DOM-based export
      // TODO: Replace with canvas-based export using PaperCanvas component
      const inkLayer = firstPage.querySelector('.ink-layer') as HTMLElement;
      if (!inkLayer) {
        alert('No content to export');
        return;
      }

      // Create a temporary canvas for export
      const rect = inkLayer.getBoundingClientRect();
      const canvas = document.createElement('canvas');
      const dpr = window.devicePixelRatio || 1;
      const scale = dpr * 2;
      canvas.width = Math.ceil(rect.width * scale);
      canvas.height = Math.ceil(rect.height * scale);
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        alert('Failed to create canvas context');
        return;
      }

      // Draw paper background
      ctx.fillStyle = spec.paperTone;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Use html2canvas for DOM capture (temporary solution)
      // TODO: Replace with HandwritingRenderer-based export
      const html2canvas = (await import('html2canvas')).default;
      const exportedCanvas = await html2canvas(inkLayer, {
        backgroundColor: spec.paperTone,
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
      });

      // Composite the exported content over paper background
      ctx.drawImage(exportedCanvas, 0, 0, canvas.width, canvas.height);

      // Trigger download
      const blob: Blob | null = await new Promise((resolve) => {
        canvas.toBlob(resolve, 'image/png', 1.0);
      });

      if (!blob) {
        alert('Failed to generate PNG');
        return;
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      a.href = url;
      a.download = `notebook-${timestamp}.png`;
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        URL.revokeObjectURL(url);
        a.remove();
      }, 1000);

    } catch (error) {
      console.error('Export failed:', error);
      alert(`Export failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      exportStatus = 'idle';
    }
  }
</script>

<div class="app">
  <header class="brand">
    <span class="brand-mark">Notebook</span>
    <span class="brand-sub">paper you can type on</span>
    <div class="brand-controls">
      <ThemeSwitcher />
    </div>
  </header>

  <main class="desk" bind:this={desk}>
    <Notebook 
      {spec} 
      text={text} 
      fontFamily={handwritingStyleId} 
      inkColor={inkColor}
      agePreset={agePreset}
      ontext={(e) => editorStore.setText(e.detail.value)}
    />
  </main>

  <footer class="tray" aria-label="Stationery">
    <FontPicker 
      selectedFont={handwritingStyleId}
      onFontChange={(fontId) => editorStore.setHandwritingStyleId(fontId)}
    />

    <div class="tray-group">
      <span class="tray-label">Ink</span>
      <div class="swatches">
        {#each INKS as option (option.id)}
          <button
            type="button"
            class="swatch"
            class:active={inkColor === option.color}
            style="background:{option.color};"
            title={option.label}
            aria-label={option.label}
            onclick={() => editorStore.setInkColor(option.color)}
          ></button>
        {/each}
      </div>
    </div>

    <label class="tray-group">
      <span class="tray-label">Paper</span>
      <select value={paperId} onchange={(e) => editorStore.setPaperId(e.currentTarget.value)}>
        {#each PAPER_VARIANTS as option (option.id)}
          <option value={option.id}>{option.label}</option>
        {/each}
      </select>
    </label>

    <label class="tray-group">
      <span class="tray-label">Age</span>
      <select value={agePreset} onchange={(e) => editorStore.setAgePreset(e.currentTarget.value)}>
        {#each AGE_PRESETS as option (option.id)}
          <option value={option.id}>{option.label}</option>
        {/each}
      </select>
    </label>

    <button type="button" class="erase" onclick={clearPage}>New page</button>
    <button type="button" class="erase export" onclick={downloadExport} disabled={exportStatus === 'exporting'}>
      {#if exportStatus === 'exporting'}
        Exporting…
      {:else}
        Download PNG
      {/if}
    </button>
  </footer>
</div>

<style>
  .app {
    position: relative;
    width: 100%;
    min-height: 100vh;
    height: 100vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .brand {
    position: absolute;
    top: 16px;
    left: 24px;
    z-index: 6;
    display: flex;
    align-items: baseline;
    gap: 10px;
  }

  .brand-mark {
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 17px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #4a4238;
    pointer-events: none;
  }

  .brand-sub {
    font-family: Georgia, serif;
    font-style: italic;
    font-size: 12px;
    color: #857a6b;
    pointer-events: none;
  }

  .brand-controls {
    pointer-events: auto;
    margin-left: 16px;
  }

  .desk {
    flex: 1;
    min-height: 0;
  }

  .tray {
    position: absolute;
    bottom: 18px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 8;
    display: flex;
    align-items: center;
    gap: 18px;
    padding: 10px 18px;
    border-radius: 14px;
    background: linear-gradient(180deg, rgba(253, 251, 246, 0.96), rgba(240, 235, 226, 0.96));
    border: 1px solid rgba(120, 106, 86, 0.3);
    box-shadow: 0 10px 26px rgba(60, 50, 38, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(6px);
    font-family: Georgia, serif;
  }

  :global(.dark) .tray {
    background: linear-gradient(180deg, rgba(50, 50, 54, 0.96), rgba(40, 40, 44, 0.96));
    border-color: rgba(80, 80, 84, 0.4);
    box-shadow: 0 10px 26px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }

  .tray-group {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #5b5245;
    font-size: 12px;
    letter-spacing: 0.04em;
  }

  :global(.dark) .tray-group {
    color: #a8a8ac;
  }

  .tray-label {
    text-transform: uppercase;
    font-size: 10px;
    letter-spacing: 0.14em;
    color: #948a79;
  }

  :global(.dark) .tray-label {
    color: #6a6a6e;
  }

  select {
    font-family: Georgia, serif;
    font-size: 12px;
    color: #43392c;
    padding: 5px 8px;
    border-radius: 8px;
    border: 1px solid rgba(120, 106, 86, 0.35);
    background: rgba(255, 255, 255, 0.75);
    cursor: pointer;
  }

  :global(.dark) select {
    color: #d0d0d4;
    background: rgba(60, 60, 64, 0.6);
    border-color: rgba(80, 80, 84, 0.4);
  }

  .swatches {
    display: flex;
    gap: 6px;
  }

  .swatch {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.85);
    box-shadow: 0 0 0 1px rgba(90, 78, 62, 0.35);
    cursor: pointer;
    padding: 0;
  }

  .swatch.active {
    box-shadow: 0 0 0 2px #6b6255;
    transform: scale(1.08);
  }

  .erase {
    font-family: Georgia, serif;
    font-size: 12px;
    color: #43392c;
    padding: 6px 12px;
    border-radius: 9px;
    border: 1px solid rgba(120, 106, 86, 0.35);
    background: rgba(255, 255, 255, 0.75);
    cursor: pointer;
  }

  :global(.dark) .erase {
    color: #d0d0d4;
    background: rgba(60, 60, 64, 0.6);
    border-color: rgba(80, 80, 84, 0.4);
  }

  .erase:hover,
  select:hover {
    background: rgba(255, 255, 255, 0.98);
  }

  :global(.dark) .erase:hover,
  :global(.dark) select:hover {
    background: rgba(80, 80, 84, 0.8);
  }

  .export:disabled {
    opacity: 0.6;
    cursor: wait;
  }

  @media (max-width: 640px) {
    .tray {
      flex-wrap: wrap;
      justify-content: center;
      gap: 10px 14px;
      width: calc(100% - 24px);
      bottom: 10px;
    }
    .brand-sub {
      display: none;
    }
  }
</style>
