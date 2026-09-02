import {
  fetchRemoteConfig,
  getAppConfig,
  getFeaturesConfig,
  getFreeDailyQuizzesLimit,
  getMaxAdGrantsPerDayLimit,
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
    expect(getFeaturesConfig().disable_first_open_paywall).toBe(false);
  });

  it('should fetch and merge remote config successfully', async () => {
    const mockRemote = {
      features: {
        free_daily_quizzes: 4,
        max_ad_grants_per_day: 8,
        disable_first_open_paywall: true,
      },
    };

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockRemote),
    });

    const updated = await fetchRemoteConfig('https://fake-url.com/app-config.json', 1000);

    expect(updated.features.free_daily_quizzes).toBe(4);
    expect(getFreeDailyQuizzesLimit()).toBe(4);
    expect(getMaxAdGrantsPerDayLimit()).toBe(8);
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
