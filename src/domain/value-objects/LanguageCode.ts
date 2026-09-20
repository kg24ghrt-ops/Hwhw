/**
 * LanguageCode Value Object - ISO 639-1 language codes
 */
export class LanguageCode {
  private readonly value: string;

  constructor(code: string) {
    const normalized = code.toLowerCase();
    if (!/^[a-z]{2}$/.test(normalized)) {
      throw new Error('Invalid ISO 639-1 language code');
    }
    this.value = normalized;
  }

  getValue(): string {
    return this.value;
  }

  toString(): string {
    return this.value;
  }
}
