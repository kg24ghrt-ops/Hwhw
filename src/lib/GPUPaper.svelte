<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { GPUDocumentRenderer } from '../gpu/renderer';
  import { getBackendDisplayName } from '../gpu/backend';
  import type { GPUBackend } from '../gpu/backend';

  interface Props {
    text?: string;
    fontFamily?: string;
    inkColor?: string;
  }

  let {
    text = $bindable(''),
    fontFamily = 'Caveat',
    inkColor = '#1b2a52',
  }: Props = $props();

  let container: HTMLDivElement;
  let renderer: GPUDocumentRenderer | null = null;
  let backendName = $state('Initializing...');
  let isReady = $state(false);
  let showExportMenu = $state(false);
  let exportProgress = $state(0);

  onMount(async () => {
    if (!container) return;

    renderer = new GPUDocumentRenderer();
    
    try {
      await renderer.initialize({
        container,
        fontFamily,
        fontSize: 24,
      });

      backendName = getBackendDisplayName(renderer.getBackend());
      isReady = true;
    } catch (error) {
      console.error('Failed to initialize GPU renderer:', error);
      backendName = 'Failed';
    }
  });

  onDestroy(() => {
    if (renderer) {
      renderer.destroy();
      renderer = null;
    }
  });

  async function handleExportPNG() {
    if (!renderer) return;
    
    exportProgress = 1;
    showExportMenu = false;
    
    try {
      const blob = await renderer.exportPNG();
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'document-a5.png';
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
    
    exportProgress = 0;
  }

  async function handleExportPDF() {
    if (!renderer) return;
    
    exportProgress = 1;
    showExportMenu = false;
    
    try {
      const pdfData = await renderer.exportPDF();
      const blob = new Blob([pdfData], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'document-a5.pdf';
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
    
    exportProgress = 0;
  }
</script>

<div class="gpu-paper-container" bind:this={container}>
  {#if !isReady}
    <div class="loading-overlay">
      <div class="loading-spinner"></div>
      <div class="loading-text">Initializing {backendName}...</div>
    </div>
  {/if}

  <div class="export-controls">
    <button 
      class="export-btn" 
      onclick={() => showExportMenu = !showExportMenu}
      disabled={!isReady}
    >
      Export
    </button>
    
    {#if showExportMenu}
      <div class="export-menu">
        <button onclick={handleExportPNG}>PNG (300 DPI)</button>
        <button onclick={handleExportPDF}>PDF (A5)</button>
      </div>
    {/if}
  </div>

  <div class="backend-indicator">
    {backendName}
  </div>

  {#if exportProgress > 0}
    <div class="export-progress">
      <div class="progress-bar"></div>
    </div>
  {/if}
</div>

<style>
  .gpu-paper-container {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: #f5f3ef;
  }

  .loading-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    background: rgba(245, 243, 239, 0.95);
    z-index: 10;
  }

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(74, 66, 56, 0.1);
    border-top-color: #4a4238;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .loading-text {
    font-family: Georgia, serif;
    font-size: 14px;
    color: #4a4238;
  }

  .export-controls {
    position: absolute;
    top: 16px;
    right: 16px;
    z-index: 5;
  }

  .export-btn {
    font-family: Georgia, serif;
    font-size: 12px;
    padding: 8px 16px;
    background: linear-gradient(180deg, #fdfbf6, #f0ebe2);
    border: 1px solid rgba(120, 106, 86, 0.3);
    border-radius: 8px;
    cursor: pointer;
    color: #43392c;
    transition: all 0.2s;
  }

  .export-btn:hover:not(:disabled) {
    background: #fff;
  }

  .export-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .export-menu {
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: 4px;
    background: #fdfbf6;
    border: 1px solid rgba(120, 106, 86, 0.3);
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(60, 50, 38, 0.15);
    overflow: hidden;
  }

  .export-menu button {
    display: block;
    width: 100%;
    padding: 8px 16px;
    font-family: Georgia, serif;
    font-size: 12px;
    background: transparent;
    border: none;
    border-bottom: 1px solid rgba(120, 106, 86, 0.1);
    cursor: pointer;
    color: #43392c;
    text-align: left;
  }

  .export-menu button:last-child {
    border-bottom: none;
  }

  .export-menu button:hover {
    background: rgba(120, 106, 86, 0.05);
  }

  .backend-indicator {
    position: absolute;
    bottom: 10px;
    right: 10px;
    font-family: monospace;
    font-size: 10px;
    color: rgba(74, 66, 56, 0.5);
    padding: 4px 8px;
    background: rgba(253, 251, 246, 0.8);
    border-radius: 4px;
  }

  .export-progress {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: rgba(120, 106, 86, 0.1);
  }

  .progress-bar {
    height: 100%;
    background: linear-gradient(90deg, #4a4238, #6b5a4a);
    animation: pulse 1s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 0.7; }
    50% { opacity: 1; }
  }
</style>
