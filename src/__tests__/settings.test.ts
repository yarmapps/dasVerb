import { getTranslations } from '../services/intlService';

describe('Settings Screen Localization', () => {
  it('should have complete settings translations for all supported languages', () => {
    const locales = ['en', 'es', 'fr', 'it', 'pl', 'pt', 'ru', 'tr', 'uk', 'ar', 'fa'] as const;

    locales.forEach(locale => {
      const t = getTranslations(locale);
      expect(t.settingsScreen).toBeDefined();
      expect(t.settingsScreen.title).toBeDefined();
      expect(t.settingsScreen.generalSection).toBeDefined();
      expect(t.settingsScreen.audioSection).toBeDefined();
      expect(t.settingsScreen.supportSection).toBeDefined();
      expect(t.settingsScreen.appLanguage).toBeDefined();
      expect(t.settingsScreen.theme).toBeDefined();
      expect(t.settingsScreen.notifications).toBeDefined();
      expect(t.settingsScreen.soundEffects).toBeDefined();
      expect(t.settingsScreen.contactUs).toBeDefined();
      expect(t.settingsScreen.version).toBeDefined();
    });
  });
});
