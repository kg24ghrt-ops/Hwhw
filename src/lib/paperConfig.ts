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

export function mmToPx(mm: number, dpi: number = 96): number {
  return mm * dpi / 25.4;
}

export function getAspectRatio(spec: PaperSpec): number {
  return spec.widthMm / spec.heightMm;
}

export const DEBUG_PAPER_GEOMETRY = false;
