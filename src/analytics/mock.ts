/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Mock module for @react-native-firebase/analytics.
 * Used when ENABLE_ANALYTICS is false or in Expo Go / Jest
 * to avoid native module missing crashes.
 */

export interface MockAnalyticsInstance {
  app: { name: string };
}

const mockInstance: MockAnalyticsInstance = {
  app: { name: '[DEFAULT]' },
};

export function getAnalytics(): MockAnalyticsInstance {
  return mockInstance;
}

export async function logEvent(
  _analytics: MockAnalyticsInstance,
  name: string,
  params?: Record<string, any>,
): Promise<void> {
  if (__DEV__) {
    console.log(`[Analytics Mock] Event: "${name}"`, params ?? '');
  }
}

export async function logScreenView(
  _analytics: MockAnalyticsInstance,
  params: { screen_name?: string; screen_class?: string },
): Promise<void> {
  if (__DEV__) {
    console.log(`[Analytics Mock] Screen: "${params.screen_name ?? 'unknown'}"`);
  }
}

export async function setUserId(
  _analytics: MockAnalyticsInstance,
  id: string | null,
): Promise<void> {
  if (__DEV__) {
    console.log(`[Analytics Mock] Set UserId: "${id}"`);
  }
}

export async function setUserProperty(
  _analytics: MockAnalyticsInstance,
  name: string,
  value: string | null,
): Promise<void> {
  if (__DEV__) {
    console.log(`[Analytics Mock] Set UserProperty: "${name}" = "${value}"`);
  }
}

export async function setUserProperties(
  _analytics: MockAnalyticsInstance,
  properties: Record<string, string | null>,
): Promise<void> {
  if (__DEV__) {
    console.log('[Analytics Mock] Set UserProperties:', properties);
  }
}

export async function setAnalyticsCollectionEnabled(
  _analytics: MockAnalyticsInstance,
  enabled: boolean,
): Promise<void> {
  if (__DEV__) {
    console.log(`[Analytics Mock] Collection Enabled: ${enabled}`);
  }
}

export async function resetAnalyticsData(_analytics: MockAnalyticsInstance): Promise<void> {
  if (__DEV__) {
    console.log('[Analytics Mock] Reset Analytics Data');
  }
}
