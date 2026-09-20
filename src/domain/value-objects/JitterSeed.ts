/**
 * JitterSeed Value Object
 * Ensures deterministic per-character jitter for consistent preview/export
 */
export class JitterSeed {
  private constructor(public readonly value: number) {}

  static create(seed?: number): JitterSeed {
    const value = seed ?? Math.floor(Math.random() * 4294967296);
    return new JitterSeed(value >>> 0);
  }

  static fromJSON(json: number): JitterSeed {
    return new JitterSeed(json >>> 0);
  }

  toJSON(): number {
    return this.value;
  }

  /** Generate a deterministic random value for a given character index */
  randomAt(index: number, salt: number = 0): number {
    return hash32(this.value ^ (index * 9176 + salt * 2654435761 + 17)) / 4294967296;
  }
}

function hash32(value: number): number {
  let x = value >>> 0;
  x = (x ^ 61) ^ (x >>> 16);
  x = (x + (x << 3)) >>> 0;
  x = x ^ (x >>> 4);
  x = Math.imul(x, 0x27d4eb2d) >>> 0;
  x = x ^ (x >>> 15);
  return x >>> 0;
}
