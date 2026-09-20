/**
 * Paper Service
 * Provides paper specifications and variants including dark mode support
 */
import type { Paper } from '../../domain/entities/Paper';
import type { PaperSpec } from '../../domain/entities/Paper';
import type { PaperVariantId } from '../../domain/value-objects/PaperVariant';

// Light paper specs (existing)
const A4_COLLEGE_SPEC: PaperSpec = {
  widthMm: 210,
  heightMm: 297,
  rulingSpacingMm: 5.5,
  marginMm: 31.75,
  paperTone: '#faf9f6',
  brightness: 92,
  texture: {
    macroFrequency: 0.0005,
    macroAmplitude: 0.01,
    mesoFrequency: 0.002,
    mesoAmplitude: 0.03,
    microFrequency: 0.02,
    microAmplitude: 0.02,
    anisotropyRatio: 1.15,
    anisotropyAngle: 0,
  },
  lighting: {
    diffuseIntensity: 0.95,
    diffuseAngle: -30,
    gradientIntensity: 0.02,
    edgeDarkening: 0.03,
    contactShadowOpacity: 0.02,
    contactShadowBlur: 8,
  },
  edge: {
    edgeDarkening: 0.015,
    edgeVariation: 0.008,
    edgeThickness: 0.1,
  },
  ruling: {
    lineColor: '#5b7c99',
    lineOpacity: 0.45,
    lineWidthMm: 0.08,
    lineSoftness: 0.3,
    marginColor: '#c45a5a',
    marginOpacity: 0.55,
    marginWidthMm: 0.15,
  },
  isDark: false,
};

const A4_WIDE_SPEC: PaperSpec = { ...A4_COLLEGE_SPEC, rulingSpacingMm: 8.7 };

const LETTER_COLLEGE_SPEC: PaperSpec = {
  ...A4_COLLEGE_SPEC,
  widthMm: 215.9,
  heightMm: 279.4,
};

const LETTER_WIDE_SPEC: PaperSpec = { ...LETTER_COLLEGE_SPEC, rulingSpacingMm: 8.7 };

const A5_COLLEGE_SPEC: PaperSpec = {
  ...A4_COLLEGE_SPEC,
  widthMm: 148,
  heightMm: 210,
  marginMm: 25,
};

const A5_WIDE_SPEC: PaperSpec = { ...A5_COLLEGE_SPEC, rulingSpacingMm: 8.7 };

const A3_COLLEGE_SPEC: PaperSpec = {
  ...A4_COLLEGE_SPEC,
  widthMm: 297,
  heightMm: 420,
  marginMm: 35,
  rulingSpacingMm: 7,
  texture: {
    macroFrequency: 0.0004,
    macroAmplitude: 0.012,
    mesoFrequency: 0.0018,
    mesoAmplitude: 0.035,
    microFrequency: 0.018,
    microAmplitude: 0.025,
    anisotropyRatio: 1.1,
    anisotropyAngle: 0,
  },
};

const A6_COLLEGE_SPEC: PaperSpec = {
  ...A4_COLLEGE_SPEC,
  widthMm: 105,
  heightMm: 148,
  marginMm: 18,
  rulingSpacingMm: 4.5,
  texture: {
    macroFrequency: 0.0006,
    macroAmplitude: 0.008,
    mesoFrequency: 0.0022,
    mesoAmplitude: 0.025,
    microFrequency: 0.022,
    microAmplitude: 0.018,
    anisotropyRatio: 1.2,
    anisotropyAngle: 0,
  },
};

// Dark paper variants
const BLACK_LEATHER_SPEC: PaperSpec = {
  widthMm: 210,
  heightMm: 297,
  rulingSpacingMm: 5.5,
  marginMm: 31.75,
  paperTone: '#1a1a1a',
  brightness: 25,
  texture: {
    macroFrequency: 0.0008,
    macroAmplitude: 0.04,
    mesoFrequency: 0.003,
    mesoAmplitude: 0.06,
    microFrequency: 0.03,
    microAmplitude: 0.05,
    anisotropyRatio: 1.3,
    anisotropyAngle: 45,
  },
  lighting: {
    diffuseIntensity: 0.7,
    diffuseAngle: -30,
    gradientIntensity: 0.08,
    edgeDarkening: 0.15,
    contactShadowOpacity: 0.1,
    contactShadowBlur: 12,
  },
  edge: {
    edgeDarkening: 0.2,
    edgeVariation: 0.1,
    edgeThickness: 0.3,
  },
  ruling: {
    lineColor: '#4a4a4a',
    lineOpacity: 0.3,
    lineWidthMm: 0.08,
    lineSoftness: 0.5,
    marginColor: '#3a3a3a',
    marginOpacity: 0.4,
    marginWidthMm: 0.15,
  },
  isDark: true,
  inkGlow: 'rgba(255, 255, 255, 0.1)',
  gridPattern: 'lines',
};

