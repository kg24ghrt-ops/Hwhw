/**
 * Paper Repository Interface
 */
import type { Paper } from '../entities/Paper';
import type { PaperVariantId } from '../value-objects/PaperVariant';

export interface PaperRepository {
  findById(id: PaperVariantId): Promise<Paper | null>;
  findAll(): Promise<Paper[]>;
  findDarkVariants(): Promise<Paper[]>;
  findLightVariants(): Promise<Paper[]>;
}
