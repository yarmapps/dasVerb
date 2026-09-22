import defaultConfig from '../../assets/app-config.json';
import { createStorage } from './storageService';

export interface PlatformVersionConfig {
  minimum_version: string;
  latest_version: string;
  update_url: string;
}

export interface FeaturesConfig {
  disable_first_open_paywall?: boolean;
  free_daily_quizzes?: number;
  max_ad_grants_per_day?: number;
  [key: string]: unknown;
}

export interface AppConfig {
  ios: PlatformVersionConfig;
  android: PlatformVersionConfig;
  features: FeaturesConfig;
}

export const REMOTE_CONFIG_URL = 'https://das-verb.yapps.studio/app-config.json';
const STORAGE_KEY_CACHED_CONFIG = 'cached_remote_config';

const storage = createStorage('app-remote-config');

class AppConfigService {
  private currentConfig: AppConfig = defaultConfig;
  private isInitialized = false;

  constructor() {
    this.resolveFallbackConfig();
  }

  /**
   * Resolves fallback config: first checks MMKV cache, otherwise falls back to bundled assets/app-config.json
   */
  public resolveFallbackConfig(): void {
    try {
      const raw = storage.getString(STORAGE_KEY_CACHED_CONFIG);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          this.currentConfig = {
            ios: parsed.ios || defaultConfig.ios,
            android: parsed.android || defaultConfig.android,
            features: {
              ...defaultConfig.features,
              ...(parsed.features || {}),
            },
          };
          return;
        }
      }
    } catch (e) {
      console.warn('[AppConfigService] Error reading stored config:', e);
    }

    this.currentConfig = defaultConfig;
  }

  /**
   * Initializes remote config on app startup.
   * Sends a network request and waits with a strict timeout (500ms by default).
   * - If network succeeds within timeout: applies & saves to storage.
   * - If timeout / error: uses cache (or bundled JSON), while background fetch continues to update storage.
   */
  async init(timeoutMs = 500): Promise<void> {
    if (this.isInitialized) return;

    let timeoutFired = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const timeoutPromise = new Promise<void>(resolve => {
      timer = setTimeout(() => {
        timeoutFired = true;
        resolve();
      }, timeoutMs);
    });

    const fetchPromise = this.fetchAndSaveRemoteConfig();

    await Promise.race([fetchPromise, timeoutPromise]);

    if (timer) {
      clearTimeout(timer);
    }

    if (timeoutFired) {
      console.log(
        `[AppConfigService] Init timed out after ${timeoutMs}ms, proceeding with cached/fallback config.`,
      );
    }

    this.isInitialized = true;
  }

  /**
   * Fetches remote config from server, updates in-memory state and saves to storage.
   * Background request continues even if init() timed out.
   */
  async fetchAndSaveRemoteConfig(url = REMOTE_CONFIG_URL): Promise<AppConfig | null> {
    try {
      const response = await fetch(url, {
        headers: {
          'Cache-Control': 'no-cache',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch remote config: ${response.status}`);
      }

      const fetchedJson = (await response.json()) as Partial<AppConfig>;
      if (fetchedJson && typeof fetchedJson === 'object') {
        const mergedConfig: AppConfig = {
          ios: fetchedJson.ios || defaultConfig.ios,
          android: fetchedJson.android || defaultConfig.android,
          features: {
            ...defaultConfig.features,
            ...(fetchedJson.features || {}),
          },
        };

        this.currentConfig = mergedConfig;
        try {
          storage.set(STORAGE_KEY_CACHED_CONFIG, JSON.stringify(mergedConfig));
        } catch (e) {
          console.warn('[AppConfigService] Error saving to storage:', e);
        }
        return mergedConfig;
      }
    } catch (error) {
      console.warn('[AppConfigService] Network fetch failed, keeping fallback:', error);
    }
    return null;
  }

  getAppConfig(): AppConfig {
    return this.currentConfig;
  }

  getFeaturesConfig(): FeaturesConfig {
    return this.currentConfig.features;
  }

  isFirstOpenPaywallDisabled(): boolean {
    return this.currentConfig.features.disable_first_open_paywall === true;
  }

  getFreeDailyQuizzesLimit(): number {
    const customLimit = this.currentConfig.features.free_daily_quizzes;
    return typeof customLimit === 'number'
      ? customLimit
      : defaultConfig.features.free_daily_quizzes;
  }

  getMaxAdGrantsPerDayLimit(): number {
    const customLimit = this.currentConfig.features.max_ad_grants_per_day;
    return typeof customLimit === 'number'
      ? customLimit
      : defaultConfig.features.max_ad_grants_per_day;
  }

  resetAppConfigForTesting(): void {
    this.currentConfig = defaultConfig;
    this.isInitialized = false;
    storage.delete(STORAGE_KEY_CACHED_CONFIG);
  }
}

export const appConfigService = new AppConfigService();

export async function fetchRemoteConfig(
  url = REMOTE_CONFIG_URL,
  timeoutMs = 500,
): Promise<AppConfig> {
  if (url === REMOTE_CONFIG_URL) {
    await appConfigService.init(timeoutMs);
  } else {
    const customResult = await appConfigService.fetchAndSaveRemoteConfig(url);
    if (customResult) return customResult;
  }
  return appConfigService.getAppConfig();
}

export function getAppConfig(): AppConfig {
  return appConfigService.getAppConfig();
}

export function getFeaturesConfig(): FeaturesConfig {
  return appConfigService.getFeaturesConfig();
}

export function isFirstOpenPaywallDisabled(): boolean {
  return appConfigService.isFirstOpenPaywallDisabled();
}

export function getFreeDailyQuizzesLimit(): number {
  return appConfigService.getFreeDailyQuizzesLimit();
}

export function getMaxAdGrantsPerDayLimit(): number {
  return appConfigService.getMaxAdGrantsPerDayLimit();
}

export function resetAppConfigForTesting(): void {
  appConfigService.resetAppConfigForTesting();
}
