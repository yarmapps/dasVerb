import {
  getSettings,
  updateSettings,
  getNativeLanguage,
  getIsLanguageSelected,
  updateLanguageSettings,
} from '../services/settingsService';

describe('settingsService with MMKV', () => {
  it('should return default settings initially', () => {
    const settings = getSettings();
    expect(settings).toBeDefined();
    expect(settings.soundEffects).toBe(true);
    expect(settings.notifications).toBe(true);
    expect(settings.themeMode).toBe('system');
  });

  it('should update settings properly', () => {
    updateSettings({ soundEffects: false, themeMode: 'dark' });
    const settings = getSettings();
    expect(settings.soundEffects).toBe(false);
    expect(settings.themeMode).toBe('dark');
  });

  it('should manage language settings properly', () => {
    expect(getIsLanguageSelected()).toBe(false);
    expect(getNativeLanguage()).toBeNull();

    updateLanguageSettings(true, 'en');
    expect(getIsLanguageSelected()).toBe(true);
    expect(getNativeLanguage()).toBe('en');

    updateLanguageSettings(true, 'ru');
    expect(getIsLanguageSelected()).toBe(true);
    expect(getNativeLanguage()).toBe('ru');
  });
});
