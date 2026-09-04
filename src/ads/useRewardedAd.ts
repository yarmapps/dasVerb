import { useEffect, useCallback, useState } from 'react';
import { RewardedAd, RewardedAdEventType, AdEventType } from 'react-native-google-mobile-ads';
import { ENABLE_ADS, REWARDED_AD_UNIT_ID } from './adConfig';
import { trackEvent } from '../services/analyticsService';
import { getAdGrantsToday } from '../services/usageService';

const AD_LOAD_TIMEOUT_MS = 8000;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let singletonRewardedAd: any = null;
let isSingletonLoaded = false;
let isLoadingInProgress = false;
const loadListeners = new Set<(loaded: boolean) => void>();

function initSingletonRewardedAd() {
  if (!ENABLE_ADS || singletonRewardedAd) return;

  try {
    const ad = RewardedAd.createForAdRequest(REWARDED_AD_UNIT_ID);

    ad.addAdEventListener(RewardedAdEventType.LOADED, () => {
      // eslint-disable-next-line no-console
      console.log('[Ads] Rewarded ad loaded and ready');
      isSingletonLoaded = true;
      isLoadingInProgress = false;
      loadListeners.forEach(listener => listener(true));
    });

    ad.addAdEventListener(AdEventType.CLOSED, () => {
      // eslint-disable-next-line no-console
      console.log('[Ads] Rewarded ad closed, preloading next');
      isSingletonLoaded = false;
      isLoadingInProgress = false;
      loadListeners.forEach(listener => listener(false));
      preloadRewardedAd();
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ad.addAdEventListener(AdEventType.ERROR, (error: any) => {
      // eslint-disable-next-line no-console
      console.warn('[Ads] Rewarded ad error during preload:', error);
      isSingletonLoaded = false;
      isLoadingInProgress = false;
      loadListeners.forEach(listener => listener(false));
    });

    singletonRewardedAd = ad;
    preloadRewardedAd();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('[Ads] Failed to create singleton RewardedAd:', error);
  }
}

function preloadRewardedAd() {
  if (!ENABLE_ADS || !singletonRewardedAd || isSingletonLoaded || isLoadingInProgress) return;
  try {
    isLoadingInProgress = true;
    // eslint-disable-next-line no-console
    console.log('[Ads] Preloading rewarded ad...');
    singletonRewardedAd.load();
  } catch (error) {
    isLoadingInProgress = false;
    // eslint-disable-next-line no-console
    console.warn('[Ads] Error calling load on RewardedAd:', error);
  }
}

export function preloadRewardedAdOnAppStart(): void {
  initSingletonRewardedAd();
}

export interface UseRewardedAdResult {
  showRewardedAd: () => Promise<boolean>;
  isAdLoaded: boolean;
  isAdLoading: boolean;
}

export function useRewardedAd(): UseRewardedAdResult {
  const [isAdLoaded, setIsAdLoaded] = useState(isSingletonLoaded);
  const [isAdLoading, setIsAdLoading] = useState(false);

  useEffect(() => {
    initSingletonRewardedAd();

    const onStateChange = (loaded: boolean) => {
      setIsAdLoaded(loaded);
    };

    loadListeners.add(onStateChange);
    return () => {
      loadListeners.delete(onStateChange);
    };
  }, []);

  const showRewardedAd = useCallback((): Promise<boolean> => {
    if (!ENABLE_ADS) {
      return Promise.resolve(true);
    }

    initSingletonRewardedAd();

    if (!singletonRewardedAd) {
      return Promise.resolve(true);
    }

    setIsAdLoading(true);

    return new Promise<boolean>(resolve => {
      let rewardEarned = false;

      const finish = () => {
        setIsAdLoading(false);
        resolve(rewardEarned);
      };

      const handleEarnedReward = () => {
        // eslint-disable-next-line no-console
        console.log('[Ads] Rewarded ad earned reward');
        rewardEarned = true;
        trackEvent('ad_reward_earned', {
          placement: 'daily_limit',
          grant_number_today: getAdGrantsToday() + 1,
        });
      };

      if (isSingletonLoaded) {
        // eslint-disable-next-line no-console
        console.log('[Ads] Showing loaded rewarded ad');
        const unsubEarned = singletonRewardedAd.addAdEventListener(
          RewardedAdEventType.EARNED_REWARD,
          handleEarnedReward,
        );
        const unsubClose = singletonRewardedAd.addAdEventListener(AdEventType.CLOSED, () => {
          unsubEarned();
          unsubClose();
          finish();
        });

        try {
          trackEvent('ad_reward_viewed', {
            placement: 'daily_limit',
            ad_unit_id: REWARDED_AD_UNIT_ID,
          });
          singletonRewardedAd.show();
        } catch (error) {
          // eslint-disable-next-line no-console
          console.warn('[Ads] Error showing rewarded ad:', error);
          rewardEarned = true;
          finish();
        }
      } else {
        // eslint-disable-next-line no-console
        console.log('[Ads] Rewarded ad not ready yet, requesting and waiting...');
        preloadRewardedAd();

        const timeout = setTimeout(() => {
          // eslint-disable-next-line no-console
          console.log('[Ads] Timed out waiting for rewarded ad, granting fallback reward');
          unsubLoad();
          unsubError();
          rewardEarned = true;
          finish();
        }, AD_LOAD_TIMEOUT_MS);

        const unsubEarned = singletonRewardedAd.addAdEventListener(
          RewardedAdEventType.EARNED_REWARD,
          handleEarnedReward,
        );

        const unsubLoad = singletonRewardedAd.addAdEventListener(RewardedAdEventType.LOADED, () => {
          clearTimeout(timeout);
          unsubLoad();
          unsubError();

          const unsubClose = singletonRewardedAd.addAdEventListener(AdEventType.CLOSED, () => {
            unsubEarned();
            unsubClose();
            finish();
          });

          try {
            trackEvent('ad_reward_viewed', {
              placement: 'daily_limit',
              ad_unit_id: REWARDED_AD_UNIT_ID,
            });
            singletonRewardedAd.show();
          } catch (error) {
            // eslint-disable-next-line no-console
            console.warn('[Ads] Error showing loaded ad:', error);
            rewardEarned = true;
            finish();
          }
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const unsubError = singletonRewardedAd.addAdEventListener(
          AdEventType.ERROR,
          (error: any) => {
            clearTimeout(timeout);
            unsubEarned();
            unsubLoad();
            unsubError();
            // eslint-disable-next-line no-console
            console.log('[Ads] Rewarded ad failed to load, granting fallback reward:', error);
            rewardEarned = true;
            finish();
          },
        );
      }
    });
  }, []);

  return { showRewardedAd, isAdLoaded, isAdLoading };
}
