/**
 * PaperVariant Value Object - Paper type variants including dark themes
 */
export type PaperVariantType = 
  | 'a4-college'
  | 'a4-wide'
  | 'letter-college'
  | 'letter-wide'
  | 'a5-college'
  | 'a5-wide'
  | 'a3-college'
  | 'a6-college'
  // Dark variants
  | 'black-leather'
  | 'blueprint'
  | 'chalkboard'
  | 'dark-legal'
  | 'night-grid';

export class PaperVariant {
  private readonly value: PaperVariantType;

  constructor(variant: PaperVariantType) {
    this.value = variant;
  }

  getValue(): PaperVariantType {
    return this.value;
  }

  isDark(): boolean {
    return ['black-leather', 'blueprint', 'chalkboard', 'dark-legal', 'night-grid'].includes(this.value);
  }

  toString(): string {
    return this.value;
  }
}
