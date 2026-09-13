<script lang="ts">
  import { onMount } from 'svelte';
  import Notebook from './lib/Notebook.svelte';
  import { PAPER_VARIANTS } from './lib/paperConfig';

  const HANDS = [
    { id: 'Caveat', label: 'Caveat' },
    { id: 'Kalam', label: 'Kalam' },
    { id: 'Patrick Hand', label: 'Patrick Hand' },
    { id: 'Shadows Into Light', label: 'Shadows' },
    { id: 'Homemade Apple', label: 'Homemade Apple' },
  ];

  const INKS = [
    { id: 'blue', color: '#1b2a52', label: 'Blue ink' },
    { id: 'black', color: '#1c1c1e', label: 'Black ink' },
    { id: 'red', color: '#8f1f1f', label: 'Red ink' },
    { id: 'green', color: '#1f4d33', label: 'Green ink' },
  ];

  const AGE_PRESETS = [
    { id: 'new', label: 'New' },
    { id: 'slightly_used', label: 'Slightly Used' },
    { id: 'aged', label: 'Aged' },
    { id: 'vintage', label: 'Vintage' },
    { id: 'old_parchment', label: 'Old Parchment' },
    { id: 'antique', label: 'Antique' },
  ];

  let paperId = $state('a4-college');
  let hand = $state('Caveat');
  let ink = $state('#1b2a52');
  let text = $state('');
  let agePreset = $state('new');
  let loaded = $state(false);

  const spec = $derived(PAPER_VARIANTS.find((variant) => variant.id === paperId)?.spec ?? PAPER_VARIANTS[0].spec);

  onMount(() => {
    try {
      const raw = localStorage.getItem('notebook.v1');
      if (raw) {
        const saved = JSON.parse(raw);
        if (typeof saved.text === 'string') text = saved.text;
        if (typeof saved.paperId === 'string') paperId = saved.paperId;
        if (typeof saved.hand === 'string') hand = saved.hand;
        if (typeof saved.ink === 'string') ink = saved.ink;
        if (typeof saved.agePreset === 'string') agePreset = saved.agePreset;
      }
    } catch {
      /* ignore malformed storage */
    }
    loaded = true;
  });

  let saveTimer: ReturnType<typeof setTimeout> | undefined;

  $effect(() => {
    const snapshot = JSON.stringify({ text, paperId, hand, ink, agePreset });
    if (!loaded) return;
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      try {
        localStorage.setItem('notebook.v1', snapshot);
      } catch {
        /* storage may be unavailable */
      }
    }, 400);
    return () => clearTimeout(saveTimer);
  });

  function clearPage() {
    if (text.length === 0) return;
    if (confirm('Erase everything and start a fresh page?')) {
      text = '';
    }
  }
</script>

<div class="app">
  <header class="brand">
    <span class="brand-mark">Notebook</span>
    <span class="brand-sub">paper you can type on</span>
  </header>

  <main class="desk">
    <Notebook {spec} bind:text fontFamily={hand} inkColor={ink} />
  </main>

  <footer class="tray" aria-label="Stationery">
    <label class="tray-group">
      <span class="tray-label">Hand</span>
      <select bind:value={hand}>
        {#each HANDS as option (option.id)}
          <option value={option.id}>{option.label}</option>
        {/each}
      </select>
    </label>

    <div class="tray-group">
      <span class="tray-label">Ink</span>
      <div class="swatches">
        {#each INKS as option (option.id)}
          <button
            type="button"
            class="swatch"
            class:active={ink === option.color}
            style="background:{option.color};"
            title={option.label}
            aria-label={option.label}
            onclick={() => (ink = option.color)}
          ></button>
        {/each}
      </div>
    </div>

    <label class="tray-group">
      <span class="tray-label">Paper</span>
      <select bind:value={paperId}>
        {#each PAPER_VARIANTS as option (option.id)}
          <option value={option.id}>{option.label}</option>
        {/each}
      </select>
    </label>

    <label class="tray-group">
      <span class="tray-label">Age</span>
      <select bind:value={agePreset}>
        {#each AGE_PRESETS as option (option.id)}
          <option value={option.id}>{option.label}</option>
        {/each}
      </select>
    </label>

    <button type="button" class="erase" onclick={clearPage}>New page</button>
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
    pointer-events: none;
  }

  .brand-mark {
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 17px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #4a4238;
  }

  .brand-sub {
    font-family: Georgia, serif;
    font-style: italic;
    font-size: 12px;
    color: #857a6b;
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

  .tray-group {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #5b5245;
    font-size: 12px;
    letter-spacing: 0.04em;
  }

  .tray-label {
    text-transform: uppercase;
    font-size: 10px;
    letter-spacing: 0.14em;
    color: #948a79;
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

  .erase:hover,
  select:hover {
    background: rgba(255, 255, 255, 0.98);
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
