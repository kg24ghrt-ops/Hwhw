/**
 * LocalStorageAdapter - Infrastructure implementation for document storage
 * Adapter pattern for swappable storage backends
 */
import type { DocumentRepository } from '../../domain/repositories/DocumentRepository';
import type { Document } from '../../domain/entities/Document';

const STORAGE_KEY = 'notebook.v1';

export class LocalStorageAdapter implements DocumentRepository {
  async findById(id: string): Promise<Document | null> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const saved = JSON.parse(raw);
      
      // Legacy format migration
      if (saved.text !== undefined) {
        return {
          id,
          text: saved.text ?? '',
          paperId: saved.paperId ?? 'a4-college',
          handwritingStyleId: saved.hand ?? 'Caveat',
          inkColor: saved.ink ?? '#1b2a52',
          agePreset: saved.agePreset ?? 'new',
          jitterSeed: saved.jitterSeed ?? Math.floor(Math.random() * Number.MAX_SAFE_INTEGER),
          createdAt: new Date(saved.createdAt ?? Date.now()),
          updatedAt: new Date(),
        };
      }
      
      return saved as Document;
    } catch {
      return null;
    }
  }

  async save(document: Document): Promise<void> {
    try {
      const snapshot = JSON.stringify({
        ...document,
        updatedAt: new Date(),
      });
      localStorage.setItem(STORAGE_KEY, snapshot);
    } catch {
      // Storage may be unavailable
      console.warn('Failed to save document to localStorage');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      console.warn('Failed to delete document from localStorage');
    }
  }

  async findAll(): Promise<Document[]> {
    const doc = await this.findById('default');
    return doc ? [doc] : [];
  }
}
