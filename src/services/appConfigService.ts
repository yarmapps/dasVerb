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
const DEFAULT_FETCH_TIMEOUT_MS = 3000;
const STORAGE_KEY_CACHED_CONFIG = 'cached_remote_config';

const storage = createStorage('app-config');

let currentConfig: AppConfig = loadInitialConfig();

function loadInitialConfig(): AppConfig {
  try {
    const raw = storage.getString(STORAGE_KEY_CACHED_CONFIG);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && parsed.features) {
        return {
          ...defaultConfig,
          ...parsed,
          features: {
            ...defaultConfig.features,
            ...parsed.features,
          },
        };
      }
    }
  } catch {
    // Ignore storage parse errors and fallback to bundled default
  }
  return defaultConfig;
}

export async function fetchRemoteConfig(
  url = REMOTE_CONFIG_URL,
  timeoutMs = DEFAULT_FETCH_TIMEOUT_MS,
): Promise<AppConfig> {
  const abortController = new AbortController();
  const timeoutId = setTimeout(() => {
    abortController.abort();
  }, timeoutMs);

  try {
    const response = await fetch(url, {
      signal: abortController.signal,
      headers: {
        'Cache-Control': 'no-cache',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return currentConfig;
    }

    const fetchedJson = (await response.json()) as Partial<AppConfig>;
    if (fetchedJson && typeof fetchedJson === 'object' && fetchedJson.features) {
      const mergedConfig: AppConfig = {
        ios: fetchedJson.ios || defaultConfig.ios,
        android: fetchedJson.android || defaultConfig.android,
        features: {
          ...defaultConfig.features,
          ...fetchedJson.features,
        },
      };

      currentConfig = mergedConfig;
      storage.set(STORAGE_KEY_CACHED_CONFIG, JSON.stringify(mergedConfig));
      return mergedConfig;
    }
  } catch {
    // Timeout or network error: gracefully keep current / default config
  } finally {
    clearTimeout(timeoutId);
  }

  return currentConfig;
}

export function getAppConfig(): AppConfig {
  return currentConfig;
}

export function getFeaturesConfig(): FeaturesConfig {
  return currentConfig.features;
}

export function isFirstOpenPaywallDisabled(): boolean {
  return currentConfig.features.disable_first_open_paywall === true;
}

export function getFreeDailyQuizzesLimit(): number {
  const customLimit = currentConfig.features.free_daily_quizzes;
  return typeof customLimit === 'number' ? customLimit : defaultConfig.features.free_daily_quizzes;
}

export function getMaxAdGrantsPerDayLimit(): number {
  const customLimit = currentConfig.features.max_ad_grants_per_day;
  return typeof customLimit === 'number'
    ? customLimit
    : defaultConfig.features.max_ad_grants_per_day;
}

export function resetAppConfigForTesting(): void {
  currentConfig = defaultConfig;
  storage.delete(STORAGE_KEY_CACHED_CONFIG);
}
