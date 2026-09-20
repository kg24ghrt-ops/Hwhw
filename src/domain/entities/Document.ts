/**
 * Document Entity - Core business entity representing a notebook document
 */
export interface Document {
  id: string;
  text: string;
  paperId: string;
  handwritingStyleId: string;
  inkColor: string;
  agePreset: string;
  jitterSeed: number;
  createdAt: Date;
  updatedAt: Date;
}

export function createDocument(
  overrides: Partial<Document> = {}
): Document {
  const now = new Date();
  return {
    id: crypto.randomUUID(),
    text: '',
    paperId: 'a4-college',
    handwritingStyleId: 'Caveat',
    inkColor: '#1b2a52',
    agePreset: 'new',
    jitterSeed: Math.floor(Math.random() * Number.MAX_SAFE_INTEGER),
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}
