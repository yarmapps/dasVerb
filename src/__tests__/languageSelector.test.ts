import { LANGUAGES, SupportedLocales } from '../types/intl';
import { getTranslations, getDefaultLocale } from '../services/intlService';

describe('Language Selector Screen & Localization', () => {
  it('should support 22 languages', () => {
    expect(LANGUAGES.length).toBe(22);
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
      'de',
      'es',
      'fr',
      'it',
      'pt',
      'nl',
      'pl',
      'cs',
      'sk',
      'sl',
      'hr',
      'hu',
      'ro',
      'el',
      'ru',
      'uk',
      'tr',
      'vi',
      'id',
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
    const t = getTranslations('xx');
    expect(t.languageSelectorScreen.title).toBe(getTranslations('en').languageSelectorScreen.title);
  });
});
