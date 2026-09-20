/**
 * HandwritingStyle Entity
 * Defines handwriting characteristics including jitter parameters
 */
export interface HandwritingStyleSpec {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  // Jitter parameters for realistic handwriting
  rotationRange: number; // degrees ±
  baselineRange: number; // px ±
  opacityRange: [number, number]; // min, max
  scaleRange: [number, number]; // min, max
  // Ink flow simulation
  bleedAmount: number;
  blurAmount: number;
}

export class HandwritingStyle {
  constructor(public readonly spec: HandwritingStyleSpec, public readonly id: string, public readonly label: string) {}

  static create(
    id: string,
    label: string,
    fontFamily: string,
    overrides?: Partial<HandwritingStyleSpec>,
  ): HandwritingStyle {
    const baseSpec: HandwritingStyleSpec = {
      fontFamily,
      fontSize: 24,
      lineHeight: 32,
      rotationRange: 0.5,
      baselineRange: 1,
      opacityRange: [0.92, 1.0],
      scaleRange: [0.96, 1.04],
      bleedAmount: 0.2,
      blurAmount: 0.15,
      ...overrides,
    };
    return new HandwritingStyle(baseSpec, id, label);
  }

  get cssFontString(): string {
    return `${this.spec.fontSize}px "${this.spec.fontFamily}", cursive`;
  }
}

// Standard handwriting fonts from Google Fonts
export const HANDWRITING_FONTS = [
  'Caveat',
  'Kalam',
  'Shadows Into Light',
  'Homemade Apple',
  'La Belle Aurore',
  'Patrick Hand',
];

export const DEFAULT_HANDWRITING_STYLES: HandwritingStyle[] = [
  HandwritingStyle.create('caveat', 'Caveat', 'Caveat'),
  HandwritingStyle.create('kalam', 'Kalam', 'Kalam'),
  HandwritingStyle.create('shadows', 'Shadows Into Light', 'Shadows Into Light'),
  HandwritingStyle.create('homemade', 'Homemade Apple', 'Homemade Apple'),
  HandwritingStyle.create('belle', 'La Belle Aurore', 'La Belle Aurore'),
  HandwritingStyle.create('patrick', 'Patrick Hand', 'Patrick Hand'),
];
