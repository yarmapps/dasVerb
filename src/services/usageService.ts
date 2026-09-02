import { getFreeDailyQuizzesLimit, getMaxAdGrantsPerDayLimit } from './appConfigService';
import { createStorage } from './storageService';
import { isPremiumEnabled } from './premiumAccessService';

const storage = createStorage('app-usage');

export const DEFAULT_FREE_DAILY_QUIZZES = 2;
export const DEFAULT_MAX_AD_GRANTS_PER_DAY = 5;

function getLocalYYYYMMDD(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getQuizDailyKey(): string {
  return `quiz_count_${getLocalYYYYMMDD()}`;
}

function getExtraQuizKey(): string {
  return `extra_quiz_count_${getLocalYYYYMMDD()}`;
}

function getAdGrantsKey(): string {
  return `ad_grants_${getLocalYYYYMMDD()}`;
}

export function getFreeDailyQuizzes(): number {
  return getFreeDailyQuizzesLimit();
}

export function getMaxAdGrantsPerDay(): number {
  return getMaxAdGrantsPerDayLimit();
}

export function getDailyCompletedQuizzesCount(): number {
  try {
    const raw = storage.getString(getQuizDailyKey());
    return raw ? Number(raw) : 0;
  } catch {
    return 0;
  }
}

export function getExtraQuizzesCount(): number {
  try {
    const raw = storage.getString(getExtraQuizKey());
    return raw ? Number(raw) : 0;
  } catch {
    return 0;
  }
}

export function getAdGrantsToday(): number {
  try {
    const raw = storage.getString(getAdGrantsKey());
    return raw ? Number(raw) : 0;
  } catch {
    return 0;
  }
}

export function canWatchAdToday(): boolean {
  return getAdGrantsToday() < getMaxAdGrantsPerDay();
}

export function grantExtraQuiz(): void {
  try {
    const extra = getExtraQuizzesCount();
    const grants = getAdGrantsToday();
    storage.set(getExtraQuizKey(), String(extra + 1));
    storage.set(getAdGrantsKey(), String(grants + 1));
  } catch {
    // ignore
  }
}

export function isWithinFreeDailyLimit(): boolean {
  return getDailyCompletedQuizzesCount() < getFreeDailyQuizzes();
}

export function canStartQuiz(): boolean {
  if (isPremiumEnabled()) {
    return true;
  }
  return isWithinFreeDailyLimit() || getExtraQuizzesCount() > 0;
}

export function incrementDailyCompletedQuizzes(): void {
  try {
    const currentCompleted = getDailyCompletedQuizzesCount();
    const extra = getExtraQuizzesCount();
    const limit = getFreeDailyQuizzes();

    if (currentCompleted < limit) {
      storage.set(getQuizDailyKey(), String(currentCompleted + 1));
    } else if (extra > 0) {
      storage.set(getExtraQuizKey(), String(extra - 1));
    }
  } catch {
    // ignore
  }
}

export function resetDailyQuizLimits(): void {
  try {
    storage.delete(getQuizDailyKey());
    storage.delete(getExtraQuizKey());
    storage.delete(getAdGrantsKey());
  } catch {
    // ignore
  }
}
