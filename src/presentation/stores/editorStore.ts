/**
 * Editor Store - Svelte 5 runes-based store for editor state
 */
import type { Document } from '../../domain/entities/Document';
import { createDocument } from '../../domain/entities/Document';
import { LocalStorageAdapter } from '../../infrastructure/storage/LocalStorageAdapter';

const storage = new LocalStorageAdapter();

export interface EditorState {
  document: Document | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
}

const initialState: EditorState = {
  document: null,
  isLoading: true,
  isSaving: false,
  error: null,
};

export class EditorStore {
  private state = $state<EditorState>(initialState);
  private saveTimer: ReturnType<typeof setTimeout> | undefined;

  get document() {
    return this.state.document;
  }

  get text() {
    return this.state.document?.text ?? '';
  }

  get paperId() {
    return this.state.document?.paperId ?? 'a4-college';
  }

  get handwritingStyleId() {
    return this.state.document?.handwritingStyleId ?? 'Caveat';
  }

  get inkColor() {
    return this.state.document?.inkColor ?? '#1b2a52';
  }

  get agePreset() {
    return this.state.document?.agePreset ?? 'new';
  }

  get jitterSeed() {
    return this.state.document?.jitterSeed ?? 0;
  }

  get isLoading() {
    return this.state.isLoading;
  }

  get isSaving() {
    return this.state.isSaving;
  }

  get error() {
    return this.state.error;
  }

  async load(): Promise<void> {
    this.state.isLoading = true;
    this.state.error = null;

    try {
      const doc = await storage.findById('default');
      if (doc) {
        this.state.document = doc;
      } else {
        this.state.document = createDocument();
      }
    } catch (error) {
      this.state.error = error instanceof Error ? error.message : 'Failed to load document';
      this.state.document = createDocument();
    } finally {
      this.state.isLoading = false;
    }
  }

  setText(text: string): void {
    if (!this.state.document) return;
    this.state.document.text = text;
    this.state.document.updatedAt = new Date();
    this.scheduleSave();
  }

  setPaperId(paperId: string): void {
    if (!this.state.document) return;
    this.state.document.paperId = paperId;
    this.state.document.updatedAt = new Date();
    this.scheduleSave();
  }

  setHandwritingStyleId(handwritingStyleId: string): void {
    if (!this.state.document) return;
    this.state.document.handwritingStyleId = handwritingStyleId;
    this.state.document.updatedAt = new Date();
    this.scheduleSave();
  }

  setInkColor(inkColor: string): void {
    if (!this.state.document) return;
    this.state.document.inkColor = inkColor;
    this.state.document.updatedAt = new Date();
    this.scheduleSave();
  }

  setAgePreset(agePreset: string): void {
    if (!this.state.document) return;
    this.state.document.agePreset = agePreset;
    this.state.document.updatedAt = new Date();
    this.scheduleSave();
  }

  setJitterSeed(seed: number): void {
    if (!this.state.document) return;
    this.state.document.jitterSeed = seed;
    this.state.document.updatedAt = new Date();
    this.scheduleSave();
  }

  clearPage(): void {
    if (!this.state.document) return;
    this.state.document.text = '';
    this.state.document.updatedAt = new Date();
    this.scheduleSave();
  }

  private scheduleSave(): void {
    clearTimeout(this.saveTimer);
    this.state.isSaving = true;
    this.saveTimer = setTimeout(() => {
      this.save();
    }, 400);
  }

  private async save(): Promise<void> {
    if (!this.state.document) return;

    try {
      await storage.save(this.state.document);
    } catch (error) {
      console.warn('Failed to save document:', error);
    } finally {
      this.state.isSaving = false;
    }
  }
}

// Singleton instance
export const editorStore = new EditorStore();
