/**
 * Ink Entity - Represents ink properties for handwriting
 */
export interface Ink {
  id: string;
  label: string;
  color: string;
  opacity: number;
  bleedAmount: number; // text-shadow blur amount
}

export const DEFAULT_INKS: Ink[] = [
  { id: 'blue', label: 'Blue ink', color: '#1b2a52', opacity: 1.0, bleedAmount: 0.2 },
  { id: 'black', label: 'Black ink', color: '#1c1c1e', opacity: 1.0, bleedAmount: 0.2 },
  { id: 'red', label: 'Red ink', color: '#8f1f1f', opacity: 1.0, bleedAmount: 0.2 },
  { id: 'green', label: 'Green ink', color: '#1f4d33', opacity: 1.0, bleedAmount: 0.2 },
  // Dark mode inks
  { id: 'silver', label: 'Silver ink', color: '#c0c0c0', opacity: 0.95, bleedAmount: 0.25 },
  { id: 'white', label: 'White ink', color: '#f5f5f5', opacity: 0.98, bleedAmount: 0.3 },
  { id: 'cyan', label: 'Cyan ink', color: '#6ec6ff', opacity: 0.95, bleedAmount: 0.25 },
  { id: 'cream', label: 'Cream ink', color: '#f5e6c8', opacity: 0.95, bleedAmount: 0.2 },
  { id: 'amber', label: 'Amber ink', color: '#ffb142', opacity: 0.95, bleedAmount: 0.25 },
];
