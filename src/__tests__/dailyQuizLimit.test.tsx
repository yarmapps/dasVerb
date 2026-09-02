import React from 'react';
import { render, fireEvent, act, renderHook } from '@testing-library/react-native';
import { DailyQuizLimitModal } from '../components/DailyQuizLimitModal/DailyQuizLimitModal';
import { useNavigateToQuiz } from '../hooks/useNavigateToQuiz';
import {
  resetDailyQuizLimits,
  incrementDailyCompletedQuizzes,
  canStartQuiz,
  getFreeDailyQuizzes,
} from '../services/usageService';
import { setPremiumEnabled } from '../services/premiumAccessService';
import { IntlProvider } from 'react-intl';
import { ThemeProvider } from '../context/ThemeContext';
import { getMessages } from '../services/intlService';

function ScreenWrapper({ children }: { children: React.ReactNode }) {
  return (
    <IntlProvider locale="ru" messages={getMessages('ru')}>
      <ThemeProvider>{children}</ThemeProvider>
    </IntlProvider>
  );
}

describe('DailyQuizLimit Component & Hook', () => {
  beforeEach(() => {
    resetDailyQuizLimits();
    setPremiumEnabled(false);
    jest.clearAllMocks();
  });

  describe('DailyQuizLimitModal', () => {
    it('should render modal with title, message, premium and video ad buttons', () => {
      const onDismiss = jest.fn();
      const onVideoSuccess = jest.fn();
      const onPremiumCTA = jest.fn();

      const { getByText, getByTestId } = render(
        <ScreenWrapper>
          <DailyQuizLimitModal
            visible={true}
            onDismiss={onDismiss}
            onVideoSuccess={onVideoSuccess}
            onPremiumCTA={onPremiumCTA}
            canWatchAd={true}
          />
        </ScreenWrapper>,
      );

      expect(getByText('Отличный прогресс!')).toBeTruthy();
      expect(getByText('Купить Premium')).toBeTruthy();
      expect(getByText('Смотреть рекламу')).toBeTruthy();

      fireEvent.press(getByTestId('daily-limit-premium-button'));
      expect(onPremiumCTA).toHaveBeenCalled();

      fireEvent.press(getByTestId('daily-limit-close-button'));
      expect(onDismiss).toHaveBeenCalled();
    });

    it('should handle video ad click and trigger onVideoSuccess when rewarded', async () => {
      const onDismiss = jest.fn();
      const onVideoSuccess = jest.fn();

      const { getByTestId } = render(
        <ScreenWrapper>
          <DailyQuizLimitModal
            visible={true}
            onDismiss={onDismiss}
            onVideoSuccess={onVideoSuccess}
            canWatchAd={true}
          />
        </ScreenWrapper>,
      );

      await act(async () => {
        fireEvent.press(getByTestId('daily-limit-video-button'));
      });

      expect(onVideoSuccess).toHaveBeenCalled();
      expect(canStartQuiz()).toBe(true);
    });
  });

  describe('useNavigateToQuiz', () => {
    it('should navigate immediately when within daily limit', () => {
      const mockNavigate = jest.fn();
      const mockReplace = jest.fn();
      const navigation = { navigate: mockNavigate, replace: mockReplace };

      const { result } = renderHook(() => useNavigateToQuiz(navigation));

      act(() => {
        result.current.navigateToQuiz({ infinitive: 'anrufen', level: 'A1' });
      });

      expect(mockNavigate).toHaveBeenCalledWith('VerbQuiz', {
        infinitive: 'anrufen',
        level: 'A1',
      });
    });

    it('should replace screen when mode is replace and within limit', () => {
      const mockNavigate = jest.fn();
      const mockReplace = jest.fn();
      const navigation = { navigate: mockNavigate, replace: mockReplace };

      const { result } = renderHook(() => useNavigateToQuiz(navigation));

      act(() => {
        result.current.navigateToQuiz({ infinitive: 'anrufen', level: 'A1' }, 'replace');
      });

      expect(mockReplace).toHaveBeenCalledWith('VerbQuiz', {
        infinitive: 'anrufen',
        level: 'A1',
      });
    });

    it('should block navigation and require ad reward when daily limit is reached', async () => {
      // Exhaust free daily limit
      const limit = getFreeDailyQuizzes();
      for (let i = 0; i < limit; i++) {
        incrementDailyCompletedQuizzes();
      }

      const mockNavigate = jest.fn();
      const navigation = { navigate: mockNavigate };

      const { result } = renderHook(() => useNavigateToQuiz(navigation));

      act(() => {
        result.current.navigateToQuiz({ infinitive: 'fahren', level: 'A1' });
      });

      // Navigation did not happen immediately because modal is open
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});
