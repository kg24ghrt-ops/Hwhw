/**
 * Ink Entity
 * Represents ink properties for handwriting
 */
export interface InkSpec {
  color: string;
  opacity: number;
  bleedAmount: number; // px
  blurAmount: number; // px
  texture?: string;
}

export class Ink {
  constructor(public readonly spec: InkSpec, public readonly id: string, public readonly label: string) {}

  static create(id: string, label: string, spec: InkSpec): Ink {
    return new Ink(spec, id, label);
  }

  get cssFilter(): string {
    const { bleedAmount, blurAmount } = this.spec;
    return `drop-shadow(0 0 ${bleedAmount}px rgba(0,0,0,0.25)) blur(${blurAmount}px)`;
  }
}

// Standard ink colors
export const STANDARD_INKS: Ink[] = [
  Ink.create('blue', 'Blue ink', { color: '#1b2a52', opacity: 0.95, bleedAmount: 0.2, blurAmount: 0.15 }),
  Ink.create('black', 'Black ink', { color: '#1c1c1e', opacity: 0.98, bleedAmount: 0.2, blurAmount: 0.15 }),
  Ink.create('red', 'Red ink', { color: '#8f1f1f', opacity: 0.92, bleedAmount: 0.25, blurAmount: 0.18 }),
  Ink.create('green', 'Green ink', { color: '#1f4d33', opacity: 0.94, bleedAmount: 0.2, blurAmount: 0.15 }),
];

// Dark mode inks
export const DARK_INKS: Ink[] = [
  Ink.create('silver', 'Silver ink', { color: '#c0c0c0', opacity: 0.95, bleedAmount: 0.15, blurAmount: 0.12 }),
  Ink.create('white', 'White ink', { color: '#f5f5f5', opacity: 0.98, bleedAmount: 0.1, blurAmount: 0.1 }),
  Ink.create('cyan', 'Cyan ink', { color: '#00ffff', opacity: 0.9, bleedAmount: 0.3, blurAmount: 0.2 }),
  Ink.create('chalk', 'Chalk white', { color: '#f0f0e0', opacity: 0.85, bleedAmount: 0.4, blurAmount: 0.25 }),
  Ink.create('cream', 'Cream ink', { color: '#fffdd0', opacity: 0.92, bleedAmount: 0.2, blurAmount: 0.15 }),
  Ink.create('amber', 'Warm amber', { color: '#ffbf00', opacity: 0.88, bleedAmount: 0.25, blurAmount: 0.18 }),
];
