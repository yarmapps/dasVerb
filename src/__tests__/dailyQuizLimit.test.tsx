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
    it('should render modal with title, message, and video ad button when ENABLE_PREMIUM is false', () => {
      const onDismiss = jest.fn();
      const onVideoSuccess = jest.fn();
      const onPremiumCTA = jest.fn();

      const { getByText, getByTestId, queryByTestId, queryByText } = render(
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

      expect(getByText('Так держать!')).toBeTruthy();
      expect(queryByText('Купить Premium')).toBeNull();
      expect(queryByTestId('daily-limit-premium-button')).toBeNull();
      expect(getByText('Смотреть рекламу')).toBeTruthy();

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
    it('should navigate immediately when within daily limit', async () => {
      const mockNavigate = jest.fn();
      const mockReplace = jest.fn();
      const navigation = { navigate: mockNavigate, replace: mockReplace };

      const { result } = renderHook(() => useNavigateToQuiz(navigation));

      await act(async () => {
        await result.current.navigateToQuiz({ infinitive: 'anrufen', level: 'A1' });
      });

      expect(mockNavigate).toHaveBeenCalledWith('VerbQuiz', {
        infinitive: 'anrufen',
        level: 'A1',
      });
    });

    it('should replace screen when mode is replace and within limit', async () => {
      const mockNavigate = jest.fn();
      const mockReplace = jest.fn();
      const navigation = { navigate: mockNavigate, replace: mockReplace };

      const { result } = renderHook(() => useNavigateToQuiz(navigation));

      await act(async () => {
        await result.current.navigateToQuiz({ infinitive: 'anrufen', level: 'A1' }, 'replace');
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

      await act(async () => {
        await result.current.navigateToQuiz({ infinitive: 'fahren', level: 'A1' });
      });

      // Navigation did not happen immediately because modal is open
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should block navigation for free user when attempting A2, B1, or B2 quiz', async () => {
      const mockNavigate = jest.fn();
      const navigation = { navigate: mockNavigate };

      const { result } = renderHook(() => useNavigateToQuiz(navigation));

      await act(async () => {
        await result.current.navigateToQuiz({ infinitive: 'verstehen', level: 'A2' });
      });

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should allow free users to navigate to category verbs 1 to 10', async () => {
      const mockNavigate = jest.fn();
      const navigation = { navigate: mockNavigate };

      const { result } = renderHook(() => useNavigateToQuiz(navigation));

      await act(async () => {
        await result.current.navigateToQuiz({
          infinitive: 'gehen',
          level: 'A1',
          categoryId: 'movement',
          fromIndex: 5,
        });
      });

      expect(mockNavigate).toHaveBeenCalledWith('VerbQuiz', {
        infinitive: 'gehen',
        level: 'A1',
        categoryId: 'movement',
        fromIndex: 5,
      });
    });

    it('should block navigation for free users on category verbs > 10 and category checkpoints', async () => {
      const mockNavigate = jest.fn();
      const navigation = { navigate: mockNavigate };

      const { result } = renderHook(() => useNavigateToQuiz(navigation));

      // Verb > 10
      await act(async () => {
        await result.current.navigateToQuiz({
          infinitive: 'reisen',
          level: 'A2',
          categoryId: 'movement',
          fromIndex: 11,
        });
      });
      expect(mockNavigate).not.toHaveBeenCalled();

      // Checkpoint in category
      await act(async () => {
        await result.current.navigateToQuiz({
          isCheckpoint: true,
          checkpointId: 'category-movement-final',
          categoryId: 'movement',
        });
      });
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should allow navigation for premium users on category verbs > 10 and checkpoints', async () => {
      setPremiumEnabled(true);
      const mockNavigate = jest.fn();
      const navigation = { navigate: mockNavigate };

      const { result } = renderHook(() => useNavigateToQuiz(navigation));

      await act(async () => {
        await result.current.navigateToQuiz({
          infinitive: 'reisen',
          level: 'A2',
          categoryId: 'movement',
          fromIndex: 11,
        });
      });

      expect(mockNavigate).toHaveBeenCalledWith('VerbQuiz', {
        infinitive: 'reisen',
        level: 'A2',
        categoryId: 'movement',
        fromIndex: 11,
      });
    });
  });
});
