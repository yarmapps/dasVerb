import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { LocaleProvider } from '../context/LocaleContext';
import { ThemeProvider } from '../context/ThemeContext';
import { DebugScreen } from '../screens/DebugScreen/DebugScreen';
import { PracticeScreen } from '../screens/PracticeScreen/PracticeScreen';
import * as usageService from '../services/usageService';
import * as streakService from '../services/streakService';
import * as settingsService from '../services/settingsService';
import * as appUpdateHook from '../hooks/useAppUpdate';

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: mockGoBack,
  }),
}));

describe('DebugScreen & Debug Triggers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  const renderDebugScreen = () =>
    render(
      <LocaleProvider>
        <ThemeProvider>
          <DebugScreen />
        </ThemeProvider>
      </LocaleProvider>,
    );

  it('should navigate to Debug screen when long pressing settings button on PracticeScreen', () => {
    const { getByTestId } = render(
      <LocaleProvider>
        <ThemeProvider>
          <PracticeScreen />
        </ThemeProvider>
      </LocaleProvider>,
    );

    const settingsButton = getByTestId('settings-button');
    fireEvent(settingsButton, 'longPress');

    expect(mockNavigate).toHaveBeenCalledWith('Debug');
  });

  it('should reset daily quiz limits and trigger alert on reset button press', () => {
    const spyResetLimits = jest.spyOn(usageService, 'resetDailyQuizLimits');
    const { getByTestId } = renderDebugScreen();

    fireEvent.press(getByTestId('debug-reset-daily-limit'));

    expect(spyResetLimits).toHaveBeenCalled();
    expect(Alert.alert).toHaveBeenCalled();
  });

  it('should grant extra quiz and consume quiz on respective button presses', () => {
    const spyGrant = jest.spyOn(usageService, 'grantExtraQuiz');
    const spyConsume = jest.spyOn(usageService, 'incrementDailyCompletedQuizzes');
    const { getByTestId } = renderDebugScreen();

    fireEvent.press(getByTestId('debug-grant-extra-quiz'));
    expect(spyGrant).toHaveBeenCalled();

    fireEvent.press(getByTestId('debug-consume-quiz'));
    expect(spyConsume).toHaveBeenCalled();
  });

  it('should reset streak and trigger alert on reset streak button press', () => {
    const spyResetStreak = jest.spyOn(streakService, 'resetStreakData');
    const { getByTestId } = renderDebugScreen();

    fireEvent.press(getByTestId('debug-reset-streak'));

    expect(spyResetStreak).toHaveBeenCalled();
    expect(Alert.alert).toHaveBeenCalled();
  });

  it('should increment streak on increment streak button press', () => {
    const spyRecordStreak = jest.spyOn(streakService, 'recordStreakActivity');
    const { getByTestId } = renderDebugScreen();

    fireEvent.press(getByTestId('debug-increment-streak'));

    expect(spyRecordStreak).toHaveBeenCalled();
  });

  it('should reset all settings and trigger alert on reset settings button press', () => {
    const spyResetSettings = jest.spyOn(settingsService, 'resetAllSettings');
    const { getByTestId } = renderDebugScreen();

    fireEvent.press(getByTestId('debug-reset-all-settings'));

    expect(spyResetSettings).toHaveBeenCalled();
    expect(Alert.alert).toHaveBeenCalled();
  });

  it('should trigger soft update, force update, and reset update state', () => {
    const spyTriggerUpdate = jest.spyOn(appUpdateHook, 'triggerDebugAppUpdate');
    const { getByTestId } = renderDebugScreen();

    fireEvent.press(getByTestId('debug-trigger-soft-update'));
    expect(spyTriggerUpdate).toHaveBeenCalledWith('soft');

    fireEvent.press(getByTestId('debug-trigger-force-update'));
    expect(spyTriggerUpdate).toHaveBeenCalledWith('force');

    fireEvent.press(getByTestId('debug-reset-update-state'));
    expect(spyTriggerUpdate).toHaveBeenCalledWith(null);
  });

  it('should trigger in-app review, add completed quizzes, and reset review cooldown', async () => {
    const { getByTestId } = renderDebugScreen();

    fireEvent.press(getByTestId('debug-add-completed-quizzes'));
    expect(settingsService.getSettings().completedQuizCount).toBe(5);

    fireEvent.press(getByTestId('debug-reset-review-cooldown'));
    expect(settingsService.getSettings().lastReviewPromptDate).toBeNull();
    expect(Alert.alert).toHaveBeenCalled();
  });

  it('should navigate to FirstOpenPaywall with isDebugPreview and reset paywall state', () => {
    const spyResetPaywall = jest.spyOn(usageService, 'resetFirstOpenPaywall');
    const { getByTestId } = renderDebugScreen();

    fireEvent.press(getByTestId('debug-open-first-open-paywall'));
    expect(mockNavigate).toHaveBeenCalledWith('FirstOpenPaywall', { isDebugPreview: true });

    fireEvent.press(getByTestId('debug-reset-first-open-paywall'));
    expect(spyResetPaywall).toHaveBeenCalled();
    expect(Alert.alert).toHaveBeenCalled();
  });

  it('should perform full storage reset to defaults on reset all MMKV button press', () => {
    const spyResetSettings = jest.spyOn(settingsService, 'resetAllSettings');
    const spyResetStreak = jest.spyOn(streakService, 'resetStreakData');
    const spyResetLimits = jest.spyOn(usageService, 'resetDailyQuizLimits');
    const spyResetPaywall = jest.spyOn(usageService, 'resetFirstOpenPaywall');

    const { getByTestId } = renderDebugScreen();

    fireEvent.press(getByTestId('debug-reset-all-mmkv'));

    expect(spyResetSettings).toHaveBeenCalled();
    expect(spyResetStreak).toHaveBeenCalled();
    expect(spyResetLimits).toHaveBeenCalled();
    expect(spyResetPaywall).toHaveBeenCalled();
    expect(Alert.alert).toHaveBeenCalled();
  });
});
