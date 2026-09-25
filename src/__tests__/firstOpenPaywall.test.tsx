import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import type { PurchasesPackage } from 'react-native-purchases';
import { FirstOpenPaywallScreen } from '../screens/FirstOpenPaywallScreen/FirstOpenPaywallScreen';
import { TimelineStep } from '../components/TimelineStep/TimelineStep';
import { ThemeProvider } from '../context/ThemeContext';
import { LocaleProvider } from '../context/LocaleContext';
import {
  hasSeenFirstOpenPaywall,
  markFirstOpenPaywallSeen,
  resetFirstOpenPaywall,
  shouldShowFirstOpenPaywall,
} from '../services/usageService';
import { setPremiumEnabled } from '../services/premiumAccessService';
import * as revenueCatService from '../services/revenueCatService';
import * as analyticsService from '../services/analyticsService';
import * as appConfigService from '../services/appConfigService';

const mockDispatch = jest.fn();
const mockNav = {
  dispatch: mockDispatch,
  canGoBack: () => false,
  goBack: jest.fn(),
};
const mockRoute = { params: {} };
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => mockNav,
    useRoute: () => mockRoute,
  };
});

jest.mock('../config/features', () => ({
  ENABLE_ADS: true,
  ENABLE_ANALYTICS: true,
  ENABLE_PREMIUM: true,
}));

function renderWithProviders(component: React.ReactElement) {
  return render(
    <ThemeProvider>
      <LocaleProvider>{component}</LocaleProvider>
    </ThemeProvider>,
  );
}

const mockPackages: revenueCatService.MappedPackages = {
  threeMonth: {
    priceString: '$8.99',
    monthlyPriceString: '$3.00',
    freeTrialInfo: {
      count: 3,
      unit: 'day',
    },
    pkg: {
      identifier: '$rc_three_month',
      packageType: 'THREE_MONTH',
      product: {
        identifier: 'dasverb_premium_3months',
        priceString: '$8.99',
        price: 8.99,
        currencyCode: 'USD',
      },
      offeringIdentifier: 'default',
    } as unknown as PurchasesPackage,
  },
  monthly: null,
  sixMonth: null,
  yearly: null,
  lifetime: null,
};

