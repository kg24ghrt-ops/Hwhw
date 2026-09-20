/**
 * PaperService - Application service for paper specifications
 * Includes dark theme variants
 */
import type { Paper, PaperSpec } from '../../domain/entities/Paper';

export class PaperService {
  private papers: Map<string, Paper> = new Map();

  constructor() {
    this.initializePapers();
  }

  private initializePapers(): void {
    // Light variants (existing)
    this.registerPaper({
      id: 'a4-college',
      label: 'A4 · College',
      spec: this.createA4CollegeSpec(),
      variant: 'light',
    });

    this.registerPaper({
      id: 'a4-wide',
      label: 'A4 · Wide',
      spec: { ...this.createA4CollegeSpec(), rulingSpacingMm: 8.7 },
      variant: 'light',
    });

    this.registerPaper({
      id: 'letter-college',
      label: 'Letter · College',
      spec: { ...this.createA4CollegeSpec(), widthMm: 215.9, heightMm: 279.4 },
      variant: 'light',
    });

    this.registerPaper({
      id: 'letter-wide',
      label: 'Letter · Wide',
      spec: { ...this.createA4CollegeSpec(), widthMm: 215.9, heightMm: 279.4, rulingSpacingMm: 8.7 },
      variant: 'light',
    });

    this.registerPaper({
      id: 'a5-college',
      label: 'A5 · College',
      spec: this.createA5CollegeSpec(),
      variant: 'light',
    });

    this.registerPaper({
      id: 'a5-wide',
      label: 'A5 · Wide',
      spec: { ...this.createA5CollegeSpec(), rulingSpacingMm: 8.7 },
      variant: 'light',
    });

    this.registerPaper({
      id: 'a3-college',
      label: 'A3 · College',
      spec: this.createA3CollegeSpec(),
      variant: 'light',
    });

    this.registerPaper({
      id: 'a6-college',
      label: 'A6 · College',
      spec: this.createA6CollegeSpec(),
      variant: 'light',
    });

    // Dark variants (NEW)
    this.registerPaper({
      id: 'black-leather',
      label: 'Black Leather Journal',
      spec: this.createBlackLeatherSpec(),
      variant: 'dark',
    });

    this.registerPaper({
      id: 'blueprint',
      label: 'Blueprint',
      spec: this.createBlueprintSpec(),
      variant: 'dark',
    });

    this.registerPaper({
      id: 'chalkboard',
      label: 'Chalkboard',
      spec: this.createChalkboardSpec(),
      variant: 'dark',
    });

    this.registerPaper({
      id: 'dark-legal',
      label: 'Dark Legal Pad',
      spec: this.createDarkLegalSpec(),
      variant: 'dark',
    });

    this.registerPaper({
      id: 'night-grid',
      label: 'Night Grid',
      spec: this.createNightGridSpec(),
      variant: 'dark',
    });
  }

  private registerPaper(paper: Paper): void {
    this.papers.set(paper.id, paper);
  }

  async findById(id: string): Promise<Paper | null> {
    return this.papers.get(id) || null;
  }

  async findAll(): Promise<Paper[]> {
    return Array.from(this.papers.values());
  }

  async findDarkVariants(): Promise<Paper[]> {
    return Array.from(this.papers.values()).filter(p => p.variant === 'dark');
  }

  async findLightVariants(): Promise<Paper[]> {
    return Array.from(this.papers.values()).filter(p => p.variant === 'light');
  }

