/**
 * PaperVariant Value Object
 */
export type PaperVariantId = 
  | 'a4-college' | 'a4-wide'
  | 'letter-college' | 'letter-wide'
  | 'a5-college' | 'a5-wide'
  | 'a3-college' | 'a6-college'
  // Dark variants
  | 'black-leather' | 'blueprint' | 'chalkboard' | 'dark-legal' | 'night-grid';

export const PAPER_VARIANT_IDS: PaperVariantId[] = [
  'a4-college', 'a4-wide',
  'letter-college', 'letter-wide',
  'a5-college', 'a5-wide',
  'a3-college', 'a6-college',
  'black-leather', 'blueprint', 'chalkboard', 'dark-legal', 'night-grid',
];

export function isValidPaperVariantId(id: string): id is PaperVariantId {
  return PAPER_VARIANT_IDS.includes(id as PaperVariantId);
}
