import {
  canStartQuiz,
  getDailyCompletedQuizzesCount,
  incrementDailyCompletedQuizzes,
  getExtraQuizzesCount,
  grantExtraQuiz,
  canWatchAdToday,
  isWithinFreeDailyLimit,
  resetDailyQuizLimits,
  getFreeDailyQuizzes,
  getMaxAdGrantsPerDay,
} from '../services/usageService';
import { setPremiumEnabled } from '../services/premiumAccessService';

describe('usageService', () => {
  beforeEach(() => {
    resetDailyQuizLimits();
    setPremiumEnabled(false);
  });

  it('should start with 0 completed quizzes and allow starting quiz within free limit', () => {
    expect(getDailyCompletedQuizzesCount()).toBe(0);
    expect(getFreeDailyQuizzes()).toBeGreaterThan(0);
    expect(isWithinFreeDailyLimit()).toBe(true);
    expect(canStartQuiz()).toBe(true);
  });

  it('should track completed quizzes up to the limit', () => {
    const limit = getFreeDailyQuizzes();
    for (let i = 0; i < limit - 1; i++) {
      incrementDailyCompletedQuizzes();
      expect(canStartQuiz()).toBe(true);
    }

    incrementDailyCompletedQuizzes();
    expect(getDailyCompletedQuizzesCount()).toBe(limit);
    expect(isWithinFreeDailyLimit()).toBe(false);
    expect(canStartQuiz()).toBe(false);
  });

  it('should grant and consume extra quizzes via rewarded ads', () => {
    const limit = getFreeDailyQuizzes();
    for (let i = 0; i < limit; i++) {
      incrementDailyCompletedQuizzes();
    }
    expect(canStartQuiz()).toBe(false);

    // Grant 1 extra quiz via ad
    expect(canWatchAdToday()).toBe(true);
    grantExtraQuiz();
    expect(getExtraQuizzesCount()).toBe(1);
    expect(canStartQuiz()).toBe(true);

    // Complete quiz with extra ticket -> consumes extra ticket
    incrementDailyCompletedQuizzes();
    expect(getExtraQuizzesCount()).toBe(0);
    expect(canStartQuiz()).toBe(false);
  });

  it('should always allow quiz if premium is enabled', () => {
    const limit = getFreeDailyQuizzes();
    for (let i = 0; i < limit; i++) {
      incrementDailyCompletedQuizzes();
    }
    expect(canStartQuiz()).toBe(false);

    setPremiumEnabled(true);
    expect(canStartQuiz()).toBe(true);
  });

  it('should respect max ad grants per day limit', () => {
    const maxGrants = getMaxAdGrantsPerDay();
    for (let i = 0; i < maxGrants; i++) {
      expect(canWatchAdToday()).toBe(true);
      grantExtraQuiz();
    }
    expect(canWatchAdToday()).toBe(false);
  });
});
