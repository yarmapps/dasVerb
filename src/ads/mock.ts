/* eslint-disable import/no-default-export, @typescript-eslint/no-explicit-any */
import { Alert } from 'react-native';

/**
 * Mock module for react-native-google-mobile-ads.
 * Used when ENABLE_ADS is false so the app runs in Expo Go
 * without missing native TurboModule crashes.
 */

export const RewardedAd = {
  createForAdRequest: () => {
    let earnedRewardHandler: (() => void) | null = null;
    let closedHandler: (() => void) | null = null;

    return {
      load: () => {},
      show: () => {
        Alert.alert(
          '🎬 Тестовая реклама AdMob (Expo Go)',
          'В Expo Go нативный модуль Google AdMob не встроен. Выполняется симуляция просмотра тестового ролика.',
          [
            {
              text: 'Получить награду и продолжить',
              onPress: () => {
                earnedRewardHandler?.();
                closedHandler?.();
              },
            },
          ],
          { cancelable: false },
        );
        return Promise.resolve();
      },
      addAdEventListener: (type: string, handler: any) => {
        if (type === 'rewarded_earned_reward') {
          earnedRewardHandler = handler;
        } else if (type === 'closed') {
          closedHandler = handler;
        } else if (type === 'loaded') {
          setTimeout(() => handler(), 50);
        }
        return () => {};
      },
    };
  },
};

export const AdEventType = {
  LOADED: 'loaded',
  ERROR: 'error',
  OPENED: 'opened',
  CLOSED: 'closed',
};

export const RewardedAdEventType = {
  LOADED: 'loaded',
  EARNED_REWARD: 'rewarded_earned_reward',
};

export const TestIds = {
  REWARDED: 'mock-rewarded-id',
  BANNER: 'mock-banner-id',
};

// Default export mock (MobileAds initialization)
export default () => ({
  initialize: () => Promise.resolve(),
  setRequestConfiguration: () => Promise.resolve(),
});
