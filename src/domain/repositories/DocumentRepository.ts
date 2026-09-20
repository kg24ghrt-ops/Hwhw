/**
 * DocumentRepository Interface - Repository pattern for document persistence
 */
import type { Document } from '../entities/Document';

export interface DocumentRepository {
  findById(id: string): Promise<Document | null>;
  save(document: Document): Promise<void>;
  delete(id: string): Promise<void>;
  findAll(): Promise<Document[]>;
}