  // Paper spec factories
  private createA4CollegeSpec(): PaperSpec {
    return {
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
  }

  private createA5CollegeSpec(): PaperSpec {
    return {
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
  }

  private createA3CollegeSpec(): PaperSpec {
    return {
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
  }

  private createA6CollegeSpec(): PaperSpec {
    return {
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
  }

  // Dark variant specs
  private createBlackLeatherSpec(): PaperSpec {
    return {
      widthMm: 210,
      heightMm: 297,
      rulingSpacingMm: 6,
      marginMm: 30,
      paperTone: '#1a1a1d', // Charcoal
      brightness: 45,
      variant: 'dark',
      ruleStyle: 'solid',
      texture: {
        macroFrequency: 0.0008,
        macroAmplitude: 0.02,
        mesoFrequency: 0.003,
        mesoAmplitude: 0.04,
        microFrequency: 0.025,
        microAmplitude: 0.03,
        anisotropyRatio: 1.2,
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
        edgeDarkening: 0.08,
        edgeVariation: 0.04,
        edgeThickness: 0.2,
      },
      ruling: {
        lineColor: '#4a4a4a',
        lineOpacity: 0.3,
        lineWidthMm: 0.1,
        lineSoftness: 0.5,
        marginColor: '#5a5a5a',
        marginOpacity: 0.35,
        marginWidthMm: 0.2,
      },
    };
  }

  private createBlueprintSpec(): PaperSpec {
    return {
      widthMm: 210,
      heightMm: 297,
      rulingSpacingMm: 5,
      marginMm: 28,
      paperTone: '#0a1628', // Navy blue
      brightness: 40,
      variant: 'dark',
      ruleStyle: 'grid',
      texture: {
        macroFrequency: 0.0003,
        macroAmplitude: 0.01,
        mesoFrequency: 0.0015,
        mesoAmplitude: 0.02,
        microFrequency: 0.015,
        microAmplitude: 0.015,
        anisotropyRatio: 1.0,
        anisotropyAngle: 0,
      },
      lighting: {
        diffuseIntensity: 0.65,
        diffuseAngle: -45,
        gradientIntensity: 0.05,
        edgeDarkening: 0.12,
        contactShadowOpacity: 0.08,
        contactShadowBlur: 10,
      },
      edge: {
        edgeDarkening: 0.06,
        edgeVariation: 0.03,
        edgeThickness: 0.15,
      },
      ruling: {
        lineColor: '#1a3a5c',
        lineOpacity: 0.5,
        lineWidthMm: 0.06,
        lineSoftness: 0.2,
        marginColor: '#2a5a8c',
        marginOpacity: 0.4,
        marginWidthMm: 0.15,
      },
    };
  }

  private createChalkboardSpec(): PaperSpec {
    return {
      widthMm: 210,
      heightMm: 297,
      rulingSpacingMm: 6.5,
      marginMm: 32,
      paperTone: '#0d110f', // Dark green/black
      brightness: 35,
      variant: 'dark',
      ruleStyle: 'solid',
      texture: {
        macroFrequency: 0.001,
        macroAmplitude: 0.025,
        mesoFrequency: 0.004,
        mesoAmplitude: 0.05,
        microFrequency: 0.03,
        microAmplitude: 0.04,
        anisotropyRatio: 1.3,
        anisotropyAngle: 90,
      },
      lighting: {
        diffuseIntensity: 0.6,
        diffuseAngle: -20,
        gradientIntensity: 0.06,
        edgeDarkening: 0.18,
        contactShadowOpacity: 0.12,
        contactShadowBlur: 14,
      },
      edge: {
        edgeDarkening: 0.1,
        edgeVariation: 0.05,
        edgeThickness: 0.25,
      },
      ruling: {
        lineColor: '#1a2a22',
        lineOpacity: 0.25,
        lineWidthMm: 0.12,
        lineSoftness: 0.6,
        marginColor: '#2a3a32',
        marginOpacity: 0.3,
        marginWidthMm: 0.2,
      },
    };
  }

  private createDarkLegalSpec(): PaperSpec {
    return {
      widthMm: 215.9,
      heightMm: 279.4,
      rulingSpacingMm: 6,
      marginMm: 30,
      paperTone: '#2a2a2e', // Dark gray
      brightness: 42,
      variant: 'dark',
      ruleStyle: 'solid',
      texture: {
        macroFrequency: 0.0005,
        macroAmplitude: 0.015,
        mesoFrequency: 0.0025,
        mesoAmplitude: 0.035,
        microFrequency: 0.02,
        microAmplitude: 0.025,
        anisotropyRatio: 1.1,
        anisotropyAngle: 0,
      },
      lighting: {
        diffuseIntensity: 0.7,
        diffuseAngle: -30,
        gradientIntensity: 0.04,
        edgeDarkening: 0.1,
        contactShadowOpacity: 0.08,
        contactShadowBlur: 10,
      },
      edge: {
        edgeDarkening: 0.05,
        edgeVariation: 0.025,
        edgeThickness: 0.15,
      },
      ruling: {
        lineColor: '#3a3a2e', // Gold-ish rules
        lineOpacity: 0.4,
        lineWidthMm: 0.08,
        lineSoftness: 0.3,
        marginColor: '#4a4a3e',
        marginOpacity: 0.45,
        marginWidthMm: 0.18,
      },
    };
  }

  private createNightGridSpec(): PaperSpec {
    return {
      widthMm: 210,
      heightMm: 297,
      rulingSpacingMm: 5,
      marginMm: 28,
      paperTone: '#0a0a0a', // Black
      brightness: 38,
      variant: 'dark',
      ruleStyle: 'grid',
      texture: {
        macroFrequency: 0.0004,
        macroAmplitude: 0.01,
        mesoFrequency: 0.002,
        mesoAmplitude: 0.025,
        microFrequency: 0.018,
        microAmplitude: 0.02,
        anisotropyRatio: 1.0,
        anisotropyAngle: 0,
      },
      lighting: {
        diffuseIntensity: 0.65,
        diffuseAngle: -35,
        gradientIntensity: 0.03,
        edgeDarkening: 0.08,
        contactShadowOpacity: 0.06,
        contactShadowBlur: 8,
      },
      edge: {
        edgeDarkening: 0.04,
        edgeVariation: 0.02,
        edgeThickness: 0.12,
      },
      ruling: {
        lineColor: '#1a1a1a',
        lineOpacity: 0.35,
        lineWidthMm: 0.05,
        lineSoftness: 0.4,
        marginColor: '#2a2a2a',
        marginOpacity: 0.4,
        marginWidthMm: 0.15,
      },
    };
  }
}

// Singleton instance
export const paperService = new PaperService();
