/**
 * JitterSeed Value Object - Deterministic seed for per-character jitter
 * Ensures preview and export render identically
 */
export class JitterSeed {
  private readonly value: number;

  constructor(seed: number) {
    if (!Number.isInteger(seed) || seed < 0) {
      throw new Error('JitterSeed must be a non-negative integer');
    }
    this.value = seed;
  }

  getValue(): number {
    return this.value;
  }

  /**
   * Generate a deterministic random number based on character index and salt
   */
  random(index: number, salt: number): number {
    const hash = this.hash32(index * 9176 + salt * 2654435761 + 17);
    return hash / 4294967296;
  }

  private hash32(value: number): number {
    let x = value >>> 0;
    x = (x ^ 61) ^ (x >>> 16);
    x = (x + (x << 3)) >>> 0;
    x = x ^ (x >>> 4);
    x = Math.imul(x, 0x27d4eb2d) >>> 0;
    x = x ^ (x >>> 15);
    return x >>> 0;
  }

  /**
   * Get jitter values for a specific character
   */
  getGlyphJitter(
    index: number,
    fontSize: number,
    maxRotation: number,
    maxBaseline: number,
    opacityRange: [number, number],
    scaleRange: [number, number]
  ): {
    rotate: number;
    dx: number;
    dy: number;
    scale: number;
    opacity: number;
  } {
    const r = (salt: number) => this.random(index, salt);

    return {
      rotate: (r(1) - 0.5) * 2 * maxRotation,
      dx: (r(2) - 0.5) * fontSize * 0.05,
      dy: (r(3) - 0.5) * maxBaseline,
      scale: scaleRange[0] + r(4) * (scaleRange[1] - scaleRange[0]),
      opacity: opacityRange[0] + r(5) * (opacityRange[1] - opacityRange[0]),
    };
  }

  /**
   * Get line-level jitter (tilt, horizontal shift)
   */
  getLineJitter(lineIndex: number, fontSize: number): {
    tilt: number;
    dx: number;
  } {
    const r = (salt: number) => this.hash32(lineIndex * 7919 + salt * 40503 + 211) / 4294967296;
    return {
      tilt: (r(1) - 0.5) * 0.7,
      dx: (r(2) - 0.5) * fontSize * 0.05,
    };
  }
}
