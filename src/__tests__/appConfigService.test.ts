import {
  appConfigService,
  fetchRemoteConfig,
  getAppConfig,
  getFeaturesConfig,
  getFreeDailyQuizzesLimit,
  getMaxAdGrantsPerDayLimit,
  isFirstOpenPaywallDisabled,
  isPracticeNativeAdEnabled,
  isDictionaryNativeAdEnabled,
  resetAppConfigForTesting,
} from '../services/appConfigService';
import defaultConfig from '../../assets/app-config.json';

describe('appConfigService', () => {
  beforeEach(() => {
    resetAppConfigForTesting();
    jest.clearAllMocks();
  });

  it('should return default bundled config initially', () => {
    const config = getAppConfig();
    expect(config.features.free_daily_quizzes).toBe(defaultConfig.features.free_daily_quizzes);
    expect(getFreeDailyQuizzesLimit()).toBe(defaultConfig.features.free_daily_quizzes);
    expect(getMaxAdGrantsPerDayLimit()).toBe(defaultConfig.features.max_ad_grants_per_day);
    expect(getFeaturesConfig().disable_first_open_paywall).toBe(
      defaultConfig.features.disable_first_open_paywall,
    );
    expect(isFirstOpenPaywallDisabled()).toBe(
      defaultConfig.features.disable_first_open_paywall === true,
    );
    expect(isPracticeNativeAdEnabled()).toBe(
      defaultConfig.features.enable_practice_native_ad !== false,
    );
    expect(isDictionaryNativeAdEnabled()).toBe(
      defaultConfig.features.enable_dictionary_native_ad !== false,
    );
  });

  it('should fetch and merge remote config successfully within timeout', async () => {
    const mockRemote = {
      features: {
        free_daily_quizzes: 4,
        max_ad_grants_per_day: 8,
        disable_first_open_paywall: true,
        enable_practice_native_ad: false,
        enable_dictionary_native_ad: false,
      },
    };

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockRemote),
    });

    await appConfigService.init(500);

    const current = getAppConfig();
    expect(current.features.free_daily_quizzes).toBe(4);
    expect(getFreeDailyQuizzesLimit()).toBe(4);
    expect(getMaxAdGrantsPerDayLimit()).toBe(8);
    expect(isFirstOpenPaywallDisabled()).toBe(true);
    expect(isPracticeNativeAdEnabled()).toBe(false);
    expect(isDictionaryNativeAdEnabled()).toBe(false);
  });

  it('should unblock on timeout (500ms) and update cache in background when slow fetch finishes', async () => {
    let resolveSlowFetch: (value: unknown) => void;
    const slowFetchPromise = new Promise(resolve => {
      resolveSlowFetch = resolve;
    });

    global.fetch = jest.fn().mockReturnValue(slowFetchPromise);

    const initPromise = appConfigService.init(50);
    await initPromise;

    // Timeout fired, still on default config
    expect(getFreeDailyQuizzesLimit()).toBe(defaultConfig.features.free_daily_quizzes);

    // Now slow fetch completes in the background
    resolveSlowFetch!({
      ok: true,
      json: () =>
        Promise.resolve({
          features: {
            free_daily_quizzes: 10,
          },
        }),
    });

    // Wait for microtasks
    await new Promise(resolve => setTimeout(resolve, 50));

    expect(getFreeDailyQuizzesLimit()).toBe(10);
  });

  it('should fallback to bundled default on network error without crashing', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

    const fallbackConfig = await fetchRemoteConfig('https://fake-url.com/app-config.json', 100);

    expect(fallbackConfig.features.free_daily_quizzes).toBe(
      defaultConfig.features.free_daily_quizzes,
    );
    expect(getFreeDailyQuizzesLimit()).toBe(defaultConfig.features.free_daily_quizzes);
  });

  it('should fallback to bundled default on non-ok HTTP response', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 404,
    });

    const fallbackConfig = await fetchRemoteConfig('https://fake-url.com/app-config.json', 100);

    expect(fallbackConfig.features.free_daily_quizzes).toBe(
      defaultConfig.features.free_daily_quizzes,
    );
  });
});
