import React from 'react';
import { render, renderHook, act } from '@testing-library/react-native';
import { useRewardedAd } from '../ads/useRewardedAd';
import { adManager } from '../ads/adManager';
import { adConsentService } from '../ads/consentService';
import {
  ENABLE_ADS,
  REWARDED_AD_UNIT_ID,
  INTERSTITIAL_AD_UNIT_ID,
  NATIVE_AD_UNIT_ID,
} from '../ads/adConfig';
import { PracticeNativeAdCard } from '../components/PracticeNativeAdCard/PracticeNativeAdCard';
import { DictionaryNativeAdCard } from '../components/DictionaryNativeAdCard/DictionaryNativeAdCard';
import * as appConfigService from '../services/appConfigService';
import { darkColors } from '../styles/themeColors';

describe('Ads Module', () => {
  describe('adConfig', () => {
    it('should have valid ad config constants', () => {
      expect(typeof ENABLE_ADS).toBe('boolean');
      expect(REWARDED_AD_UNIT_ID).toBeDefined();
      expect(INTERSTITIAL_AD_UNIT_ID).toBeDefined();
      expect(NATIVE_AD_UNIT_ID).toBeDefined();
    });
  });

  describe('AdManager', () => {
    it('should initialize and preload ads without throwing', () => {
      expect(() => adManager.init()).not.toThrow();
    });

    it('should show rewarded or fallback ad and return boolean', async () => {
      const result = await adManager.showRewardedOrFallback();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('useRewardedAd', () => {
    it('should return showRewardedAd function and states', () => {
      const { result } = renderHook(() => useRewardedAd());
      expect(typeof result.current.showRewardedAd).toBe('function');
      expect(typeof result.current.isAdLoaded).toBe('boolean');
      expect(typeof result.current.isAdLoading).toBe('boolean');
    });

    it('should execute showRewardedAd and return boolean reward result', async () => {
      const { result } = renderHook(() => useRewardedAd());
      await act(async () => {
        const rewardEarned = await result.current.showRewardedAd();
        expect(typeof rewardEarned).toBe('boolean');
      });
    });
  });

  describe('AdConsentService', () => {
    it('should initialize consent flow without throwing', async () => {
      await expect(adConsentService.initialize()).resolves.not.toThrow();
    });

    it('should show privacy options form', async () => {
      await expect(adConsentService.showPrivacyOptions()).resolves.not.toThrow();
    });

    it('should reset consent state without throwing', async () => {
      await expect(adConsentService.reset()).resolves.not.toThrow();
    });
  });

  describe('PracticeNativeAdCard', () => {
    it('should return null when isPracticeNativeAdEnabled is false', () => {
      jest.spyOn(appConfigService, 'isPracticeNativeAdEnabled').mockReturnValue(false);

      const { queryByTestId } = render(
        <PracticeNativeAdCard isPremium={false} colors={darkColors} isDark={true} />,
      );

      expect(queryByTestId('practice-native-ad-card')).toBeNull();
    });

    it('should return null when user is premium', () => {
      jest.spyOn(appConfigService, 'isPracticeNativeAdEnabled').mockReturnValue(true);

      const { queryByTestId } = render(
        <PracticeNativeAdCard isPremium={true} colors={darkColors} isDark={true} />,
      );

      expect(queryByTestId('practice-native-ad-card')).toBeNull();
    });
  });

  describe('DictionaryNativeAdCard', () => {
    it('should return null when isDictionaryNativeAdEnabled is false', () => {
      jest.spyOn(appConfigService, 'isDictionaryNativeAdEnabled').mockReturnValue(false);

      const { queryByTestId } = render(
        <DictionaryNativeAdCard isPremium={false} colors={darkColors} isDark={true} />,
      );

      expect(queryByTestId('dictionary-native-ad-card')).toBeNull();
    });

    it('should return null when user is premium', () => {
      jest.spyOn(appConfigService, 'isDictionaryNativeAdEnabled').mockReturnValue(true);

      const { queryByTestId } = render(
        <DictionaryNativeAdCard isPremium={true} colors={darkColors} isDark={true} />,
      );

      expect(queryByTestId('dictionary-native-ad-card')).toBeNull();
    });
  });
});
