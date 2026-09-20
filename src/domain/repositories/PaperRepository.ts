/**
 * PaperRepository Interface - Repository pattern for paper specifications
 */
import type { Paper } from '../entities/Paper';

export interface PaperRepository {
  findById(id: string): Promise<Paper | null>;
  findAll(): Promise<Paper[]>;
  findDarkVariants(): Promise<Paper[]>;
  findLightVariants(): Promise<Paper[]>;
}
