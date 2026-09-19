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
const HIDDEN_SELECTOR = '.caret, .selection, .empty-hint, .capture';

function setHidden(on: boolean) {
  if (on) {
    if (document.getElementById(HIDDEN_STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = HIDDEN_STYLE_ID;
    style.textContent = `${HIDDEN_SELECTOR} { display: none !important; }`;
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
  // Use a higher scale factor for better quality exports
  // Multiply by devicePixelRatio to account for high-DPI displays
  const baseScale = options.scale ?? 2;
  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
  const scale = baseScale * dpr;
  const onProgress = options.onProgress;

  if (!container) {
    return { ok: false, error: 'Nothing to export.' };
  }

  onProgress?.('Preparing page…');

  if (typeof document !== 'undefined' && 'fonts' in document) {
    try {
      await document.fonts.ready;
    } catch {
      /* fonts may already be ready */
    }
  }

  setHidden(true);

  let canvas: HTMLCanvasElement;
  try {
    canvas = await html2canvas(container, {
      scale,
      logging: false,
      useCORS: true,
      allowTaint: false,
      backgroundColor: null,
      imageTimeout: 0,
      removeContainer: false,
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
