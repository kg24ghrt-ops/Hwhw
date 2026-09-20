/**
 * LanguageCode Value Object
 */
export type LanguageCode = 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'ja' | 'zh';

export function isValidLanguageCode(code: string): code is LanguageCode {
  return ['en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'zh'].includes(code);
}
