import { getTranslations } from '../services/intlService';

describe('Navigation and Localization for Main Tabs and Screens', () => {
  it('should have practice, dictionary and verbsPracticeList translations in all languages', () => {
    const locales = ['en', 'es', 'fr', 'it', 'pl', 'pt', 'ru', 'tr', 'uk', 'ar', 'fa'] as const;

    locales.forEach(locale => {
      const t = getTranslations(locale);
      expect(t.navigation).toBeDefined();
      expect(t.navigation.practice).toBeDefined();
      expect(t.navigation.practice.length).toBeGreaterThan(0);
      expect(t.navigation.dictionary).toBeDefined();
      expect(t.navigation.dictionary.length).toBeGreaterThan(0);

      expect(t.practiceScreen.levelsButtonTitle).toBeDefined();
      expect(t.practiceScreen.levelsButtonTitle.length).toBeGreaterThan(0);
      expect(t.verbsPracticeListScreen).toBeDefined();
      expect(t.verbsPracticeListScreen.title).toBeDefined();
      expect(t.verbsPracticeListScreen.levelHeader).toBeDefined();
    });
  });
});
