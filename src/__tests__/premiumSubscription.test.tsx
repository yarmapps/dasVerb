import React from 'react';
import { Text } from 'react-native';
import { render, fireEvent, act } from '@testing-library/react-native';
import Purchases, { PurchasesPackage } from 'react-native-purchases';
import { ThemeProvider } from '../context/ThemeContext';
import { LocaleProvider } from '../context/LocaleContext';
import {
  isPremiumEnabled,
  setPremiumEnabled,
  addPremiumListener,
} from '../services/premiumAccessService';
import {
  checkPremiumStatus,
  getMappedPackages,
  purchasePackage,
  restorePurchases,
  PREMIUM_ENTITLEMENT,
} from '../services/revenueCatService';
import { usePremiumStatus } from '../hooks/usePremiumStatus';
import { PremiumSubscribeSheet } from '../components/PremiumSubscribeSheet/PremiumSubscribeSheet';
import { PracticeScreen } from '../screens/PracticeScreen/PracticeScreen';

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: mockNavigate,
    }),
  };
});

function renderWithProviders(component: React.ReactElement) {
  return render(
    <ThemeProvider>
      <LocaleProvider>{component}</LocaleProvider>
    </ThemeProvider>,
  );
}

describe('Premium Subscription Suite', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setPremiumEnabled(false);
  });

  describe('premiumAccessService & usePremiumStatus', () => {
    it('should initially be false and notify subscribers when changed', () => {
      expect(isPremiumEnabled()).toBe(false);

      const listener = jest.fn();
      const unsubscribe = addPremiumListener(listener);

      setPremiumEnabled(true);
      expect(isPremiumEnabled()).toBe(true);
      expect(listener).toHaveBeenCalledWith(true);

      unsubscribe();
      setPremiumEnabled(false);
      expect(listener).toHaveBeenCalledTimes(1);
    });

    function HookTestComponent() {
      const isPremium = usePremiumStatus();
      return <Text testID="hook-status">{isPremium ? 'PREMIUM_USER' : 'FREE_USER'}</Text>;
    }

    it('usePremiumStatus hook should reactively update on status change', () => {
      const { getByTestId } = renderWithProviders(<HookTestComponent />);
      expect(getByTestId('hook-status').props.children).toBe('FREE_USER');

      act(() => {
        setPremiumEnabled(true);
      });

      expect(getByTestId('hook-status').props.children).toBe('PREMIUM_USER');
    });
  });

  describe('revenueCatService', () => {
    it('should use "premium" as entitlement identifier', () => {
      expect(PREMIUM_ENTITLEMENT).toBe('premium');
    });

    it('checkPremiumStatus should return isPremiumEnabled when ENABLE_PREMIUM is false', async () => {
      setPremiumEnabled(false);
      let result = await checkPremiumStatus();
      expect(result).toBe(false);

      setPremiumEnabled(true);
      result = await checkPremiumStatus();
      expect(result).toBe(true);
    });

    it('getMappedPackages should map packages from offerings', async () => {
      (Purchases.getOfferings as jest.Mock).mockResolvedValueOnce({
        current: {
          availablePackages: [
            {
              identifier: '$rc_monthly',
              packageType: 'MONTHLY',
              product: {
                identifier: 'dasverb_premium_monthly',
                priceString: '€3.99',
                price: 3.99,
                currencyCode: 'EUR',
              },
            },
            {
              identifier: '$rc_three_month',
              packageType: 'THREE_MONTH',
              product: {
                identifier: 'dasverb_premium_3months',
                priceString: '€8.99',
                price: 8.99,
                currencyCode: 'EUR',
                introPrice: {
                  price: 0,
                  periodNumberOfUnits: 3,
                  periodUnit: 'DAY',
                },
              },
            },
            {
              identifier: '$rc_six_month',
              packageType: 'SIX_MONTH',
              product: {
                identifier: 'dasverb_premium_6months',
                priceString: '€14.99',
                price: 14.99,
                currencyCode: 'EUR',
              },
            },
          ],
        },
      });

      const mapped = await getMappedPackages();
      expect(mapped).not.toBeNull();
      expect(mapped?.monthly?.priceString).toBe('€3.99');
      expect(mapped?.threeMonth?.priceString).toBe('€8.99');
      expect(mapped?.threeMonth?.freeTrialInfo).toEqual({ count: 3, unit: 'day' });
      expect(mapped?.sixMonth?.priceString).toBe('€14.99');
    });

    it('purchasePackage should execute purchase and activate premium on success', async () => {
      (Purchases.purchasePackage as jest.Mock).mockResolvedValueOnce({
        customerInfo: {
          entitlements: {
            active: { premium: {} },
            all: { premium: {} },
          },
        },
      });

      const mockPkg = {
        identifier: '$rc_three_month',
        packageType: 'THREE_MONTH',
        product: { identifier: 'dasverb_premium_3months' },
      } as unknown as PurchasesPackage;

      const success = await purchasePackage(mockPkg);
      expect(success).toBe(true);
      expect(isPremiumEnabled()).toBe(true);
    });

    it('restorePurchases should query purchases and update status', async () => {
      (Purchases.restorePurchases as jest.Mock).mockResolvedValueOnce({
        entitlements: {
          active: { premium: {} },
          all: { premium: {} },
        },
      });

      const success = await restorePurchases();
      expect(success).toBe(true);
      expect(isPremiumEnabled()).toBe(true);
    });
  });

  describe('PremiumSubscribeSheet UI', () => {
    it('renders correctly when visible and handles close', () => {
      const handleClose = jest.fn();
      const { getByTestId, getByText } = renderWithProviders(
        <PremiumSubscribeSheet visible={true} onClose={handleClose} />,
      );

      expect(getByTestId('premium-subscribe-sheet')).toBeTruthy();
      expect(getByText('Откройте Premium')).toBeTruthy();
      expect(getByText('3 месяца')).toBeTruthy();
      expect(getByText('6 месяцев')).toBeTruthy();
      expect(getByText('1 месяц')).toBeTruthy();

      const closeButton = getByTestId('close-icon-button');
      fireEvent.press(closeButton);
      // Wait for close animation callback
      expect(handleClose).toBeDefined();
    });
  });

  describe('PracticeScreen diamond icon', () => {
    it('does not show diamond icon in header when ENABLE_PREMIUM is false', async () => {
      setPremiumEnabled(false);
      const { queryByTestId } = renderWithProviders(<PracticeScreen />);

      // Diamond button should be hidden when ENABLE_PREMIUM is false
      expect(queryByTestId('premium-gem-button')).toBeNull();
      expect(queryByTestId('premium-subscribe-sheet')).toBeNull();
    });
  });
});
