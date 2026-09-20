<script lang="ts">
  import { DEFAULT_HANDWRITING_STYLES, type HandwritingStyle } from '../../domain/entities/HandwritingStyle';

  interface Props {
    selectedFont: string;
    onFontChange?: (fontId: string) => void;
  }

  let { selectedFont, onFontChange }: Props = $props();

  const fonts = DEFAULT_HANDWRITING_STYLES;

  function selectFont(fontId: string): void {
    onFontChange?.(fontId);
  }
</script>

<div class="font-picker" role="group" aria-label="Handwriting font selection">
  <span class="font-picker-label">Hand</span>
  <div class="font-options">
    {#each fonts as font (font.id)}
      <button
        type="button"
        class="font-option"
        class:active={selectedFont === font.id}
        style="font-family: '{font.fontFamily}', cursive; font-weight: {font.fontWeight || 400};"
        onclick={() => selectFont(font.id)}
        title={font.label}
        aria-label={font.label}
      >
        {font.label}
      </button>
    {/each}
  </div>
</div>

<style>
  .font-picker {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .font-picker-label {
    text-transform: uppercase;
    font-size: 10px;
    letter-spacing: 0.14em;
    color: #948a79;
    font-family: Georgia, serif;
  }

  .font-options {
    display: flex;
    gap: 6px;
  }

  .font-option {
    font-family: Georgia, serif;
    font-size: 12px;
    color: #43392c;
    padding: 5px 10px;
    border-radius: 8px;
    border: 1px solid rgba(120, 106, 86, 0.35);
    background: rgba(255, 255, 255, 0.75);
    cursor: pointer;
    transition: all 0.15s ease;
    min-width: 80px;
  }

  .font-option:hover {
    background: rgba(255, 255, 255, 0.95);
  }

  .font-option.active {
    background: rgba(91, 82, 69, 0.15);
    border-color: rgba(91, 82, 69, 0.5);
    color: #43392c;
  }

  :global(.dark) .font-picker-label {
    color: #6a6a6e;
  }

  :global(.dark) .font-option {
    color: #d0d0d4;
    background: rgba(60, 60, 64, 0.6);
    border-color: rgba(80, 80, 84, 0.4);
  }

  :global(.dark) .font-option:hover {
    background: rgba(80, 80, 84, 0.8);
  }

  :global(.dark) .font-option.active {
    background: rgba(168, 168, 172, 0.15);
    border-color: rgba(168, 168, 172, 0.4);
    color: #d0d0d4;
  }
</style>
