import { createStorage } from './storageService';
import { scheduleStreakReminder, cancelStreakReminder } from './notificationService';

const storage = createStorage('app-streak-data');

const STREAK_COUNT_KEY = 'streak-count';
const BEST_STREAK_KEY = 'best-streak';
const LAST_ACTIVE_DATE_KEY = 'last-active-date';
const STREAK_ACTIVE_DATES_KEY = 'streak-active-dates';
const STREAK_FROZEN_DATE_KEY = 'streak-frozen-date';
const STREAK_FROZEN_DATES_KEY = 'streak-frozen-dates';

export interface StreakState {
  currentStreak: number;
  bestStreak: number;
  lastActiveDate: string | null;
  isActiveToday: boolean;
  isFrozenToday: boolean;
  frozenDate: string | null;
  totalActiveDays: number;
  activeDates: string[];
  frozenDates: string[];
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

function getStoredActiveDates(): string[] {
  const rawDatesString = storage.getString(STREAK_ACTIVE_DATES_KEY);
  if (rawDatesString) {
    try {
      const parsedDates = JSON.parse(rawDatesString);
      if (Array.isArray(parsedDates)) {
        return parsedDates;
      }
    } catch {
      return [];
    }
  }
  return [];
}

function getStoredFrozenDates(): string[] {
  const rawDatesString = storage.getString(STREAK_FROZEN_DATES_KEY);
  if (rawDatesString) {
    try {
      const parsedDates = JSON.parse(rawDatesString);
      if (Array.isArray(parsedDates)) {
        return parsedDates;
      }
    } catch {
      return [];
    }
  }
  return [];
}

function backfillActiveDatesIfNeeded(
  currentStreak: number,
  bestStreak: number,
  lastActiveDate: string | null,
): string[] {
  const storedDates = getStoredActiveDates();
  const targetCount = Math.max(currentStreak, bestStreak);
  if (storedDates.length < targetCount && targetCount > 0) {
    const anchorDate = lastActiveDate ? new Date(lastActiveDate) : new Date();
    const backfilledSet = new Set(storedDates);
    for (let index = 0; index < targetCount; index += 1) {
      const calculatedDate = new Date(anchorDate);
      calculatedDate.setDate(anchorDate.getDate() - index);
      backfilledSet.add(getLocalDateString(calculatedDate));
    }
    const backfilledDates = Array.from(backfilledSet).sort();
    storage.set(STREAK_ACTIVE_DATES_KEY, JSON.stringify(backfilledDates));
    return backfilledDates;
  }
  return storedDates;
}

/**
 * Retrieve current streak state and evaluate if a day was missed or protected.
 */
export function getStreakState(): StreakState {
  const rawCurrentStreak = storage.getString(STREAK_COUNT_KEY);
  const rawBestStreak = storage.getString(BEST_STREAK_KEY);
  const lastActiveDate = storage.getString(LAST_ACTIVE_DATE_KEY) ?? null;
  const frozenDate = storage.getString(STREAK_FROZEN_DATE_KEY) ?? null;

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
  } else if (lastActiveDate === yesterdayDateString || frozenDate === yesterdayDateString) {
    // Active yesterday OR protected by streak freeze yesterday
    isActiveToday = false;
  } else if (lastActiveDate) {
    // User missed one or more full days without a freeze, reset active streak count
    currentStreak = 0;
    isActiveToday = false;
  }

  const isFrozenToday = frozenDate === todayDateString && !isActiveToday;
  const activeDates = backfillActiveDatesIfNeeded(currentStreak, bestStreak, lastActiveDate);
  const frozenDates = getStoredFrozenDates();
  const totalActiveDays = Math.max(currentStreak, bestStreak, activeDates.length);

  return {
    currentStreak,
    bestStreak,
    lastActiveDate,
    isActiveToday,
    isFrozenToday,
    frozenDate,
    totalActiveDays,
    activeDates,
    frozenDates,
  };
}

/**
 * Activate streak freeze for today.
 */
export function freezeStreakToday(): boolean {
  const todayDateString = getLocalDateString();
  storage.set(STREAK_FROZEN_DATE_KEY, todayDateString);

  const frozenDates = getStoredFrozenDates();
  if (!frozenDates.includes(todayDateString)) {
    frozenDates.push(todayDateString);
    frozenDates.sort();
    storage.set(STREAK_FROZEN_DATES_KEY, JSON.stringify(frozenDates));
  }

  const newState = getStreakState();
  streakListeners.forEach(listenerCallback => {
    listenerCallback(newState);
  });

  // Reschedule evening streak reminder so user is not alerted today
  scheduleStreakReminder().catch(() => {});

  return true;
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
  const frozenDate = storage.getString(STREAK_FROZEN_DATE_KEY) ?? null;

  // Add today to active dates list
  const activeDates = getStoredActiveDates();
  if (!activeDates.includes(todayDateString)) {
    activeDates.push(todayDateString);
    activeDates.sort();
    storage.set(STREAK_ACTIVE_DATES_KEY, JSON.stringify(activeDates));
  }

  if (lastActiveDate === todayDateString) {
    // Already logged today
    return {
      newState: getStreakState(),
      isNewDay: false,
      previousStreak,
    };
  }

  const yesterdayDateString = getYesterdayDateString();
  if (lastActiveDate === yesterdayDateString || frozenDate === yesterdayDateString) {
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

  // Reschedule streak saver reminder for tomorrow since user practiced today
  scheduleStreakReminder().catch(() => {});

  const newState = getStreakState();

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
  storage.delete(STREAK_ACTIVE_DATES_KEY);
  storage.delete(STREAK_FROZEN_DATE_KEY);
  storage.delete(STREAK_FROZEN_DATES_KEY);
  cancelStreakReminder().catch(() => {});
  const newState = getStreakState();
  streakListeners.forEach(listenerCallback => {
    listenerCallback(newState, false);
  });
}

/**
 * Restore streak state from cloud backup
 */
export function setStreakState(state: {
  currentStreak: number;
  bestStreak: number;
  lastActiveDate: string | null;
  activeDates?: string[];
  frozenDates?: string[];
  frozenDate?: string | null;
}): void {
  storage.set(STREAK_COUNT_KEY, String(Math.max(0, state.currentStreak || 0)));
  storage.set(BEST_STREAK_KEY, String(Math.max(0, state.bestStreak || 0)));
  if (state.lastActiveDate) {
    storage.set(LAST_ACTIVE_DATE_KEY, state.lastActiveDate);
  } else {
    storage.delete(LAST_ACTIVE_DATE_KEY);
  }

  if (state.frozenDate) {
    storage.set(STREAK_FROZEN_DATE_KEY, state.frozenDate);
  }

  if (Array.isArray(state.activeDates) && state.activeDates.length > 0) {
    storage.set(STREAK_ACTIVE_DATES_KEY, JSON.stringify(state.activeDates));
  }

  if (Array.isArray(state.frozenDates) && state.frozenDates.length > 0) {
    storage.set(STREAK_FROZEN_DATES_KEY, JSON.stringify(state.frozenDates));
  }

  const newState = getStreakState();
  streakListeners.forEach(listenerCallback => {
    listenerCallback(newState, false);
  });
}
