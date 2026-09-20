/**
 * Local Storage Adapter
 * Implements DocumentRepository using browser localStorage
 */
import type { Document } from '../../domain/entities/Document';
import type { DocumentRepository } from '../../domain/repositories/DocumentRepository';

const STORAGE_KEY = 'notebook.v1';

export class LocalStorageAdapter implements DocumentRepository {
  constructor(private storageKey: string = STORAGE_KEY) {}

  async findById(id: string): Promise<Document | null> {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return null;
      
      const data = JSON.parse(raw);
      if (data.id !== id) return null;
      
      return Document.fromJSON(data);
    } catch {
      return null;
    }
  }

  async save(document: Document): Promise<void> {
    try {
      const data = document.toJSON();
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save document to localStorage:', error);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return;
      
      const data = JSON.parse(raw);
      if (data.id === id) {
        localStorage.removeItem(this.storageKey);
      }
    } catch {
      // Ignore errors on delete
    }
  }

  async findAll(): Promise<Document[]> {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return [];
      
      const data = JSON.parse(raw);
      return [Document.fromJSON(data)];
    } catch {
      return [];
    }
  }

  /**
   * Load existing document from storage or create new one
   */
  async loadOrCreateNew(defaultPaperVariantId: string = 'a4-college'): Promise<Document> {
    const existing = await this.findById('default');
    
    if (existing) {
      return existing;
    }

    const newDoc = Document.create({
      id: 'default',
      text: '',
      paperVariantId: defaultPaperVariantId as any,
      fontFamily: 'Caveat',
      inkColor: '#1b2a52',
      agePreset: 'new',
      jitterSeed: Math.floor(Math.random() * 4294967296),
    });

    await this.save(newDoc);
    return newDoc;
  }
}
