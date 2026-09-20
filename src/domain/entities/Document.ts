/**
 * Document Entity
 * Core business entity representing a notebook document
 */
import type { JitterSeed } from '../value-objects/JitterSeed';
import type { PaperVariantId } from '../value-objects/PaperVariant';

export interface DocumentData {
  id: string;
  text: string;
  paperVariantId: PaperVariantId;
  fontFamily: string;
  inkColor: string;
  agePreset: string;
  jitterSeed: number;
  createdAt: number;
  updatedAt: number;
}

export class Document {
  constructor(
    public readonly id: string,
    public text: string,
    public paperVariantId: PaperVariantId,
    public fontFamily: string,
    public inkColor: string,
    public agePreset: string,
    public readonly jitterSeed: JitterSeed,
    public readonly createdAt: number,
    public updatedAt: number,
  ) {}

  static create(data: Omit<DocumentData, 'createdAt' | 'updatedAt'>): Document {
    const now = Date.now();
    return new Document(
      data.id,
      data.text,
      data.paperVariantId,
      data.fontFamily,
      data.inkColor,
      data.agePreset,
      JitterSeed.fromJSON(data.jitterSeed),
      now,
      now,
    );
  }

  static fromJSON(json: DocumentData): Document {
    return new Document(
      json.id,
      json.text,
      json.paperVariantId,
      json.fontFamily,
      json.inkColor,
      json.agePreset,
      JitterSeed.fromJSON(json.jitterSeed),
      json.createdAt,
      json.updatedAt,
    );
  }

  toJSON(): DocumentData {
    return {
      id: this.id,
      text: this.text,
      paperVariantId: this.paperVariantId,
      fontFamily: this.fontFamily,
      inkColor: this.inkColor,
      agePreset: this.agePreset,
      jitterSeed: this.jitterSeed.toJSON(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  updateText(newText: string): void {
    this.text = newText;
    this.updatedAt = Date.now();
  }

  updateStyle(options: {
    paperVariantId?: PaperVariantId;
    fontFamily?: string;
    inkColor?: string;
    agePreset?: string;
  }): void {
    if (options.paperVariantId) this.paperVariantId = options.paperVariantId;
    if (options.fontFamily) this.fontFamily = options.fontFamily;
    if (options.inkColor) this.inkColor = options.inkColor;
    if (options.agePreset) this.agePreset = options.agePreset;
    this.updatedAt = Date.now();
  }
}
