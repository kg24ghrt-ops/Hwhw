/**
 * Paper Renderer Configuration
 * Based on ISO 216 (A4: 210 x 297 mm), ISO/TR 10688, ISO 8254
 */

export interface PaperSpec {
  widthMm: number;
  heightMm: number;
  rulingSpacingMm: number;
  marginMm: number;
  paperTone: string;
  brightness: number;
  texture: {
    macroFrequency: number;
    macroAmplitude: number;
    mesoFrequency: number;
    mesoAmplitude: number;
    microFrequency: number;
    microAmplitude: number;
    anisotropyRatio: number;
    anisotropyAngle: number;
  };
  lighting: {
    diffuseIntensity: number;
    diffuseAngle: number;
    gradientIntensity: number;
    edgeDarkening: number;
    contactShadowOpacity: number;
    contactShadowBlur: number;
  };
  edge: {
    edgeDarkening: number;
    edgeVariation: number;
    edgeThickness: number;
  };
  ruling: {
    lineColor: string;
    lineOpacity: number;
    lineWidthMm: number;
    lineSoftness: number;
    marginColor: string;
    marginOpacity: number;
    marginWidthMm: number;
  };
}

export const PAPER_SPEC_A4_COLLEGE: PaperSpec = {
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
};

export const PAPER_SPEC_A4_WIDE: PaperSpec = {
  ...PAPER_SPEC_A4_COLLEGE,
  rulingSpacingMm: 8.7,
};

export const PAPER_SPEC_LETTER_COLLEGE: PaperSpec = {
  ...PAPER_SPEC_A4_COLLEGE,
  widthMm: 215.9,
  heightMm: 279.4,
};

export const PAPER_SPEC_LETTER_WIDE: PaperSpec = {
  ...PAPER_SPEC_LETTER_COLLEGE,
  rulingSpacingMm: 8.7,
};

export const PAPER_SPEC_A5_COLLEGE: PaperSpec = {
  widthMm: 148,
  heightMm: 210,
  rulingSpacingMm: 5.5,
  marginMm: 25,
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
};

export const PAPER_SPEC_A5_WIDE: PaperSpec = {
  ...PAPER_SPEC_A5_COLLEGE,
  rulingSpacingMm: 8.7,
};

export const PAPER_SPEC_A3_COLLEGE: PaperSpec = {
  widthMm: 297,
  heightMm: 420,
  rulingSpacingMm: 7,
  marginMm: 35,
  paperTone: '#faf9f6',
  brightness: 92,
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
  lighting: {
    diffuseIntensity: 0.95,
    diffuseAngle: -30,
    gradientIntensity: 0.015,
    edgeDarkening: 0.04,
    contactShadowOpacity: 0.025,
    contactShadowBlur: 10,
  },
  edge: {
    edgeDarkening: 0.02,
    edgeVariation: 0.01,
    edgeThickness: 0.12,
  },
  ruling: {
    lineColor: '#5b7c99',
    lineOpacity: 0.45,
    lineWidthMm: 0.09,
    lineSoftness: 0.3,
    marginColor: '#c45a5a',
    marginOpacity: 0.55,
    marginWidthMm: 0.18,
  },
};

export const PAPER_SPEC_A6_COLLEGE: PaperSpec = {
  widthMm: 105,
  heightMm: 148,
  rulingSpacingMm: 4.5,
  marginMm: 18,
  paperTone: '#faf9f6',
  brightness: 92,
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
  lighting: {
    diffuseIntensity: 0.95,
    diffuseAngle: -30,
    gradientIntensity: 0.025,
    edgeDarkening: 0.025,
    contactShadowOpacity: 0.015,
    contactShadowBlur: 6,
  },
  edge: {
    edgeDarkening: 0.012,
    edgeVariation: 0.006,
    edgeThickness: 0.08,
  },
  ruling: {
    lineColor: '#5b7c99',
    lineOpacity: 0.45,
    lineWidthMm: 0.06,
    lineSoftness: 0.3,
    marginColor: '#c45a5a',
    marginOpacity: 0.55,
    marginWidthMm: 0.12,
  },
};

export interface PaperVariant {
  id: string;
  label: string;
  spec: PaperSpec;
}

export const PAPER_VARIANTS: PaperVariant[] = [
  { id: 'a4-college', label: 'A4 · College', spec: PAPER_SPEC_A4_COLLEGE },
  { id: 'a4-wide', label: 'A4 · Wide', spec: PAPER_SPEC_A4_WIDE },
  { id: 'letter-college', label: 'Letter · College', spec: PAPER_SPEC_LETTER_COLLEGE },
  { id: 'letter-wide', label: 'Letter · Wide', spec: PAPER_SPEC_LETTER_WIDE },
  { id: 'a5-college', label: 'A5 · College', spec: PAPER_SPEC_A5_COLLEGE },
  { id: 'a5-wide', label: 'A5 · Wide', spec: PAPER_SPEC_A5_WIDE },
  { id: 'a3-college', label: 'A3 · College', spec: PAPER_SPEC_A3_COLLEGE },
  { id: 'a6-college', label: 'A6 · College', spec: PAPER_SPEC_A6_COLLEGE },
];

export function mmToPx(mm: number, dpi: number = 96): number {
  return mm * dpi / 25.4;
}

export function getAspectRatio(spec: PaperSpec): number {
  return spec.widthMm / spec.heightMm;
}

export const DEBUG_PAPER_GEOMETRY = false;
