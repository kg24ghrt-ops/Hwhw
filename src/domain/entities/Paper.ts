/**
 * Paper Entity
 * Represents paper specifications with support for light and dark variants
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
  // Dark mode specific
  isDark: boolean;
  inkGlow?: string;
  gridPattern?: 'lines' | 'dots' | 'none';
}

export class Paper {
  constructor(public readonly spec: PaperSpec, public readonly id: string, public readonly label: string) {}

  static create(id: string, label: string, spec: PaperSpec): Paper {
    return new Paper(spec, id, label);
  }

  get isDarkMode(): boolean {
    return this.spec.isDark;
  }

  get aspectRatio(): number {
    return this.spec.widthMm / this.spec.heightMm;
  }
}
