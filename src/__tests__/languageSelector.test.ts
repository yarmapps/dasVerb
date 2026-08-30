import { LANGUAGES, SupportedLocales } from '../types/intl';
import { getTranslations, getDefaultLocale } from '../services/intlService';

describe('Language Selector Screen & Localization', () => {
  it('should support 11 languages', () => {
    expect(LANGUAGES.length).toBe(11);
  });

  it('should have default locale set to en', () => {
    expect(getDefaultLocale()).toBe('en');
  });

  it('should have correct metadata for all languages', () => {
    LANGUAGES.forEach(lang => {
      expect(lang.code).toBeDefined();
      expect(lang.name).toBeDefined();
      expect(lang.flag).toBeDefined();
    });
  });

  it('should provide valid translations for every supported language', () => {
    const expectedLocales: SupportedLocales[] = [
      'en',
      'es',
      'fr',
      'it',
      'pl',
      'pt',
      'ru',
      'tr',
      'uk',
      'ar',
      'fa',
    ];

    expectedLocales.forEach(locale => {
      const t = getTranslations(locale);
      expect(t).toBeDefined();
      expect(t.languageSelectorScreen).toBeDefined();
      expect(t.languageSelectorScreen.title.length).toBeGreaterThan(0);
      expect(t.languageSelectorScreen.continue.length).toBeGreaterThan(0);
    });
  });

  it('should fallback to English for unknown locales', () => {
    // @ts-expect-error Testing fallback
    const t = getTranslations('de');
    expect(t.languageSelectorScreen.title).toBe(getTranslations('en').languageSelectorScreen.title);
  });
});
