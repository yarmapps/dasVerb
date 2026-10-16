import { SupportedLocales } from '../types/intl';
import { createStorage } from './storageService';

const storage = createStorage('app-settings');

const SETTINGS_KEY = 'settings';
const LANGUAGE_KEY = 'language_settings';

export type QuizInputMode = 'choice' | 'type_in' | 'speaking';

export interface AppSettings {
  soundEffects: boolean;
  notifications: boolean;
  themeMode: 'light' | 'dark' | 'system';
  speakOnCorrectAnswer: boolean;
  ttsVoiceGender: 'female' | 'male';
  completedQuizCount: number;
  lastReviewPromptDate: string | null;
  hasPromptedNameOnLaunch?: boolean;
  quizInputMode: QuizInputMode;
}

const DEFAULT_SETTINGS: AppSettings = {
  soundEffects: true,
  notifications: true,
  themeMode: 'system',
  speakOnCorrectAnswer: true,
  ttsVoiceGender: 'male',
  completedQuizCount: 0,
  lastReviewPromptDate: null,
  hasPromptedNameOnLaunch: false,
  quizInputMode: 'choice',
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

let settingsSyncTimeout: ReturnType<typeof setTimeout> | null = null;

function triggerSettingsSync(): void {
  if (process.env.NODE_ENV === 'test') {
    return;
  }
  if (settingsSyncTimeout) {
    clearTimeout(settingsSyncTimeout);
  }
  settingsSyncTimeout = setTimeout(() => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { syncSettings } = require('./cloudSyncService');
      syncSettings().catch(() => {});
    } catch {
      // Best effort
    }
  }, 1000);
  if (typeof settingsSyncTimeout?.unref === 'function') {
    settingsSyncTimeout.unref();
  }
}

export function updateSettings(newSettings: Partial<AppSettings>, skipSync = false): void {
  try {
    const currentSettings = getSettings();
    const updatedSettings = { ...currentSettings, ...newSettings };
    storage.set(SETTINGS_KEY, JSON.stringify(updatedSettings));
    if (!skipSync) {
      triggerSettingsSync();
    }
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

/**
 * Returns effective quiz input mode taking into account premium status.
 * If user lacks premium, falls back to 'choice' regardless of saved preference.
 */
export function getEffectiveQuizInputMode(): QuizInputMode {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { isPremiumEnabled } = require('./premiumAccessService');
  const settings = getSettings();
  if (settings.quizInputMode === 'type_in' && isPremiumEnabled()) {
    return 'type_in';
  }
  if (settings.quizInputMode === 'speaking' && isPremiumEnabled()) {
    return 'speaking';
  }
  return 'choice';
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

export function updateLanguageSettings(
  selected: boolean,
  lang: SupportedLocales | null,
  skipSync = false,
): void {
  try {
    storage.set(
      LANGUAGE_KEY,
      JSON.stringify({ isLanguageSelected: selected, nativeLanguage: lang }),
    );
    if (!skipSync) {
      triggerSettingsSync();
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
  }
}
