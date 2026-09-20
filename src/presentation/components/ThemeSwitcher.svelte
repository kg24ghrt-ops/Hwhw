<script lang="ts">
  import { themeStore } from '../../presentation/stores/themeStore';
  import type { ThemeMode } from '../../presentation/stores/themeStore';

  let mode = $derived(themeStore.mode);
  let isDark = $derived(themeStore.isDark);

  function toggle(): void {
    if (mode === 'system') {
      themeStore.setMode(isDark ? 'light' : 'dark');
    } else {
      themeStore.setMode(mode === 'dark' ? 'light' : 'dark');
    }
  }

  function setMode(newMode: ThemeMode): void {
    themeStore.setMode(newMode);
  }
</script>

<div class="theme-switcher" role="group" aria-label="Theme selection">
  <button
    type="button"
    class="theme-btn"
    class:active={mode === 'light'}
    onclick={() => setMode('light')}
    title="Light mode"
    aria-label="Light mode"
  >
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="5"/>
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
    </svg>
  </button>
  
  <button
    type="button"
    class="theme-btn"
    class:active={mode === 'system'}
    onclick={() => setMode('system')}
    title="System preference"
    aria-label="System preference"
  >
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
      <line x1="8" y1="21" x2="16" y2="21"/>
      <line x1="12" y1="17" x2="12" y2="21"/>
    </svg>
  </button>
  
  <button
    type="button"
    class="theme-btn"
    class:active={mode === 'dark'}
    onclick={() => setMode('dark')}
    title="Dark mode"
    aria-label="Dark mode"
  >
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  </button>
</div>

<style>
  .theme-switcher {
    display: flex;
    gap: 4px;
    padding: 4px;
    background: rgba(255, 255, 255, 0.6);
    border-radius: 10px;
    border: 1px solid rgba(120, 106, 86, 0.25);
  }

  .theme-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    border: none;
    background: transparent;
    cursor: pointer;
    color: #5b5245;
    transition: all 0.15s ease;
  }

  .theme-btn:hover {
    background: rgba(255, 255, 255, 0.8);
  }

  .theme-btn.active {
    background: rgba(91, 82, 69, 0.15);
    color: #43392c;
  }

  :global(.dark) .theme-switcher {
    background: rgba(40, 40, 44, 0.6);
    border-color: rgba(80, 80, 84, 0.4);
  }

  :global(.dark) .theme-btn {
    color: #a8a8ac;
  }

  :global(.dark) .theme-btn:hover {
    background: rgba(60, 60, 64, 0.8);
  }

  :global(.dark) .theme-btn.active {
    background: rgba(168, 168, 172, 0.2);
    color: #d0d0d4;
  }
</style>
