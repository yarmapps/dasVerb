import { useCallback, useSyncExternalStore } from 'react';
import { createStorage } from './storageService';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const defaultFeatures = require('../config/features');

export type FeatureFlagName = 'ENABLE_PREMIUM' | 'ENABLE_ADS' | 'ENABLE_ANALYTICS';

export const ALL_FEATURE_FLAGS: FeatureFlagName[] = [
  'ENABLE_PREMIUM',
  'ENABLE_ADS',
  'ENABLE_ANALYTICS',
];

const storage = createStorage('features-config');
const listeners = new Set<() => void>();

function notifyListeners(): void {
  listeners.forEach(fn => {
    try {
      fn();
    } catch (error) {
      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.warn('[featuresService] Listener error:', error);
      }
    }
  });
}

export function addFeaturesListener(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function getFeatureOverride(name: FeatureFlagName): boolean | null {
  try {
    const raw = storage.getString(`override_${name}`);
    if (raw === 'true') return true;
    if (raw === 'false') return false;
    return null;
  } catch {
    return null;
  }
}

export function getDefaultFeatureValue(name: FeatureFlagName): boolean {
  return defaultFeatures[name] === true;
}

export function setFeatureOverride(name: FeatureFlagName, value: boolean | null): void {
  try {
    if (value === null) {
      storage.delete(`override_${name}`);
    } else {
      storage.set(`override_${name}`, String(value));
    }
  } catch {
    // Ignore storage errors
  }
  notifyListeners();
}

export function isFeatureEnabled(name: FeatureFlagName): boolean {
  const override = getFeatureOverride(name);
  if (override !== null) {
    return override;
  }
  return getDefaultFeatureValue(name);
}

export function resetAllFeatureOverrides(): void {
  ALL_FEATURE_FLAGS.forEach(flag => {
    setFeatureOverride(flag, null);
  });
}

export function useFeatureFlag(name: FeatureFlagName): boolean {
  const subscribe = useCallback(
    (onStoreChange: () => void) => addFeaturesListener(onStoreChange),
    [],
  );
  const getSnapshot = useCallback(() => isFeatureEnabled(name), [name]);
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
