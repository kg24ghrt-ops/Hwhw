/**
 * Paper Entity - Represents paper specifications and variants
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
  // Dark mode specific properties
  variant?: 'light' | 'dark';
  ruleStyle?: 'solid' | 'dotted' | 'grid' | 'none';
}

export interface Paper {
  id: string;
  label: string;
  spec: PaperSpec;
  variant: 'light' | 'dark';
}
