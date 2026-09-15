<script lang="ts">
  import { onMount } from 'svelte';
  import Paper from './Paper.svelte';
  import {
    computePageMetrics,
    getFontMetrics,
    glyphStyle,
    lineStyle,
    locateLine,
    measure,
    offsetFromX,
    wrapText,
    isMyanmarText,
    type VisualLine,
  } from './handwriting';
  import type { PaperSpec } from './paperConfig';
  import type { PageRenderData } from './export';
  import '@fontsource/noto-sans-myanmar';

  interface Props {
    spec: PaperSpec;
    text?: string;
    fontFamily?: string;
    inkColor?: string;
    fontWeight?: number;
    agePreset?: string;
  }

  let {
    spec,
    text = $bindable(''),
    fontFamily = 'Caveat',
    inkColor = '#1b2a52',
    fontWeight = 500,
    agePreset = 'new',
  }: Props = $props();

  let viewport: HTMLDivElement;
  let textarea: HTMLTextAreaElement;

  let availW = $state(900);
  let availH = $state(1200);
  let fontVersion = $state(0);
  let focused = $state(false);
  let selStart = $state(0);
  let selEnd = $state(0);
  let zoomLevel = $state(1);
  let isZoomed = $state(false);
  let pinchStartDistance = $state(0);
  let pinchStartZoom = $state(1);
  let lastWheelTime = $state(0);
  let wheelDelta = $state(0);

  const PAGE_GAP = 36;

  const pageWidth = $derived.by(() => {
    const maxWidth = Math.min(availW - 32, 900);
    let width = Math.max(240, maxWidth);
    let height = width * (spec.heightMm / spec.widthMm);
    const maxHeight = Math.max(320, availH - 32);
    if (height > maxHeight) {
      const scale = maxHeight / height;
      width *= scale;
      height = maxHeight;
    }
    return width * zoomLevel;
  });

  const pageHeight = $derived(pageWidth * (spec.heightMm / spec.widthMm));
  const metrics = $derived(computePageMetrics(spec, pageWidth, pageHeight));
  const fontSize = $derived(metrics.lineSpacing * 0.82);
  const fontString = $derived(`${fontWeight} ${fontSize}px "${fontFamily}", cursive`);
  
  // Use Noto Sans Myanmar for Myanmar text
  const myanmarFontString = $derived(`${fontWeight} ${fontSize}px "Noto Sans Myanmar"`);
  
  const effectiveFontString = $derived.by(() => {
    return isMyanmarText(text) ? myanmarFontString : fontString;
  });
  const fontMetrics = $derived.by(() => {
    fontVersion;
    return getFontMetrics(fontString);
  });

  const halfLeading = $derived(
    (metrics.lineSpacing - (fontMetrics.ascent + fontMetrics.descent)) / 2,
  );
  const baselineDrop = $derived(metrics.lineSpacing - (halfLeading + fontMetrics.ascent));

  const lines = $derived.by(() => {
    fontVersion;
    return wrapText(text, metrics.contentWidth, effectiveFontString);
  });

  const pages = $derived.by(() => {
    const perPage = metrics.linesPerPage;
    const result: VisualLine[][] = [];
    for (let i = 0; i < lines.length; i += perPage) {
      result.push(lines.slice(i, i + perPage));
    }
    if (result.length === 0) result.push([]);
    return result;
  });

  const caret = $derived(locateLine(lines, selStart));

  $effect(() => {
    const font = fontFamily;
    const size = fontSize;
    const weight = fontWeight;
    let cancelled = false;
    if (typeof document !== 'undefined' && 'fonts' in document) {
      Promise.all([
        document.fonts.load(`${weight} ${size}px "${font}"`),
        document.fonts.load(`${weight} ${size}px "Noto Sans Myanmar"`),
      ])
        .then(() => document.fonts.ready)
        .then(() => {
          if (!cancelled) fontVersion++;
        })
        .catch(() => {
          if (!cancelled) fontVersion++;
        });
    }
    return () => {
      cancelled = true;
    };
  });

  onMount(() => {
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        availW = entry.contentRect.width;
        availH = entry.contentRect.height;
      }
    });
    observer.observe(viewport);
    return () => observer.disconnect();
  });

  $effect(() => {
    const line = caret.line;
    const perPage = metrics.linesPerPage;
    if (!viewport) return;
    const pageIndex = Math.floor(line / perPage);
    const pageTop = pageIndex * (pageHeight + PAGE_GAP);
    const viewTop = viewport.scrollTop;
    const viewBottom = viewTop + viewport.clientHeight;
    const targetScroll = pageTop - viewport.clientHeight / 2 + pageHeight / 2;
    if (isZoomed) {
      viewport.scrollTo({ top: targetScroll - 100, behavior: 'smooth' });
    } else if (pageTop - 16 < viewTop) {
      viewport.scrollTo({ top: Math.max(0, pageTop - 24), behavior: 'smooth' });
    } else if (pageTop + pageHeight + 24 > viewBottom) {
      viewport.scrollTo({ top: pageTop + pageHeight + 24 - viewport.clientHeight, behavior: 'smooth' });
    }
  });

  function syncSelection() {
    if (!textarea) return;
    selStart = textarea.selectionStart ?? 0;
    selEnd = textarea.selectionEnd ?? 0;
  }

  function handleInput() {
    syncSelection();
  }

  function focusEditor() {
    if (!textarea) return;
    textarea.focus({ preventScroll: true });
  }

  function handlePointerDown(event: PointerEvent | MouseEvent, pageIndex: number) {
    const element = event.currentTarget as HTMLElement;
    const rect = element.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const within = Math.max(
      0,
      Math.min(metrics.linesPerPage - 1, Math.floor(y / metrics.lineSpacing)),
    );
    const lineIndex = pageIndex * metrics.linesPerPage + within;
    const line = lines[lineIndex];
    const position = line ? line.start + offsetFromX(line.text, x, fontString) : text.length;
    selStart = position;
    selEnd = position;
    focusEditor();
    textarea?.setSelectionRange(position, position);
    event.preventDefault();
  }

  let lastClickTime = $state(0);
  let clickCount = $state(0);

  function getPinchDistance(event: PointerEvent | TouchEvent): number {
    if ('touches' in event && event.touches.length >= 2) {
      const dx = event.touches[0].clientX - event.touches[1].clientX;
      const dy = event.touches[0].clientY - event.touches[1].clientY;
      return Math.sqrt(dx * dx + dy * dy);
    }
    return 0;
  }

  function handleTouchStart(event: TouchEvent) {
    if (event.touches.length === 2) {
      pinchStartDistance = getPinchDistance(event);
      pinchStartZoom = zoomLevel;
    }
  }

  function handleTouchMove(event: TouchEvent) {
    if (event.touches.length === 2 && pinchStartDistance > 0) {
      event.preventDefault();
      const currentDistance = getPinchDistance(event);
      const scale = currentDistance / pinchStartDistance;
      const newZoom = Math.max(1, Math.min(4, pinchStartZoom * scale));
      
      if (newZoom > 1.2 && !isZoomed) {
        isZoomed = true;
      } else if (newZoom <= 1.1 && isZoomed) {
        isZoomed = false;
      }
      
      zoomLevel = newZoom;
    }
  }

  function handleTouchEnd(event: TouchEvent) {
    if (event.touches.length < 2) {
      pinchStartDistance = 0;
    }
  }

  function handleWheel(event: WheelEvent) {
    if (!event.ctrlKey && !event.metaKey) return;
    
    event.preventDefault();
    
    const now = Date.now();
    if (now - lastWheelTime > 150) {
      wheelDelta = 0;
    }
    
    wheelDelta -= event.deltaY;
    lastWheelTime = now;
    
    const sensitivity = 0.002;
    const newZoom = Math.max(1, Math.min(4, zoomLevel + wheelDelta * sensitivity));
    
    if (newZoom > 1.2 && !isZoomed) {
      isZoomed = true;
    } else if (newZoom <= 1.1 && isZoomed) {
      isZoomed = false;
    }
    
    zoomLevel = newZoom;
  }

  function handleDoubleClick(event: MouseEvent) {
    const now = Date.now();
    const timeDiff = now - lastClickTime;
    
    if (timeDiff < 300) {
      clickCount++;
    } else {
      clickCount = 1;
    }
    lastClickTime = now;

    if (clickCount >= 2) {
      isZoomed = !isZoomed;
      zoomLevel = isZoomed ? 2.5 : 1;
      clickCount = 0;
      
      if (isZoomed && viewport && caret.line !== undefined) {
        const perPage = metrics.linesPerPage;
        const pageIndex = Math.floor(caret.line / perPage);
        const pageTop = pageIndex * (pageHeight + PAGE_GAP);
        const targetScroll = pageTop - viewport.clientHeight / 2 + pageHeight / 2;
        setTimeout(() => {
          viewport.scrollTo({ top: targetScroll - 100, behavior: 'smooth' });
        }, 50);
      }
    }
  }

  function focusFromWindow(event: KeyboardEvent) {
    if (event.target === textarea) return;
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    if (event.key.length === 1 || event.key === 'Backspace' || event.key === 'Enter') {
      focusEditor();
    }
  }

  function widthOf(slice: string): number {
    return measure(slice, effectiveFontString);
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Tab') {
      event.preventDefault();
      insertText('\t');
    }
  }

  function insertText(value: string) {
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    text = text.slice(0, start) + value + text.slice(end);
    const next = start + value.length;
    selStart = next;
    selEnd = next;
    queueMicrotask(() => textarea?.setSelectionRange(next, next));
  }

  // Export functions exposed to parent component
  async function exportPage(options: { scale?: number; format?: 'png' | 'jpeg' } = {}) {
    const { exportSinglePage } = await import('./export');
    const pageData = getPageRenderData(0);
    if (!pageData) return;
    
    const filename = `notebook-page-1.${options.format ?? 'png'}`;
    await exportSinglePage(pageData, filename, options);
  }

  async function exportAllPages(options: { scale?: number; format?: 'png' | 'jpeg' } = {}) {
    const { exportAllPages: exportAll } = await import('./export');
    const allPageData = getAllPagesRenderData();
    if (!allPageData || allPageData.length === 0) return;
    
    await exportAll(allPageData, options);
  }

  function getPageRenderData(pageIndex: number): PageRenderData | null {
    const perPage = metrics.linesPerPage;
    const pageLines = pages[pageIndex];
    if (!pageLines) return null;

    return {
      spec,
      width: pageWidth,
      height: pageHeight,
      lines: pageLines,
      inkColor,
      fontFamily: effectiveFontString.split('"')[1] || fontFamily,
      fontWeight,
      fontSize,
      lineSpacing: metrics.lineSpacing,
      baselineDrop,
      agePreset,
    };
  }

  function getAllPagesRenderData(): PageRenderData[] {
    return pages.map((_, index) => getPageRenderData(index)).filter((p): p is PageRenderData => p !== null);
  }

  // Expose methods to parent via bind:this
  $effect(() => {
    // Methods are available on the component instance automatically in Svelte 5
  });