describe('First Open Paywall Suite', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetFirstOpenPaywall();
    setPremiumEnabled(false);
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    jest.spyOn(analyticsService, 'trackEvent').mockResolvedValue(undefined);
    jest.spyOn(revenueCatService, 'getMappedPackages').mockResolvedValue(mockPackages);
    jest.spyOn(revenueCatService, 'purchasePackage').mockResolvedValue(true);
    jest.spyOn(revenueCatService, 'restorePurchases').mockResolvedValue(true);
  });

  describe('usageService - First Open Paywall state', () => {
    it('should correctly track and reset first open paywall seen state', () => {
      expect(hasSeenFirstOpenPaywall()).toBe(false);

      markFirstOpenPaywallSeen();
      expect(hasSeenFirstOpenPaywall()).toBe(true);

      resetFirstOpenPaywall();
      expect(hasSeenFirstOpenPaywall()).toBe(false);
    });

    it('should evaluate shouldShowFirstOpenPaywall based on premium status, seen state and remote config', () => {
      jest.spyOn(appConfigService, 'isFirstOpenPaywallDisabled').mockReturnValue(false);
      // Initially not seen, not premium, not disabled -> should be true
      expect(shouldShowFirstOpenPaywall()).toBe(true);

      // Once seen -> should be false
      markFirstOpenPaywallSeen();
      expect(shouldShowFirstOpenPaywall()).toBe(false);

      resetFirstOpenPaywall();
      expect(shouldShowFirstOpenPaywall()).toBe(true);

      // If user is already premium -> should be false
      setPremiumEnabled(true);
      expect(shouldShowFirstOpenPaywall()).toBe(false);

      // If disabled via remote config -> should be false
      setPremiumEnabled(false);
      jest.spyOn(appConfigService, 'isFirstOpenPaywallDisabled').mockReturnValue(true);
      expect(shouldShowFirstOpenPaywall()).toBe(false);
    });
  });

  describe('TimelineStep Component', () => {
    it('should render step elements and optional props correctly', () => {
      const { getByText, getByTestId, queryByTestId, rerender } = renderWithProviders(
        <TimelineStep
          icon="gem"
          iconColor="#FFD700"
          iconBgColor="#FFF8DC"
          connectorColor="#CCCCCC"
          showConnector={true}
          day="Day 1"
          headline="Start 3-Day Trial"
          subline="$19.99/year"
          description="Instant access to all features"
        />,
      );

      expect(getByText('Day 1')).toBeTruthy();
      expect(getByText('Start 3-Day Trial')).toBeTruthy();
      expect(getByText('$19.99/year')).toBeTruthy();
      expect(getByText('Instant access to all features')).toBeTruthy();
      expect(getByTestId('timeline-connector')).toBeTruthy();

      rerender(
        <ThemeProvider>
          <LocaleProvider>
            <TimelineStep
              icon="credit-card"
              iconColor="#4A90E2"
              iconBgColor="#E6F0FA"
              connectorColor="#CCCCCC"
              showConnector={false}
              day="Day 3"
              headline="Trial Ends"
            />
          </LocaleProvider>
        </ThemeProvider>,
      );

      expect(getByText('Day 3')).toBeTruthy();
      expect(getByText('Trial Ends')).toBeTruthy();
      expect(queryByTestId('timeline-connector')).toBeNull();
    });
  });

  describe('FirstOpenPaywallScreen UI & Interactions', () => {
    const mockPackages: revenueCatService.MappedPackages = {
      threeMonth: {
        priceString: '$8.99',
        monthlyPriceString: '$3.00',
        freeTrialInfo: {
          count: 3,
          unit: 'day',
        },
        pkg: {
          identifier: 'three_month_subscription',
          packageType: 'THREE_MONTH',
          product: {
            identifier: 'dasverb_premium_3months',
            description: '3-Month Plan',
            title: '3-Month',
            price: 8.99,
            priceString: '$8.99',
            currencyCode: 'USD',
          },
          offeringIdentifier: 'default',
        } as unknown as PurchasesPackage,
      },
      monthly: null,
      sixMonth: null,
      yearly: null,
      lifetime: null,
    };

    beforeEach(() => {
      (revenueCatService.getMappedPackages as jest.Mock).mockResolvedValue(mockPackages);
      (revenueCatService.purchasePackage as jest.Mock).mockResolvedValue(true);
      (revenueCatService.restorePurchases as jest.Mock).mockResolvedValue(true);
      (analyticsService.trackEvent as jest.Mock).mockResolvedValue(undefined);
      jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    });

    it('should close paywall and navigate to MainTabs when close button is pressed', async () => {
      const { getByTestId } = renderWithProviders(<FirstOpenPaywallScreen />);

      await waitFor(() => {
        expect(getByTestId('first-open-paywall-close')).toBeTruthy();
      });

      fireEvent.press(getByTestId('first-open-paywall-close'));

      expect(analyticsService.trackEvent).toHaveBeenCalledWith(
        'first_open_paywall_close_clicked',
        {},
      );
      expect(hasSeenFirstOpenPaywall()).toBe(true);
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'RESET',
          payload: {
            index: 0,
            routes: [{ name: 'MainTabs' }],
          },
        }),
      );
    });

    it('should handle "Proceed with Free Limited" button press', async () => {
      const { getByTestId } = renderWithProviders(<FirstOpenPaywallScreen />);

      await waitFor(() => {
        expect(getByTestId('first-open-paywall-proceed-limited')).toBeTruthy();
      });

      fireEvent.press(getByTestId('first-open-paywall-proceed-limited'));

      expect(analyticsService.trackEvent).toHaveBeenCalledWith(
        'first_open_paywall_limited_clicked',
        {},
      );
      expect(hasSeenFirstOpenPaywall()).toBe(true);
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'RESET',
          payload: {
            index: 0,
            routes: [{ name: 'MainTabs' }],
          },
        }),
      );
    });

    it('should handle successful purchase via CTA button', async () => {
      const { getByTestId, getByText } = renderWithProviders(<FirstOpenPaywallScreen />);

      // Wait until packages are loaded and CTA arrow text is rendered
      await waitFor(() => {
        expect(getByText(/→/)).toBeTruthy();
      });

      await act(async () => {
        fireEvent.press(getByTestId('first-open-paywall-cta'));
      });

      expect(analyticsService.trackEvent).toHaveBeenCalledWith(
        'first_open_paywall_buy_clicked',
        {},
      );
      expect(revenueCatService.purchasePackage).toHaveBeenCalledWith(mockPackages.threeMonth!.pkg);
      expect(analyticsService.trackEvent).toHaveBeenCalledWith(
        'first_open_paywall_purchase_complete',
        {},
      );
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'RESET',
          payload: {
            index: 0,
            routes: [{ name: 'MainTabs' }],
          },
        }),
      );
    });

    it('should handle restore purchases successfully', async () => {
      const { getByTestId, getByText } = renderWithProviders(<FirstOpenPaywallScreen />);

      await waitFor(() => {
        expect(getByText(/→/)).toBeTruthy();
      });

      await act(async () => {
        fireEvent.press(getByTestId('first-open-paywall-restore'));
      });

      expect(revenueCatService.restorePurchases).toHaveBeenCalled();
      expect(Alert.alert).toHaveBeenCalled();
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'RESET',
          payload: {
            index: 0,
            routes: [{ name: 'MainTabs' }],
          },
        }),
      );
    });

    it('should handle restore purchases when nothing is restored', async () => {
      jest.spyOn(revenueCatService, 'restorePurchases').mockResolvedValueOnce(false);

      const { getByTestId, getByText } = renderWithProviders(<FirstOpenPaywallScreen />);

      await waitFor(() => {
        expect(getByText(/→/)).toBeTruthy();
      });

      await act(async () => {
        fireEvent.press(getByTestId('first-open-paywall-restore'));
      });

      expect(revenueCatService.restorePurchases).toHaveBeenCalled();
      expect(Alert.alert).toHaveBeenCalled();
    });

    it('should show alert if purchase fails with error', async () => {
      jest
        .spyOn(revenueCatService, 'purchasePackage')
        .mockRejectedValueOnce(new Error('Payment failed'));

      const { getByTestId, getByText } = renderWithProviders(<FirstOpenPaywallScreen />);

      // Wait until packages are loaded
      await waitFor(() => {
        expect(getByText(/→/)).toBeTruthy();
      });

      await act(async () => {
        fireEvent.press(getByTestId('first-open-paywall-cta'));
      });

      expect(Alert.alert).toHaveBeenCalledWith(expect.anything(), 'Payment failed');
    });
  });
});
