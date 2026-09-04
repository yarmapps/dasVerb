import {
  getAnalytics,
  logEvent as fbLogEvent,
  logScreenView as fbLogScreenView,
  setUserId as fbSetUserId,
  setUserProperty as fbSetUserProperty,
  setUserProperties as fbSetUserProperties,
  setAnalyticsCollectionEnabled as fbSetAnalyticsCollectionEnabled,
  resetAnalyticsData as fbResetAnalyticsData,
  Analytics,
} from '@react-native-firebase/analytics';
import {
  AnalyticsEventMap,
  AnalyticsEventName,
  AnalyticsScreenName,
  AnalyticsUserProperties,
} from '../types/analytics.types';

let cachedAnalyticsInstance: Analytics | null = null;
let isAnalyticsInitialized = false;

function getSafeAnalytics(): Analytics | null {
  if (cachedAnalyticsInstance) {
    return cachedAnalyticsInstance;
  }
  try {
    cachedAnalyticsInstance = getAnalytics();
    return cachedAnalyticsInstance;
  } catch (error) {
    if (__DEV__) {
      console.warn('[Analytics] Unable to acquire Analytics instance:', error);
    }
    return null;
  }
}

/**
 * Initializes analytics collection and flags state.
 * Safe to call multiple times; guards against uncaught native errors.
 */
export async function initializeAnalytics(): Promise<void> {
  if (isAnalyticsInitialized) {
    return;
  }

  try {
    const analytics = getSafeAnalytics();
    if (analytics) {
      await fbSetAnalyticsCollectionEnabled(analytics, true);
      isAnalyticsInitialized = true;
      if (__DEV__) {
        console.log('[Analytics] Initialized successfully');
      }
    }
  } catch (error) {
    if (__DEV__) {
      console.warn('[Analytics] Initialization warning (expected in Expo Go / dev):', error);
    }
  }
}

/**
 * Tracks a strongly typed event with domain-specific parameters.
 */
export async function trackEvent<T extends AnalyticsEventName>(
  eventName: T,
  params?: AnalyticsEventMap[T],
): Promise<void> {
  try {
    if (__DEV__) {
      console.log(`[Analytics] Track Event: ${eventName}`, params ?? '');
    }
    const analytics = getSafeAnalytics();
    if (analytics) {
      const eventParams = (params ?? {}) as Record<string, string | number | boolean>;
      await fbLogEvent(analytics, eventName, eventParams);
    }
  } catch (error) {
    if (__DEV__) {
      console.warn(`[Analytics] Failed to track event "${eventName}":`, error);
    }
  }
}

/**
 * Tracks an arbitrary custom event with parameters.
 */
export async function trackCustomEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>,
): Promise<void> {
  try {
    if (__DEV__) {
      console.log(`[Analytics] Track Custom Event: ${eventName}`, params ?? '');
    }
    const analytics = getSafeAnalytics();
    if (analytics) {
      await fbLogEvent(analytics, eventName, params ?? {});
    }
  } catch (error) {
    if (__DEV__) {
      console.warn(`[Analytics] Failed to track custom event "${eventName}":`, error);
    }
  }
}

/**
 * Backward compatibility alias for trackCustomEvent.
 */
export const logAnalyticsEvent = trackCustomEvent;

/**
 * Tracks screen view transitions.
 */
export async function trackScreenView(
  screenName: AnalyticsScreenName,
  screenClass?: string,
): Promise<void> {
  try {
    if (__DEV__) {
      console.log(`[Analytics] Screen View: ${screenName}`);
    }
    const analytics = getSafeAnalytics();
    if (analytics) {
      await fbLogScreenView(analytics, {
        screen_name: screenName,
        screen_class: screenClass ?? screenName,
      });
    }
  } catch (error) {
    if (__DEV__) {
      console.warn(`[Analytics] Failed to track screen view "${screenName}":`, error);
    }
  }
}

/**
 * Sets the current user ID (or clears it with null on logout/reset).
 */
export async function setUserId(userId: string | null): Promise<void> {
  try {
    if (__DEV__) {
      console.log(`[Analytics] Set User ID: ${userId}`);
    }
    const analytics = getSafeAnalytics();
    if (analytics) {
      await fbSetUserId(analytics, userId);
    }
  } catch (error) {
    if (__DEV__) {
      console.warn('[Analytics] Failed to set user ID:', error);
    }
  }
}

/**
 * Sets an individual user property.
 */
export async function setUserProperty(propertyName: string, value: string | null): Promise<void> {
  try {
    if (__DEV__) {
      console.log(`[Analytics] Set User Property: ${propertyName} = ${value}`);
    }
    const analytics = getSafeAnalytics();
    if (analytics) {
      await fbSetUserProperty(analytics, propertyName, value);
    }
  } catch (error) {
    if (__DEV__) {
      console.warn(`[Analytics] Failed to set user property "${propertyName}":`, error);
    }
  }
}

/**
 * Sets multiple user properties simultaneously.
 */
export async function setUserProperties(properties: AnalyticsUserProperties): Promise<void> {
  try {
    if (__DEV__) {
      console.log('[Analytics] Set User Properties:', properties);
    }
    const analytics = getSafeAnalytics();
    if (analytics) {
      const cleanProperties: Record<string, string | null> = {};
      for (const [key, value] of Object.entries(properties)) {
        if (value !== undefined) {
          cleanProperties[key] = value;
        }
      }
      await fbSetUserProperties(analytics, cleanProperties);
    }
  } catch (error) {
    if (__DEV__) {
      console.warn('[Analytics] Failed to set user properties:', error);
    }
  }
}

/**
 * Toggles analytics data collection (e.g. for user privacy settings / GDPR).
 */
export async function setAnalyticsCollectionEnabled(enabled: boolean): Promise<void> {
  try {
    if (__DEV__) {
      console.log(`[Analytics] Set Analytics Collection Enabled: ${enabled}`);
    }
    const analytics = getSafeAnalytics();
    if (analytics) {
      await fbSetAnalyticsCollectionEnabled(analytics, enabled);
    }
  } catch (error) {
    if (__DEV__) {
      console.warn('[Analytics] Failed to set collection enabled:', error);
    }
  }
}

/**
 * Resets all analytics data for this instance on the device.
 */
export async function resetAnalyticsData(): Promise<void> {
  try {
    if (__DEV__) {
      console.log('[Analytics] Reset Analytics Data');
    }
    const analytics = getSafeAnalytics();
    if (analytics) {
      await fbResetAnalyticsData(analytics);
    }
  } catch (error) {
    if (__DEV__) {
      console.warn('[Analytics] Failed to reset analytics data:', error);
    }
  }
}
