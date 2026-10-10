import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { IntlProvider } from 'react-intl';
import { DailyStreakScreen } from '../screens/DailyStreak/DailyStreakScreen';
import { ThemeProvider } from '../context/ThemeContext';
import { getMessages } from '../services/intlService';
import {
  getStreakState,
  recordStreakActivity,
  freezeStreakToday,
  resetStreakData,
  setStreakState,
  getLocalDateString,
  getYesterdayDateString,
} from '../services/streakService';
import * as premiumAccessService from '../services/premiumAccessService';
import { adManager } from '../ads/adManager';

const mockGoBack = jest.fn();
const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    goBack: mockGoBack,
    navigate: mockNavigate,
  }),
}));

const messages = getMessages('ru');

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider>
    <IntlProvider locale="ru" messages={messages}>
      {children}
    </IntlProvider>
  </ThemeProvider>
);

describe('Daily Streak Feature Suite', () => {
  beforeEach(() => {
    resetStreakData();
    jest.clearAllMocks();
    jest.spyOn(premiumAccessService, 'isPremiumEnabled').mockReturnValue(false);
  });

  describe('streakService core logic', () => {
    it('initializes with default zero state', () => {
      const state = getStreakState();
      expect(state.currentStreak).toBe(0);
      expect(state.bestStreak).toBe(0);
      expect(state.isActiveToday).toBe(false);
      expect(state.isFrozenToday).toBe(false);
      expect(state.totalActiveDays).toBe(0);
      expect(state.activeDates).toEqual([]);
      expect(state.frozenDates).toEqual([]);
    });

    it('records activity and increments streak correctly', () => {
      const result = recordStreakActivity();
      expect(result.newState.currentStreak).toBe(1);
      expect(result.newState.bestStreak).toBe(1);
      expect(result.newState.isActiveToday).toBe(true);
      expect(result.isNewDay).toBe(true);

      // Re-recording today should be idempotent
      const duplicateResult = recordStreakActivity();
      expect(duplicateResult.isNewDay).toBe(false);
      expect(duplicateResult.newState.currentStreak).toBe(1);
    });

    it('preserves continuity across frozen days (middle-of-streak freeze)', () => {
      const today = getLocalDateString();
      const yesterday = getYesterdayDateString();

      // Simulate day before yesterday active, yesterday frozen
      const dayBeforeYesterdayDate = new Date();
      dayBeforeYesterdayDate.setDate(dayBeforeYesterdayDate.getDate() - 2);
      const dayBeforeYesterday = getLocalDateString(dayBeforeYesterdayDate);

      setStreakState({
        currentStreak: 1,
        bestStreak: 1,
        lastActiveDate: dayBeforeYesterday,
        frozenDate: yesterday,
        activeDates: [dayBeforeYesterday],
        frozenDates: [yesterday],
      });

      const stateBefore = getStreakState();
      // Since yesterday was frozen, streak is alive today
      expect(stateBefore.currentStreak).toBe(1);
      expect(stateBefore.isActiveToday).toBe(false);

      // Recording activity today bridges across the frozen day
      const result = recordStreakActivity();
      expect(result.newState.currentStreak).toBe(2);
      expect(result.newState.isActiveToday).toBe(true);
      expect(result.newState.activeDates).toContain(today);
    });

    it('freezes streak today successfully', () => {
      const yesterday = getYesterdayDateString();
      setStreakState({
        currentStreak: 5,
        bestStreak: 5,
        lastActiveDate: yesterday,
      });

      expect(getStreakState().isFrozenToday).toBe(false);

      const success = freezeStreakToday();
      expect(success).toBe(true);

      const state = getStreakState();
      expect(state.isFrozenToday).toBe(true);
      expect(state.frozenDates).toContain(getLocalDateString());
    });

    it('resets streak to 0 after missed day without freeze', () => {
      const twoDaysAgoDate = new Date();
      twoDaysAgoDate.setDate(twoDaysAgoDate.getDate() - 2);
      const twoDaysAgo = getLocalDateString(twoDaysAgoDate);

      setStreakState({
        currentStreak: 7,
        bestStreak: 10,
        lastActiveDate: twoDaysAgo,
      });

      const state = getStreakState();
      expect(state.currentStreak).toBe(0);
      expect(state.bestStreak).toBe(10);
      expect(state.isActiveToday).toBe(false);
    });
  });

  describe('DailyStreakScreen component', () => {
    it('renders the screen header and navigates back on press', () => {
      const { getByTestId, getByText } = render(
        <TestWrapper>
          <DailyStreakScreen />
        </TestWrapper>,
      );

      expect(getByText('Серия дней')).toBeTruthy();
      const backButton = getByTestId('header-back-button');
      expect(backButton).toBeTruthy();

      fireEvent.press(backButton);
      expect(mockGoBack).toHaveBeenCalledTimes(1);
    });

    it('renders top metrics row with values', () => {
      setStreakState({
        currentStreak: 4,
        bestStreak: 87,
        lastActiveDate: getYesterdayDateString(),
        activeDates: ['2026-03-01', '2026-03-02', '2026-03-03', '2026-03-04'],
      });

      const { getByText } = render(
        <TestWrapper>
          <DailyStreakScreen />
        </TestWrapper>,
      );

      expect(getByText('4')).toBeTruthy();
      expect(getByText('87')).toBeTruthy();
      expect(getByText('Текущая серия')).toBeTruthy();
      expect(getByText('Личный рекорд')).toBeTruthy();
      expect(getByText('Всего дней')).toBeTruthy();
    });

    it('shows "No streak to freeze" when current streak is 0', () => {
      const { getByText } = render(
        <TestWrapper>
          <DailyStreakScreen />
        </TestWrapper>,
      );

      expect(getByText('Нет серии для заморозки')).toBeTruthy();
    });

    it('shows "Streak is safe for today" when user practiced today', () => {
      recordStreakActivity();

      const { getByText } = render(
        <TestWrapper>
          <DailyStreakScreen />
        </TestWrapper>,
      );

      expect(getByText('Серия в безопасности на сегодня')).toBeTruthy();
    });

    it('shows "Streak is frozen for today" when user froze today', () => {
      setStreakState({
        currentStreak: 3,
        bestStreak: 3,
        lastActiveDate: getYesterdayDateString(),
      });
      freezeStreakToday();

      const { getByText } = render(
        <TestWrapper>
          <DailyStreakScreen />
        </TestWrapper>,
      );

      expect(getByText('Серия заморожена на сегодня')).toBeTruthy();
    });

    it('free user watches rewarded ad to freeze streak', async () => {
      setStreakState({
        currentStreak: 3,
        bestStreak: 3,
        lastActiveDate: getYesterdayDateString(),
      });

      jest.spyOn(adManager, 'showRewardedOrFallback').mockResolvedValue(true);

      const { getByText } = render(
        <TestWrapper>
          <DailyStreakScreen />
        </TestWrapper>,
      );

      const freezeButton = getByText('Заморозить на 1 день');
      expect(freezeButton).toBeTruthy();

      await act(async () => {
        fireEvent.press(freezeButton);
      });

      expect(adManager.showRewardedOrFallback).toHaveBeenCalledTimes(1);
      expect(getStreakState().isFrozenToday).toBe(true);
    });

    it('premium user instantly freezes streak without ads', async () => {
      jest.spyOn(premiumAccessService, 'isPremiumEnabled').mockReturnValue(true);
      const adSpy = jest.spyOn(adManager, 'showRewardedOrFallback');

      setStreakState({
        currentStreak: 5,
        bestStreak: 5,
        lastActiveDate: getYesterdayDateString(),
      });

      const { getByText } = render(
        <TestWrapper>
          <DailyStreakScreen />
        </TestWrapper>,
      );

      const freezeButton = getByText('Мгновенная заморозка');
      expect(freezeButton).toBeTruthy();

      await act(async () => {
        fireEvent.press(freezeButton);
      });

      expect(adSpy).not.toHaveBeenCalled();
      expect(getStreakState().isFrozenToday).toBe(true);
    });

    it('renders calendar and milestones sections', () => {
      setStreakState({
        currentStreak: 7,
        bestStreak: 14,
        lastActiveDate: getYesterdayDateString(),
      });

      const { getByText } = render(
        <TestWrapper>
          <DailyStreakScreen />
        </TestWrapper>,
      );

      // Milestones
      expect(getByText('Достижения и значки')).toBeTruthy();
      expect(getByText('Искра')).toBeTruthy();
      expect(getByText('Пламя')).toBeTruthy();
      expect(getByText('Факел')).toBeTruthy();
      expect(getByText('Инферно')).toBeTruthy();
      expect(getByText('Сияние')).toBeTruthy();
      expect(getByText('Легенда')).toBeTruthy();
      expect(getByText('Мастер')).toBeTruthy();
    });
  });
});
