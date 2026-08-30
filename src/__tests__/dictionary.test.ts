import { getTranslations } from '../services/intlService';

describe('Dictionary Screen Localization and Subheadings', () => {
  it('should have complete dictionary translations and subheadings across all languages', () => {
    const locales = ['en', 'es', 'fr', 'it', 'pl', 'pt', 'ru', 'tr', 'uk', 'ar', 'fa'] as const;

    locales.forEach(locale => {
      const t = getTranslations(locale);
      expect(t.dictionaryScreen).toBeDefined();
      expect(t.dictionaryScreen.title).toBeDefined();
      expect(t.dictionaryScreen.searchPlaceholder).toBeDefined();
      expect(t.dictionaryScreen.emptySearch).toBeDefined();
      expect(t.dictionaryScreen.stammformen).toBeDefined();
      expect(t.dictionaryScreen.infinitive).toBeDefined();
      expect(t.dictionaryScreen.praeteritum3sg).toBeDefined();
      expect(t.dictionaryScreen.perfekt).toBeDefined();
      expect(t.dictionaryScreen.conjugation).toBeDefined();
      expect(t.dictionaryScreen.person).toBeDefined();
      expect(t.dictionaryScreen.present).toBeDefined();
      expect(t.dictionaryScreen.praeteritum).toBeDefined();
      expect(t.dictionaryScreen.imperative).toBeDefined();
      expect(t.dictionaryScreen.rektion).toBeDefined();
      expect(t.dictionaryScreen.examples).toBeDefined();
    });
  });
});
