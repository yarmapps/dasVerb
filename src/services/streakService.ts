import { createStorage } from './storageService';

const storage = createStorage('app-streak-data');

const STREAK_COUNT_KEY = 'streak-count';
const BEST_STREAK_KEY = 'best-streak';
const LAST_ACTIVE_DATE_KEY = 'last-active-date';

export interface StreakState {
  currentStreak: number;
  bestStreak: number;
  lastActiveDate: string | null;
  isActiveToday: boolean;
}

export interface StreakRecordResult {
  newState: StreakState;
  isNewDay: boolean;
  previousStreak: number;
}

export type StreakListenerCallback = (state: StreakState, isNewDay?: boolean) => void;

const streakListeners: Set<StreakListenerCallback> = new Set();

/**
 * Subscribe to streak state changes. Returns an unsubscribe function.
 */
export function addStreakListener(listenerCallback: StreakListenerCallback): () => void {
  streakListeners.add(listenerCallback);
  return () => {
    streakListeners.delete(listenerCallback);
  };
}

/**
 * Format Date to YYYY-MM-DD in local time
 */
export function getLocalDateString(targetDate: Date = new Date()): string {
  const fullYear = targetDate.getFullYear();
  const monthNumber = String(targetDate.getMonth() + 1).padStart(2, '0');
  const dayNumber = String(targetDate.getDate()).padStart(2, '0');
  return `${fullYear}-${monthNumber}-${dayNumber}`;
}

/**
 * Get date string for yesterday in local time
 */
export function getYesterdayDateString(): string {
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  return getLocalDateString(yesterdayDate);
}

/**
 * Retrieve current streak state and evaluate if a day was missed.
 */
export function getStreakState(): StreakState {
  const rawCurrentStreak = storage.getString(STREAK_COUNT_KEY);
  const rawBestStreak = storage.getString(BEST_STREAK_KEY);
  const lastActiveDate = storage.getString(LAST_ACTIVE_DATE_KEY) ?? null;

  let currentStreak = rawCurrentStreak ? parseInt(rawCurrentStreak, 10) : 0;
  if (Number.isNaN(currentStreak)) {
    currentStreak = 0;
  }

  let bestStreak = rawBestStreak ? parseInt(rawBestStreak, 10) : 0;
  if (Number.isNaN(bestStreak)) {
    bestStreak = 0;
  }

  const todayDateString = getLocalDateString();
  const yesterdayDateString = getYesterdayDateString();

  let isActiveToday = false;

  if (lastActiveDate === todayDateString) {
    isActiveToday = true;
  } else if (lastActiveDate === yesterdayDateString) {
    isActiveToday = false;
  } else if (lastActiveDate) {
    // User missed one or more full days, reset active streak count
    currentStreak = 0;
    isActiveToday = false;
  }

  return {
    currentStreak,
    bestStreak,
    lastActiveDate,
    isActiveToday,
  };
}

/**
 * Log daily activity and update streak accordingly.
 */
export function recordStreakActivity(): StreakRecordResult {
  const todayDateString = getLocalDateString();
  const rawPreviousStreak = storage.getString(STREAK_COUNT_KEY);
  const rawBestStreak = storage.getString(BEST_STREAK_KEY);

  const previousStreak = rawPreviousStreak ? parseInt(rawPreviousStreak, 10) || 0 : 0;
  let currentStreak = previousStreak;
  let bestStreak = rawBestStreak ? parseInt(rawBestStreak, 10) || 0 : 0;
  const lastActiveDate = storage.getString(LAST_ACTIVE_DATE_KEY) ?? null;

  if (lastActiveDate === todayDateString) {
    // Already logged today
    return {
      newState: getStreakState(),
      isNewDay: false,
      previousStreak,
    };
  }

  const yesterdayDateString = getYesterdayDateString();
  if (lastActiveDate === yesterdayDateString) {
    currentStreak += 1;
  } else {
    // First time or streak broken
    currentStreak = 1;
  }

  if (currentStreak > bestStreak) {
    bestStreak = currentStreak;
    storage.set(BEST_STREAK_KEY, String(bestStreak));
  }

  storage.set(STREAK_COUNT_KEY, String(currentStreak));
  storage.set(LAST_ACTIVE_DATE_KEY, todayDateString);

  const newState: StreakState = {
    currentStreak,
    bestStreak,
    lastActiveDate: todayDateString,
    isActiveToday: true,
  };

  streakListeners.forEach(listenerCallback => {
    listenerCallback(newState, true);
  });

  return {
    newState,
    isNewDay: true,
    previousStreak,
  };
}

/**
 * Reset streak data (useful for debug/testing)
 */
export function resetStreakData(): void {
  storage.delete(STREAK_COUNT_KEY);
  storage.delete(BEST_STREAK_KEY);
  storage.delete(LAST_ACTIVE_DATE_KEY);
  const newState = getStreakState();
  streakListeners.forEach(listenerCallback => {
    listenerCallback(newState, false);
  });
}
