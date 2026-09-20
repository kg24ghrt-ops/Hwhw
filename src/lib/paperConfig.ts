/**
 * Paper Configuration - Legacy Compatibility Layer
 * Re-exports from application services for backward compatibility
 */
export { PAPER_VARIANTS, PaperService } from '../application/services/PaperService';
export type { PaperSpec } from '../domain/entities/Paper';
export { mmToPx as mmToPxUtil, getAspectRatio } from './paperConfigLegacy';