const BLUEPRINT_SPEC: PaperSpec = {
  widthMm: 210,
  heightMm: 297,
  rulingSpacingMm: 5.5,
  marginMm: 31.75,
  paperTone: '#1a2b4a',
  brightness: 30,
  texture: {
    macroFrequency: 0.0006,
    macroAmplitude: 0.02,
    mesoFrequency: 0.002,
    mesoAmplitude: 0.04,
    microFrequency: 0.02,
    microAmplitude: 0.03,
    anisotropyRatio: 1.1,
    anisotropyAngle: 0,
  },
  lighting: {
    diffuseIntensity: 0.75,
    diffuseAngle: -30,
    gradientIntensity: 0.06,
    edgeDarkening: 0.12,
    contactShadowOpacity: 0.08,
    contactShadowBlur: 10,
  },
  edge: {
    edgeDarkening: 0.15,
    edgeVariation: 0.08,
    edgeThickness: 0.2,
  },
  ruling: {
    lineColor: '#3a5a8a',
    lineOpacity: 0.35,
    lineWidthMm: 0.06,
    lineSoftness: 0.4,
    marginColor: '#4a6a9a',
    marginOpacity: 0.45,
    marginWidthMm: 0.12,
  },
  isDark: true,
  inkGlow: 'rgba(0, 255, 255, 0.15)',
  gridPattern: 'lines',
};

const CHALKBOARD_SPEC: PaperSpec = {
  widthMm: 210,
  heightMm: 297,
  rulingSpacingMm: 5.5,
  marginMm: 31.75,
  paperTone: '#1a2a1a',
  brightness: 22,
  texture: {
    macroFrequency: 0.001,
    macroAmplitude: 0.05,
    mesoFrequency: 0.004,
    mesoAmplitude: 0.08,
    microFrequency: 0.04,
    microAmplitude: 0.06,
    anisotropyRatio: 1.4,
    anisotropyAngle: 0,
  },
  lighting: {
    diffuseIntensity: 0.65,
    diffuseAngle: -30,
    gradientIntensity: 0.1,
    edgeDarkening: 0.18,
    contactShadowOpacity: 0.12,
    contactShadowBlur: 14,
  },
  edge: {
    edgeDarkening: 0.25,
    edgeVariation: 0.12,
    edgeThickness: 0.35,
  },
  ruling: {
    lineColor: '#3a4a3a',
    lineOpacity: 0.25,
    lineWidthMm: 0.1,
    lineSoftness: 0.6,
    marginColor: '#2a3a2a',
    marginOpacity: 0.35,
    marginWidthMm: 0.18,
  },
  isDark: true,
  inkGlow: 'rgba(255, 255, 255, 0.2)',
  gridPattern: 'none',
};

const DARK_LEGAL_SPEC: PaperSpec = {
  widthMm: 215.9,
  heightMm: 279.4,
  rulingSpacingMm: 7,
  marginMm: 31.75,
  paperTone: '#2a2a2a',
  brightness: 28,
  texture: {
    macroFrequency: 0.0005,
    macroAmplitude: 0.02,
    mesoFrequency: 0.002,
    mesoAmplitude: 0.04,
    microFrequency: 0.02,
    microAmplitude: 0.03,
    anisotropyRatio: 1.15,
    anisotropyAngle: 0,
  },
  lighting: {
    diffuseIntensity: 0.72,
    diffuseAngle: -30,
    gradientIntensity: 0.05,
    edgeDarkening: 0.1,
    contactShadowOpacity: 0.06,
    contactShadowBlur: 8,
  },
  edge: {
    edgeDarkening: 0.12,
    edgeVariation: 0.06,
    edgeThickness: 0.15,
  },
  ruling: {
    lineColor: '#c9a86c',
    lineOpacity: 0.4,
    lineWidthMm: 0.08,
    lineSoftness: 0.3,
    marginColor: '#b9985c',
    marginOpacity: 0.5,
    marginWidthMm: 0.15,
  },
  isDark: true,
  inkGlow: 'rgba(255, 253, 208, 0.1)',
  gridPattern: 'lines',
};

