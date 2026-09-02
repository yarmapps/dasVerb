import { createStorage } from './storageService';

const storage = createStorage('premium-access');
const PREMIUM_KEY = 'is_premium_user';

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
}
