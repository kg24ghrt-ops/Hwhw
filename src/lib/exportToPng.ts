import html2canvas from 'html2canvas';

export interface ExportPngOptions {
  filenameBase?: string;
  scale?: number;
  onProgress?: (message: string) => void;
}

export type ExportResult =
  | { ok: true; filename: string; blob: Blob }
  | { ok: false; error: string };

const HIDDEN_STYLE_ID = 'hwhw-export-hidden';
const HIDDEN_SELECTOR = '.caret, .selection, .empty-hint';
const UI_CONTROLS_SELECTOR = '.tray, .brand, .capture';

function setHidden(on: boolean) {
  if (on) {
    if (document.getElementById(HIDDEN_STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = HIDDEN_STYLE_ID;
    style.textContent = `${HIDDEN_SELECTOR}, ${UI_CONTROLS_SELECTOR} { display: none !important; }`;
    document.head.appendChild(style);
  } else {
    document.getElementById(HIDDEN_STYLE_ID)?.remove();
  }
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function timestamp() {
  const d = new Date();
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_` +
    `${pad(d.getHours())}-${pad(d.getMinutes())}-${pad(d.getSeconds())}`
  );
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener noreferrer';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(url);
    a.remove();
  }, 1000);
}

export async function exportNotebookToPng(
  container: HTMLElement | null,
  options: ExportPngOptions = {},
): Promise<ExportResult> {
  const { filenameBase = 'notebook' } = options;
  // Use a fixed scale factor for predictable output resolution
  // html2canvas handles devicePixelRatio internally, so we use a base scale only
  const scale = options.scale ?? 2;
  const onProgress = options.onProgress;

  if (!container) {
    return { ok: false, error: 'Nothing to export.' };
  }

  onProgress?.('Preparing page…');

  // Ensure all fonts are fully loaded before capture
  if (typeof document !== 'undefined' && 'fonts' in document) {
    try {
      await document.fonts.ready;
      // Give fonts an extra frame to settle after loading
      await new Promise(resolve => requestAnimationFrame(resolve));
    } catch {
      /* fonts may already be ready */
    }
  }

  setHidden(true);

  let canvas: HTMLCanvasElement;
  try {
    // Temporarily disable CSS isolation and mix-blend-mode that can interfere with html2canvas
    const paperObjects = Array.from(
      container.querySelectorAll<HTMLElement>('.paper-object')
    );
    const originalIsolation = paperObjects.map((el) => el.style.isolation);
    paperObjects.forEach((el) => {
      el.style.isolation = 'auto';
    });

    // Temporarily disable mix-blend-mode on ink-layer and selection elements
    const inkLayers = Array.from(
      container.querySelectorAll<HTMLElement>('.ink-layer, .selection')
    );
    const originalBlendModes = inkLayers.map((el) => el.style.mixBlendMode);
    inkLayers.forEach((el) => {
      el.style.mixBlendMode = 'normal';
    });

    // Force a reflow to ensure the DOM updates before capture
    void container.offsetHeight;

    // Wait an additional frame for DOM changes to settle
    await new Promise(resolve => requestAnimationFrame(resolve));

    canvas = await html2canvas(container, {
      scale,
      logging: false,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#fdfcf9',
      imageTimeout: 0,
      removeContainer: false,
      // Ensure proper handling of high-DPI displays
      windowWidth: typeof window !== 'undefined' ? window.innerWidth : undefined,
      windowHeight: typeof window !== 'undefined' ? window.innerHeight : undefined,
      // Ignore the invisible textarea that's used for input
      ignoreElements: (element: Element) => {
        if (element.classList.contains('capture')) {
          return true;
        }
        return false;
      },
    });

    // Restore mix-blend-mode
    inkLayers.forEach((el, i) => {
      el.style.mixBlendMode = originalBlendModes[i];
    });

    // Restore CSS isolation
    paperObjects.forEach((el, i) => {
      el.style.isolation = originalIsolation[i];
    });
  } catch (e: unknown) {
    setHidden(false);
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: `Export failed: ${msg}` };
  } finally {
    onProgress?.('Rendering PNG…');
  }

  setHidden(false);

  const blob: Blob | null = await new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b), 'image/png'),
  );

  if (!blob) {
    return { ok: false, error: 'Failed to generate PNG data.' };
  }

  onProgress?.('Saving…');
  const filename = `${filenameBase}-${timestamp()}.png`;
  triggerDownload(blob, filename);
  return { ok: true, filename, blob };
}
