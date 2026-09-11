import { SupportedLocales } from '../types/intl';
import { createStorage } from './storageService';

const storage = createStorage('app-settings');

const SETTINGS_KEY = 'settings';
const LANGUAGE_KEY = 'language_settings';

export interface AppSettings {
  soundEffects: boolean;
  notifications: boolean;
  themeMode: 'light' | 'dark' | 'system';
  speakOnCorrectAnswer: boolean;
  ttsVoiceGender: 'female' | 'male';
  completedQuizCount: number;
  lastReviewPromptDate: string | null;
}

const DEFAULT_SETTINGS: AppSettings = {
  soundEffects: true,
  notifications: true,
  themeMode: 'system',
  speakOnCorrectAnswer: true,
  ttsVoiceGender: 'female',
  completedQuizCount: 0,
  lastReviewPromptDate: null,
};

export function getSettings(): AppSettings {
  try {
    const raw = storage.getString(SETTINGS_KEY);
    if (raw) {
      const settings = JSON.parse(raw);
      return { ...DEFAULT_SETTINGS, ...settings };
    }
    return DEFAULT_SETTINGS;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error getting settings:', error);
    return DEFAULT_SETTINGS;
  }
}

export function updateSettings(newSettings: Partial<AppSettings>): void {
  try {
    const currentSettings = getSettings();
    const updatedSettings = { ...currentSettings, ...newSettings };
    storage.set(SETTINGS_KEY, JSON.stringify(updatedSettings));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error updating settings:', error);
  }
}

export function resetLanguageSettings(): void {
  try {
    storage.delete(LANGUAGE_KEY);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
  }
}

export function resetAllSettings(): void {
  try {
    storage.set(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
    storage.delete(LANGUAGE_KEY);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error resetting settings:', error);
  }
}

export function getNativeLanguage(): SupportedLocales | null {
  try {
    const raw = storage.getString(LANGUAGE_KEY);
    if (raw) return JSON.parse(raw).nativeLanguage || null;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
  }
  return null;
}

export function getIsLanguageSelected(): boolean {
  try {
    const raw = storage.getString(LANGUAGE_KEY);
    if (raw) return JSON.parse(raw).isLanguageSelected || false;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
  }
  return false;
}

export function updateLanguageSettings(selected: boolean, lang: SupportedLocales | null): void {
  try {
    storage.set(
      LANGUAGE_KEY,
      JSON.stringify({ isLanguageSelected: selected, nativeLanguage: lang }),
    );
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
  }
}
