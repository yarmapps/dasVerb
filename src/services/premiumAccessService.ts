import { createStorage } from './storageService';
import { setUserProperties } from './analyticsService';

const storage = createStorage('premium-access');
const PREMIUM_KEY = 'is_premium_user';

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

export function isPremiumEnabled(): boolean {
  try {
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
