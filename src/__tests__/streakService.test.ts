import {
  getStreakState,
  recordStreakActivity,
  resetStreakData,
  addStreakListener,
  getLocalDateString,
  getYesterdayDateString,
  StreakState,
} from '../services/streakService';

describe('streakService', () => {
  beforeEach(() => {
    resetStreakData();
  });

  describe('getLocalDateString & getYesterdayDateString', () => {
    it('formats a date to YYYY-MM-DD correctly', () => {
      const sampleDate = new Date(2026, 8, 1); // September 1, 2026
      expect(getLocalDateString(sampleDate)).toBe('2026-09-01');
    });

    it('returns yesterday correctly', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(getYesterdayDateString()).toBe(getLocalDateString(yesterday));
    });
  });

  describe('getStreakState', () => {
    it('returns zero state when no streak is recorded', () => {
      const state = getStreakState();
      expect(state.currentStreak).toBe(0);
      expect(state.bestStreak).toBe(0);
      expect(state.lastActiveDate).toBeNull();
      expect(state.isActiveToday).toBe(false);
    });
  });

  describe('recordStreakActivity', () => {
    it('starts a new streak on first activity', () => {
      const result = recordStreakActivity();
      expect(result.isNewDay).toBe(true);
      expect(result.previousStreak).toBe(0);
      expect(result.newState.currentStreak).toBe(1);
      expect(result.newState.bestStreak).toBe(1);
      expect(result.newState.isActiveToday).toBe(true);
      expect(result.newState.lastActiveDate).toBe(getLocalDateString());
    });

    it('is idempotent when called multiple times on the same day', () => {
      const firstResult = recordStreakActivity();
      expect(firstResult.isNewDay).toBe(true);
      expect(firstResult.newState.currentStreak).toBe(1);

      const secondResult = recordStreakActivity();
      expect(secondResult.isNewDay).toBe(false);
      expect(secondResult.newState.currentStreak).toBe(1);
      expect(secondResult.newState.bestStreak).toBe(1);
      expect(secondResult.newState.isActiveToday).toBe(true);
    });

    it('notifies listeners on activity', () => {
      const listener = jest.fn();
      const unsubscribe = addStreakListener(listener);

      recordStreakActivity();
      expect(listener).toHaveBeenCalledTimes(1);
      const [calledState, isNewDay] = listener.mock.calls[0];
      expect((calledState as StreakState).currentStreak).toBe(1);
      expect(isNewDay).toBe(true);

      unsubscribe();
      recordStreakActivity();
      expect(listener).toHaveBeenCalledTimes(1);
    });
  });

  describe('resetStreakData', () => {
    it('resets all streak data and notifies listeners', () => {
      recordStreakActivity();
      expect(getStreakState().currentStreak).toBe(1);

      const listener = jest.fn();
      const unsubscribe = addStreakListener(listener);

      resetStreakData();
      expect(getStreakState().currentStreak).toBe(0);
      expect(getStreakState().bestStreak).toBe(0);
      expect(getStreakState().lastActiveDate).toBeNull();
      expect(getStreakState().isActiveToday).toBe(false);
      expect(listener).toHaveBeenCalledTimes(1);

      unsubscribe();
    });
  });
});
