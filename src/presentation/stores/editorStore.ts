/**
 * Editor Store using Svelte 5 runes
 * Manages document state, style settings, and export operations
 */
import { Document } from '../../domain/entities/Document';
import type { PaperVariantId } from '../../domain/value-objects/PaperVariant';
import { JitterSeed } from '../../domain/value-objects/JitterSeed';
import { LocalStorageAdapter } from '../../infrastructure/storage/LocalStorageAdapter';
import { HandwritingRenderer } from '../../infrastructure/render/HandwritingRenderer';
import { HandwritingService } from '../services/HandwritingService';

export interface EditorState {
  document: Document | null;
  isLoading: boolean;
  isExporting: boolean;
  exportStatus: string;
}

export interface StyleOption {
  id: string;
  label: string;
  value: string;
}

const HANDS: StyleOption[] = [
  { id: 'Caveat', label: 'Caveat', value: 'Caveat' },
  { id: 'Kalam', label: 'Kalam', value: 'Kalam' },
  { id: 'Patrick Hand', label: 'Patrick Hand', value: 'Patrick Hand' },
  { id: 'Shadows Into Light', label: 'Shadows', value: 'Shadows Into Light' },
  { id: 'Homemade Apple', label: 'Homemade Apple', value: 'Homemade Apple' },
  { id: 'La Belle Aurore', label: 'La Belle Aurore', value: 'La Belle Aurore' },
];

const INKS: StyleOption[] = [
  { id: 'blue', label: 'Blue ink', value: '#1b2a52' },
  { id: 'black', label: 'Black ink', value: '#1c1c1e' },
  { id: 'red', label: 'Red ink', value: '#8f1f1f' },
  { id: 'green', label: 'Green ink', value: '#1f4d33' },
];

const AGE_PRESETS: StyleOption[] = [
  { id: 'new', label: 'New', value: 'new' },
  { id: 'slightly_used', label: 'Slightly Used', value: 'slightly_used' },
  { id: 'aged', label: 'Aged', value: 'aged' },
  { id: 'vintage', label: 'Vintage', value: 'vintage' },
  { id: 'old_parchment', label: 'Old Parchment', value: 'old_parchment' },
  { id: 'antique', label: 'Antique', value: 'antique' },
];

// Create store state using runes
let editorState = $state<EditorState>({
  document: null,
  isLoading: true,
  isExporting: false,
  exportStatus: 'idle',
});

let saveTimer: ReturnType<typeof setTimeout> | undefined;
const storage = new LocalStorageAdapter();
const renderer = new HandwritingRenderer();
const handwritingService = new HandwritingService(renderer);

/**
 * Initialize the editor by loading document from storage
 */
export async function initializeEditor(): Promise<void> {
  editorState.isLoading = true;
  
  try {
    const doc = await storage.loadOrCreateNew('a4-college');
    editorState.document = doc;
  } catch (error) {
    console.error('Failed to initialize editor:', error);
    // Create a default document on error
    editorState.document = Document.create({
      id: 'default',
      text: '',
      paperVariantId: 'a4-college',
      fontFamily: 'Caveat',
      inkColor: '#1b2a52',
      agePreset: 'new',
      jitterSeed: Math.floor(Math.random() * 4294967296),
    });
  } finally {
    editorState.isLoading = false;
  }
}

/**
 * Update document text
 */
export function updateText(newText: string): void {
  if (!editorState.document) return;
  
  editorState.document.updateText(newText);
  scheduleSave();
}

/**
 * Update document style
 */
export function updateStyle(options: {
  paperVariantId?: PaperVariantId;
  fontFamily?: string;
  inkColor?: string;
  agePreset?: string;
}): void {
  if (!editorState.document) return;
  
  editorState.document.updateStyle(options);
  scheduleSave();
}

/**
 * Schedule auto-save to localStorage
 */
function scheduleSave(): void {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    if (editorState.document) {
      try {
        await storage.save(editorState.document);
      } catch (error) {
        console.warn('Failed to save document:', error);
      }
    }
  }, 400);
}

/**
 * Clear the page (erase all text)
 */
export function clearPage(): boolean {
  if (!editorState.document || editorState.document.text.length === 0) {
    return false;
  }
  
  if (confirm('Erase everything and start a fresh page?')) {
    updateText('');
    return true;
  }
  return false;
}

/**
 * Export document as PNG using canvas-based renderer
 */
export async function exportToPng(scale: number = 2): Promise<{ ok: true; blob: Blob } | { ok: false; error: string }> {
  if (!editorState.document) {
    return { ok: false, error: 'No document to export' };
  }
  
  editorState.isExporting = true;
  editorState.exportStatus = 'Preparing...';
  
  try {
    // Ensure fonts are loaded
    if ('fonts' in document) {
      await document.fonts.ready;
      await new Promise(resolve => requestAnimationFrame(resolve));
    }
    
    editorState.exportStatus = 'Rendering...';
    
    // Use the handwriting service to export
    const config = handwritingService.createRenderConfig(
      editorState.document.text,
      {
        fontFamily: editorState.document.fontFamily,
        fontSize: 24,
        inkColor: editorState.document.inkColor,
        lineSpacing: 32,
        contentWidth: 600,
      },
      editorState.document.jitterSeed,
      { isDark: false },
      8,
    );
    
    // Render to canvas first
    handwritingService.renderToCanvas(config);
    
    // Export as PNG
    const blob = await handwritingService.exportAsPng(scale);
    
    // Trigger download
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notebook-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(url);
      a.remove();
    }, 1000);
    
    editorState.exportStatus = 'Saved!';
    return { ok: true, blob };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return { ok: false, error: `Export failed: ${msg}` };
  } finally {
    setTimeout(() => {
      editorState.isExporting = false;
      editorState.exportStatus = 'idle';
    }, 1000);
  }
}

/**
 * Get available handwriting options
 */
export function getHandOptions(): StyleOption[] {
  return HANDS;
}

/**
 * Get available ink options
 */
export function getInkOptions(): StyleOption[] {
  return INKS;
}

/**
 * Get available age presets
 */
export function getAgePresets(): StyleOption[] {
  return AGE_PRESETS;
}

/**
 * Reactive getters for component use
 */
export const editorStore = {
  get document() {
    return editorState.document;
  },
  get isLoading() {
    return editorState.isLoading;
  },
  get isExporting() {
    return editorState.isExporting;
  },
  get exportStatus() {
    return editorState.exportStatus;
  },
};