</script>

<svelte:window onkeydown={focusFromWindow} onwheel={handleWheel} />

<div class="notebook" bind:this={viewport} ontouchstart={handleTouchStart} ontouchmove={handleTouchMove} ontouchend={handleTouchEnd} role="region" aria-label="Notebook viewport">
  <textarea
    class="capture"
    bind:this={textarea}
    bind:value={text}
    oninput={handleInput}
    onkeyup={syncSelection}
    onclick={syncSelection}
    onselect={syncSelection}
    onkeydown={handleKeyDown}
    onfocus={() => (focused = true)}
    onblur={() => (focused = false)}
    spellcheck="false"
    autocomplete="off"
    autocapitalize="off"
    wrap="off"
    aria-label="Notebook writing area"
  ></textarea>

  {#if text.length === 0}
    <div class="empty-hint" style="font-family:{fontString}; color:{inkColor}; font-size:{fontSize}px;">
      Click here and start typing…
    </div>
  {/if}

  <div class="pages" style="gap:{PAGE_GAP}px;">
    {#each pages as page, pageIndex (pageIndex)}
      <div class="page-slot">
        <Paper {spec} width={pageWidth} height={pageHeight} agePreset={agePreset}>
          <div
            class="ink-layer"
            role="textbox"
            tabindex="-1"
            aria-label="Notebook page"
            onpointerdown={(e) => handlePointerDown(e, pageIndex)}
            ondblclick={(e) => handleDoubleClick(e)}
          >
            {#each page as line, lineInPage (line.start)}
              {@const globalIndex = pageIndex * metrics.linesPerPage + lineInPage}
              {@const decoration = lineStyle(globalIndex, fontSize)}
              {@const isMyanmar = isMyanmarText(line.text)}
              <div
                class="vline"
                style="top:{lineInPage * metrics.lineSpacing}px; height:{metrics.lineSpacing}px; line-height:{metrics.lineSpacing}px; font-size:{fontSize}px; font-family:{effectiveFontString}; color:{inkColor}; transform: translateY({baselineDrop}px) rotate({decoration.tilt}deg) translateX({decoration.dx}px);"
              >
                {#if isMyanmar}
                  <!-- Myanmar: render the whole line as one unit to preserve clusters -->
                  <span class="myanmar-text">{line.text}</span>
                {:else}
                  <!-- English/Latin: keep existing per-glyph humanization -->
                  {#each Array(line.text.length) as _, charIndex (charIndex)}
                    {@const glyph = glyphStyle(line.start + charIndex, fontSize)}
                    <span
                      class="ch"
                      style="transform: rotate({glyph.rotate}deg) translate({glyph.dx}px, {glyph.dy}px) scale({glyph.scale}); opacity:{glyph.opacity};"
                      >{line.text[charIndex]}</span
                    >
                  {/each}
                {/if}
              </div>
            {/each}

            {#each page as line, lineInPage (line.start)}
              {@const start = Math.max(selStart, line.start)}
              {@const end = Math.min(selEnd, line.start + line.text.length)}
              {#if start < end}
                <div
                  class="selection"
                  style="left:{widthOf(line.text.slice(0, start - line.start))}px; width:{widthOf(line.text.slice(start - line.start, end - line.start))}px; top:{lineInPage * metrics.lineSpacing + baselineDrop + halfLeading * 0.7}px; height:{fontMetrics.ascent * 1.04}px;"
                ></div>
              {/if}
            {/each}

            {#if focused && caret.line >= pageIndex * metrics.linesPerPage && caret.line < (pageIndex + 1) * metrics.linesPerPage}
              {@const caretLineInPage = caret.line - pageIndex * metrics.linesPerPage}
              {@const caretLine = lines[caret.line]}
              <div
                class="caret"
                style="left:{caretLine ? widthOf(caretLine.text.slice(0, caret.offset)) : 0}px; top:{caretLineInPage * metrics.lineSpacing + baselineDrop + halfLeading}px; height:{fontMetrics.ascent * 1.06}px; background:{inkColor};"
              ></div>
            {/if}
          </div>
        </Paper>
        <div class="page-number" style="font-size:{Math.max(10, metrics.lineSpacing * 0.55)}px;">
          {pageIndex + 1}
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  .notebook {
    position: relative;
    width: 100%;
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 26px 16px 160px;
    scrollbar-width: thin;
    scrollbar-color: rgba(120, 105, 84, 0.4) transparent;
  }

  .capture {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    border: none;
    outline: none;
    resize: none;
    padding: 0;
    pointer-events: none;
    z-index: 1;
  }

  .pages {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .page-slot {
    position: relative;
    filter: drop-shadow(0 16px 26px rgba(58, 48, 36, 0.26))
      drop-shadow(0 2px 3px rgba(58, 48, 36, 0.12));
  }

  .page-slot::before,
  .page-slot::after {
    content: '';
    position: absolute;
    inset: 6px -4px -7px 4px;
    background: #f6f3ec;
    box-shadow: 0 1px 2px rgba(60, 50, 38, 0.16);
    z-index: -1;
  }

  .page-slot::after {
    inset: 3px -2px -4px 2px;
    background: #fbf9f4;
  }

  .ink-layer {
    position: relative;
    width: 100%;
    height: 100%;
    mix-blend-mode: multiply;
    cursor: text;
  }

  .vline {
    position: absolute;
    left: 0;
    right: 0;
    white-space: pre;
    transform-origin: left center;
    will-change: transform;
    pointer-events: none;
  }

  .ch {
    display: inline-block;
    will-change: transform;
    text-shadow: 0 0 0.4px rgba(10, 14, 30, 0.25);
    animation: ink-write 120ms ease-out both;
  }

  .myanmar-text {
    display: inline-block;
    white-space: pre;
    /* No per-glyph noise for Myanmar - let the browser shape correctly */
  }

  @keyframes ink-write {
    from {
      opacity: 0;
      filter: blur(1.1px);
    }
    to {
      filter: blur(0);
    }
  }

  .caret {
    position: absolute;
    width: 1.7px;
    border-radius: 1px;
    transform-origin: bottom center;
    animation: caret-blink 1.1s steps(1) infinite;
    pointer-events: none;
  }

  @keyframes caret-blink {
    0%,
    55% {
      opacity: 1;
    }
    56%,
    100% {
      opacity: 0;
    }
  }

  .selection {
    position: absolute;
    background: rgba(96, 140, 210, 0.28);
    border-radius: 2px;
    pointer-events: none;
    mix-blend-mode: multiply;
  }

  .empty-hint {
    position: absolute;
    top: 26px;
    left: 0;
    right: 0;
    text-align: center;
    opacity: 0.3;
    pointer-events: none;
    z-index: 3;
  }

  .page-number {
    position: absolute;
    bottom: 6px;
    left: 50%;
    transform: translateX(-50%);
    font-family: Georgia, serif;
    color: #6b6255;
    opacity: 0.65;
    pointer-events: none;
  }
</style>