const NIGHT_GRID_SPEC: PaperSpec = {
  widthMm: 210,
  heightMm: 297,
  rulingSpacingMm: 5.5,
  marginMm: 31.75,
  paperTone: '#0a0a0a',
  brightness: 20,
  texture: {
    macroFrequency: 0.0004,
    macroAmplitude: 0.01,
    mesoFrequency: 0.0015,
    mesoAmplitude: 0.02,
    microFrequency: 0.015,
    microAmplitude: 0.02,
    anisotropyRatio: 1.0,
    anisotropyAngle: 0,
  },
  lighting: {
    diffuseIntensity: 0.6,
    diffuseAngle: -30,
    gradientIntensity: 0.04,
    edgeDarkening: 0.08,
    contactShadowOpacity: 0.05,
    contactShadowBlur: 6,
  },
  edge: {
    edgeDarkening: 0.1,
    edgeVariation: 0.05,
    edgeThickness: 0.12,
  },
  ruling: {
    lineColor: '#1a1a1a',
    lineOpacity: 0.2,
    lineWidthMm: 0.04,
    lineSoftness: 0.3,
    marginColor: '#1a1a1a',
    marginOpacity: 0.25,
    marginWidthMm: 0.1,
  },
  isDark: true,
  inkGlow: 'rgba(255, 191, 0, 0.15)',
  gridPattern: 'dots',
};

export const PAPER_VARIANTS: { id: PaperVariantId; label: string; spec: PaperSpec }[] = [
  // Light variants
  { id: 'a4-college', label: 'A4 · College', spec: A4_COLLEGE_SPEC },
  { id: 'a4-wide', label: 'A4 · Wide', spec: A4_WIDE_SPEC },
  { id: 'letter-college', label: 'Letter · College', spec: LETTER_COLLEGE_SPEC },
  { id: 'letter-wide', label: 'Letter · Wide', spec: LETTER_WIDE_SPEC },
  { id: 'a5-college', label: 'A5 · College', spec: A5_COLLEGE_SPEC },
  { id: 'a5-wide', label: 'A5 · Wide', spec: A5_WIDE_SPEC },
  { id: 'a3-college', label: 'A3 · College', spec: A3_COLLEGE_SPEC },
  { id: 'a6-college', label: 'A6 · College', spec: A6_COLLEGE_SPEC },
  // Dark variants
  { id: 'black-leather', label: 'Black Leather Journal', spec: BLACK_LEATHER_SPEC },
  { id: 'blueprint', label: 'Blueprint', spec: BLUEPRINT_SPEC },
  { id: 'chalkboard', label: 'Chalkboard', spec: CHALKBOARD_SPEC },
  { id: 'dark-legal', label: 'Dark Legal Pad', spec: DARK_LEGAL_SPEC },
  { id: 'night-grid', label: 'Night Grid', spec: NIGHT_GRID_SPEC },
];

export class PaperService {
  private papers = new Map<PaperVariantId, Paper>();

  constructor() {
    for (const variant of PAPER_VARIANTS) {
      this.papers.set(variant.id, Paper.create(variant.id, variant.label, variant.spec));
    }
  }

  async findById(id: PaperVariantId): Promise<Paper | null> {
    return this.papers.get(id) ?? null;
  }

  async findAll(): Promise<Paper[]> {
    return Array.from(this.papers.values());
  }

  async findDarkVariants(): Promise<Paper[]> {
    return Array.from(this.papers.values()).filter(p => p.isDarkMode);
  }

  async findLightVariants(): Promise<Paper[]> {
    return Array.from(this.papers.values()).filter(p => !p.isDarkMode);
  }

  getPaperSpec(id: PaperVariantId): PaperSpec | null {
    const paper = this.papers.get(id);
    return paper?.spec ?? null;
  }

  getAllVariants(): typeof PAPER_VARIANTS {
    return PAPER_VARIANTS;
  }
}
