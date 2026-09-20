/**
 * HandwritingStyle Entity - Represents handwriting font and style properties
 */
export interface HandwritingStyle {
  id: string;
  label: string;
  fontFamily: string;
  fontWeight?: number;
  jitterRotation: number; // max rotation in degrees (±)
  jitterBaseline: number; // max baseline shift in px (±)
  jitterOpacity: [number, number]; // opacity range [min, max]
  jitterScale: [number, number]; // scale range [min, max]
}

export const DEFAULT_HANDWRITING_STYLES: HandwritingStyle[] = [
  {
    id: 'Caveat',
    label: 'Caveat',
    fontFamily: 'Caveat',
    fontWeight: 500,
    jitterRotation: 0.5,
    jitterBaseline: 1,
    jitterOpacity: [0.92, 1.0],
    jitterScale: [0.98, 1.02],
  },
  {
    id: 'Kalam',
    label: 'Kalam',
    fontFamily: 'Kalam',
    fontWeight: 400,
    jitterRotation: 0.4,
    jitterBaseline: 0.8,
    jitterOpacity: [0.94, 1.0],
    jitterScale: [0.97, 1.03],
  },
  {
    id: 'Patrick Hand',
    label: 'Patrick Hand',
    fontFamily: 'Patrick Hand',
    fontWeight: 400,
    jitterRotation: 0.3,
    jitterBaseline: 0.6,
    jitterOpacity: [0.95, 1.0],
    jitterScale: [0.98, 1.02],
  },
  {
    id: 'Shadows Into Light',
    label: 'Shadows',
    fontFamily: 'Shadows Into Light',
    fontWeight: 400,
    jitterRotation: 0.45,
    jitterBaseline: 0.9,
    jitterOpacity: [0.93, 1.0],
    jitterScale: [0.96, 1.04],
  },
  {
    id: 'Homemade Apple',
    label: 'Homemade Apple',
    fontFamily: 'Homemade Apple',
    fontWeight: 400,
    jitterRotation: 0.6,
    jitterBaseline: 1.2,
    jitterOpacity: [0.90, 1.0],
    jitterScale: [0.95, 1.05],
  },
  {
    id: 'La Belle Aurore',
    label: 'La Belle Aurore',
    fontFamily: 'La Belle Aurore',
    fontWeight: 400,
    jitterRotation: 0.5,
    jitterBaseline: 1,
    jitterOpacity: [0.92, 1.0],
    jitterScale: [0.97, 1.03],
  },
];
