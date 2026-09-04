import {
  logEvent,
  logScreenView,
  setUserId as fbSetUserId,
  setUserProperty as fbSetUserProperty,
  setUserProperties as fbSetUserProperties,
  setAnalyticsCollectionEnabled as fbSetAnalyticsCollectionEnabled,
  resetAnalyticsData as fbResetAnalyticsData,
} from '@react-native-firebase/analytics';
import {
  initializeAnalytics,
  trackEvent,
  trackCustomEvent,
  trackScreenView,
  setUserId,
  setUserProperty,
  setUserProperties,
  setAnalyticsCollectionEnabled,
  resetAnalyticsData,
} from '../analyticsService';

describe('analyticsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize analytics successfully', async () => {
    await initializeAnalytics();
    expect(fbSetAnalyticsCollectionEnabled).toHaveBeenCalledWith(
      expect.objectContaining({ app: expect.anything() }),
      true,
    );
  });

  it('should track typed events with parameters', async () => {
    await trackEvent('dictionary_search', {
      search_term: 'gehen',
      query_length: 5,
      results_count: 3,
    });

    expect(logEvent).toHaveBeenCalledWith(
      expect.objectContaining({ app: expect.anything() }),
      'dictionary_search',
      {
        search_term: 'gehen',
        query_length: 5,
        results_count: 3,
      },
    );
  });

  it('should track dictionary search when no results found', async () => {
    await trackEvent('dictionary_search_no_results', {
      search_term: 'unknownword',
      query_length: 11,
    });

    expect(logEvent).toHaveBeenCalledWith(
      expect.objectContaining({ app: expect.anything() }),
      'dictionary_search_no_results',
      {
        search_term: 'unknownword',
        query_length: 11,
      },
    );
  });

  it('should track custom events', async () => {
    await trackCustomEvent('custom_quiz_clicked', {
      from: 'banner',
      retry_count: 1,
    });

    expect(logEvent).toHaveBeenCalledWith(
      expect.objectContaining({ app: expect.anything() }),
      'custom_quiz_clicked',
      {
        from: 'banner',
        retry_count: 1,
      },
    );
  });

  it('should track screen views', async () => {
    await trackScreenView('Practice');

    expect(logScreenView).toHaveBeenCalledWith(
      expect.objectContaining({ app: expect.anything() }),
      {
        screen_name: 'Practice',
        screen_class: 'Practice',
      },
    );
  });

  it('should support custom screen_class for screen views', async () => {
    await trackScreenView('VerbQuiz', 'ModalView');

    expect(logScreenView).toHaveBeenCalledWith(
      expect.objectContaining({ app: expect.anything() }),
      {
        screen_name: 'VerbQuiz',
        screen_class: 'ModalView',
      },
    );
  });

  it('should set user ID', async () => {
    await setUserId('user_12345');
    expect(fbSetUserId).toHaveBeenCalledWith(
      expect.objectContaining({ app: expect.anything() }),
      'user_12345',
    );

    await setUserId(null);
    expect(fbSetUserId).toHaveBeenCalledWith(
      expect.objectContaining({ app: expect.anything() }),
      null,
    );
  });

  it('should set user property', async () => {
    await setUserProperty('app_language', 'de');
    expect(fbSetUserProperty).toHaveBeenCalledWith(
      expect.objectContaining({ app: expect.anything() }),
      'app_language',
      'de',
    );
  });

  it('should set multiple user properties and omit undefined', async () => {
    await setUserProperties({
      app_language: 'ru',
      is_premium: 'true',
      selected_level: undefined,
    });

    expect(fbSetUserProperties).toHaveBeenCalledWith(
      expect.objectContaining({ app: expect.anything() }),
      {
        app_language: 'ru',
        is_premium: 'true',
      },
    );
  });

  it('should enable or disable collection', async () => {
    await setAnalyticsCollectionEnabled(false);
    expect(fbSetAnalyticsCollectionEnabled).toHaveBeenCalledWith(
      expect.objectContaining({ app: expect.anything() }),
      false,
    );

    await setAnalyticsCollectionEnabled(true);
    expect(fbSetAnalyticsCollectionEnabled).toHaveBeenCalledWith(
      expect.objectContaining({ app: expect.anything() }),
      true,
    );
  });

  it('should reset analytics data', async () => {
    await resetAnalyticsData();
    expect(fbResetAnalyticsData).toHaveBeenCalledTimes(1);
  });

  it('should not throw if an analytics call encounters an error', async () => {
    (logEvent as jest.Mock).mockImplementationOnce(() => {
      throw new Error('Native analytics error simulation');
    });

    // Should resolve smoothly without throwing uncaught exception
    await expect(
      trackEvent('quiz_started', {
        quiz_type: 'verb',
        infinitive: 'sein',
        level: 'A1',
        total_questions: 10,
      }),
    ).resolves.toBeUndefined();
  });
});
