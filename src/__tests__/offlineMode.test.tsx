import React from 'react';
import { TouchableOpacity } from 'react-native';
import { render, fireEvent, act } from '@testing-library/react-native';
import { IntlProvider } from 'react-intl';
import { fetch as fetchNetInfo } from '@react-native-community/netinfo';
import { OfflineLimitModal } from '../components/OfflineLimitModal/OfflineLimitModal';
import { useNavigateToQuiz, NavigationHandler } from '../hooks/useNavigateToQuiz';
import { isNetworkConnected } from '../services/networkService';
import * as premiumAccessService from '../services/premiumAccessService';
import * as featuresService from '../services/featuresService';
import * as revenueCatService from '../services/revenueCatService';
import { ThemeProvider } from '../context/ThemeContext';
import { getMessages } from '../services/intlService';

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <IntlProvider locale="ru" messages={getMessages('ru')}>
        {children}
      </IntlProvider>
    </ThemeProvider>
  );
}

describe('Offline Mode & isNetworkConnected', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isNetworkConnected service', () => {
    it('returns true when connected and reachable', async () => {
      (fetchNetInfo as jest.Mock).mockResolvedValueOnce({
        isConnected: true,
        isInternetReachable: true,
      });

      const result = await isNetworkConnected();
      expect(result).toBe(true);
    });

    it('returns false when isConnected is false', async () => {
      (fetchNetInfo as jest.Mock).mockResolvedValueOnce({
        isConnected: false,
        isInternetReachable: false,
      });

      const result = await isNetworkConnected();
      expect(result).toBe(false);
    });

    it('returns false when isInternetReachable is false', async () => {
      (fetchNetInfo as jest.Mock).mockResolvedValueOnce({
        isConnected: true,
        isInternetReachable: false,
      });

      const result = await isNetworkConnected();
      expect(result).toBe(false);
    });

    it('falls back to true on NetInfo exception', async () => {
      (fetchNetInfo as jest.Mock).mockRejectedValueOnce(new Error('NetInfo error'));

      const result = await isNetworkConnected();
      expect(result).toBe(true);
    });
  });

  describe('OfflineLimitModal component', () => {
    it('renders title, message, and retry button correctly', () => {
      jest.spyOn(featuresService, 'isFeatureEnabled').mockImplementation(flag => {
        if (flag === 'ENABLE_PREMIUM') return false;
        return true;
      });
      const onDismiss = jest.fn();
      const onRetry = jest.fn();
      const onPremiumCTA = jest.fn();

      const { getByText, getByTestId, queryByTestId } = render(
        <Wrapper>
          <OfflineLimitModal
            visible={true}
            onDismiss={onDismiss}
            onRetry={onRetry}
            onPremiumCTA={onPremiumCTA}
          />
        </Wrapper>,
      );

      expect(getByText('Требуется интернет')).toBeTruthy();
      expect(getByText('Оформите Premium, чтобы заниматься офлайн в любое время.')).toBeTruthy();
      expect(getByTestId('offline-modal-retry-button')).toBeTruthy();
      // Premium button is hidden by default when ENABLE_PREMIUM is false
      expect(queryByTestId('offline-modal-premium-button')).toBeNull();

      fireEvent.press(getByTestId('offline-modal-retry-button'));
      expect(onRetry).toHaveBeenCalledTimes(1);

      fireEvent.press(getByTestId('offline-modal-close-button'));
      expect(onDismiss).toHaveBeenCalledTimes(1);
    });

    it('renders and triggers purchase when ENABLE_PREMIUM is true with trial packages', async () => {
      jest.spyOn(featuresService, 'isFeatureEnabled').mockImplementation(flag => {
        if (flag === 'ENABLE_PREMIUM') return true;
        return false;
      });
      jest.spyOn(revenueCatService, 'purchasePackage').mockResolvedValue(true);

      const onDismiss = jest.fn();
      const onRetry = jest.fn();
      const onPremiumCTA = jest.fn();

      const { getByTestId, getByText } = render(
        <Wrapper>
          <OfflineLimitModal
            visible={true}
            onDismiss={onDismiss}
            onRetry={onRetry}
            onPremiumCTA={onPremiumCTA}
          />
        </Wrapper>,
      );

      await act(async () => {});

      expect(getByTestId('offline-modal-premium-button')).toBeTruthy();
      expect(getByText('Включить офлайн')).toBeTruthy();

      await act(async () => {
        fireEvent.press(getByTestId('offline-modal-premium-button'));
      });
      expect(onPremiumCTA).toHaveBeenCalledTimes(1);
    });

    it('triggers onPremiumCTA when premium button is clicked', async () => {
      jest.spyOn(featuresService, 'isFeatureEnabled').mockReturnValue(true);

      const onPremiumCTA = jest.fn();

      const { getByTestId, getByText } = render(
        <Wrapper>
          <OfflineLimitModal
            visible={true}
            onDismiss={jest.fn()}
            onRetry={jest.fn()}
            onPremiumCTA={onPremiumCTA}
          />
        </Wrapper>,
      );

      await act(async () => {});

      expect(getByTestId('offline-modal-premium-button')).toBeTruthy();
      expect(getByText('Включить офлайн')).toBeTruthy();

      fireEvent.press(getByTestId('offline-modal-premium-button'));
      expect(onPremiumCTA).toHaveBeenCalledTimes(1);
    });
  });

  describe('useNavigateToQuiz offline integration', () => {
    const mockNavigate = jest.fn();
    const mockReplace = jest.fn();
    const navigation: NavigationHandler = {
      navigate: mockNavigate,
      replace: mockReplace,
    };

    function TestNavigator({
      infinitive = 'haben',
      level = 'A1',
    }: {
      infinitive?: string;
      level?: string;
    }) {
      const { navigateToQuiz, dailyQuizLimitModalUI } = useNavigateToQuiz(navigation);
      return (
        <Wrapper>
          <TouchableOpacity
            testID="start-quiz-btn"
            onPress={() => navigateToQuiz({ infinitive, level })}
          />
          {dailyQuizLimitModalUI}
        </Wrapper>
      );
    }

    beforeEach(() => {
      jest.clearAllMocks();
      jest.spyOn(premiumAccessService, 'isPremiumEnabled').mockReturnValue(false);
    });

    it('bypasses offline check when user has active premium', async () => {
      jest.spyOn(premiumAccessService, 'isPremiumEnabled').mockReturnValue(true);
      (fetchNetInfo as jest.Mock).mockResolvedValue({
        isConnected: false,
        isInternetReachable: false,
      });

      const { getByTestId } = render(<TestNavigator infinitive="gehen" level="A1" />);

      await act(async () => {
        fireEvent.press(getByTestId('start-quiz-btn'));
      });

      expect(mockNavigate).toHaveBeenCalledWith('VerbQuiz', {
        infinitive: 'gehen',
        level: 'A1',
      });
    });

    it('shows offline modal for free user when offline and does not navigate', async () => {
      (fetchNetInfo as jest.Mock).mockResolvedValue({
        isConnected: false,
        isInternetReachable: false,
      });

      const { getByText, getByTestId } = render(<TestNavigator infinitive="haben" level="A1" />);

      await act(async () => {
        fireEvent.press(getByTestId('start-quiz-btn'));
      });

      expect(mockNavigate).not.toHaveBeenCalled();
      expect(getByText('Требуется интернет')).toBeTruthy();

      // Click retry while still offline -> should not navigate
      await act(async () => {
        fireEvent.press(getByTestId('offline-modal-retry-button'));
      });
      expect(mockNavigate).not.toHaveBeenCalled();

      // Now connect to internet and click retry -> should navigate!
      (fetchNetInfo as jest.Mock).mockResolvedValue({
        isConnected: true,
        isInternetReachable: true,
      });

      await act(async () => {
        fireEvent.press(getByTestId('offline-modal-retry-button'));
      });
      expect(mockNavigate).toHaveBeenCalledWith('VerbQuiz', {
        infinitive: 'haben',
        level: 'A1',
      });
    });
  });
});
