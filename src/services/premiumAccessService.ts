import { createStorage } from './storageService';
import { setUserProperties } from './analyticsService';

const storage = createStorage('premium-access');
const PREMIUM_KEY = 'is_premium_user';
const DEBUG_OVERRIDE_KEY = 'debug_premium_override';

type PremiumListener = (enabled: boolean) => void;
const listeners: Set<PremiumListener> = new Set();

/**
 * Subscribe to premium status changes. Returns an unsubscribe function.
 */
export function addPremiumListener(fn: PremiumListener): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function getDebugPremiumOverride(): boolean | null {
  try {
    const raw = storage.getString(DEBUG_OVERRIDE_KEY);
    if (raw === 'true') return true;
    if (raw === 'false') return false;
    return null;
  } catch {
    return null;
  }
}

export function setDebugPremiumOverride(enabled: boolean | null): void {
  try {
    if (enabled === null) {
      storage.delete(DEBUG_OVERRIDE_KEY);
    } else {
      storage.set(DEBUG_OVERRIDE_KEY, String(enabled));
    }
  } catch {
    // ignore
  }

  const effective = isPremiumEnabled();
  listeners.forEach(fn => {
    try {
      fn(effective);
    } catch {
      // ignore
    }
  });
}

export function isPremiumEnabled(): boolean {
  try {
    const override = getDebugPremiumOverride();
    if (override !== null) {
      return override;
    }
    return storage.getString(PREMIUM_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setPremiumEnabled(enabled: boolean): void {
  try {
    storage.set(PREMIUM_KEY, String(enabled));
  } catch {
    // ignore
  }

  listeners.forEach(fn => {
    try {
      fn(enabled);
    } catch (error) {
      if (__DEV__) {
        console.warn('[premiumAccessService] Listener callback error:', error);
      }
    }
  });

  // Sync with Firebase Analytics
  setUserProperties({
    is_premium: enabled ? 'true' : 'false',
  }).catch(() => {});
}
