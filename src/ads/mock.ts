/* eslint-disable import/no-default-export, @typescript-eslint/no-explicit-any */
import React from 'react';
import { Alert, View } from 'react-native';

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

export const InterstitialAd = {
  createForAdRequest: () => {
    let closedHandler: (() => void) | null = null;

    return {
      load: () => {},
      show: () => {
        closedHandler?.();
        return Promise.resolve();
      },
      addAdEventListener: (type: string, handler: any) => {
        if (type === 'closed') {
          closedHandler = handler;
        } else if (type === 'loaded') {
          setTimeout(() => handler(), 50);
        }
        return () => {};
      },
    };
  },
};

export const NativeAd = {
  createForAdRequest: () =>
    Promise.resolve({
      destroy: () => {},
      headline: 'Test Ad Headline',
      body: 'Test Ad Body description text',
      advertiser: 'Test Advertiser',
      callToAction: 'Install',
      icon: { url: 'https://example.com/icon.png' },
    }),
};

export const NativeAdView = ({ children, style }: any) =>
  React.createElement(View, { style }, children);
export const NativeAsset = ({ children }: any) =>
  React.createElement(React.Fragment, null, children);

export const NativeAssetType = {
  HEADLINE: 'headline',
  BODY: 'body',
  CALL_TO_ACTION: 'callToAction',
  ADVERTISER: 'advertiser',
  ICON: 'icon',
  IMAGE: 'image',
};

export const NativeAdChoicesPlacement = {
  TOP_RIGHT: 'topRight',
  TOP_LEFT: 'topLeft',
  BOTTOM_RIGHT: 'bottomRight',
  BOTTOM_LEFT: 'bottomLeft',
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
  INTERSTITIAL: 'mock-interstitial-id',
  NATIVE: 'mock-native-id',
  BANNER: 'mock-banner-id',
};

export const AdsConsentStatus = {
  UNKNOWN: 'UNKNOWN',
  REQUIRED: 'REQUIRED',
  NOT_REQUIRED: 'NOT_REQUIRED',
  OBTAINED: 'OBTAINED',
};

export const AdsConsentDebugGeography = {
  DISABLED: 0,
  EEA: 1,
  NOT_EEA: 2,
};

export const AdsConsent = {
  requestInfoUpdate: () =>
    Promise.resolve({
      status: AdsConsentStatus.NOT_REQUIRED,
      isConsentFormAvailable: true,
    }),
  loadAndShowConsentFormIfRequired: () =>
    Promise.resolve({
      status: AdsConsentStatus.OBTAINED,
    }),
  showPrivacyOptionsForm: () =>
    Promise.resolve({
      status: AdsConsentStatus.OBTAINED,
    }),
  reset: () => Promise.resolve(),
};

// Default export mock (MobileAds initialization)
export default () => ({
  initialize: () => Promise.resolve(),
  setRequestConfiguration: () => Promise.resolve(),
});
