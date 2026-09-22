import {
  RewardedAd,
  RewardedAdEventType,
  InterstitialAd,
  AdEventType,
} from 'react-native-google-mobile-ads';
import { ENABLE_ADS, REWARDED_AD_UNIT_ID, INTERSTITIAL_AD_UNIT_ID } from './adConfig';
import { isPremiumEnabled } from '../services/premiumAccessService';
import { trackCustomEvent } from '../services/analyticsService';

const FALLBACK_TIMEOUT_MS = 8000;

export class AdManager {
  private rewardedAd: RewardedAd | null = null;
  private isRewardedLoaded = false;
  private isRewardedLoading = false;
  private unsubRewardedLoaded: (() => void) | null = null;
  private unsubRewardedClosed: (() => void) | null = null;
  private unsubRewardedError: (() => void) | null = null;

  private interstitialAd: InterstitialAd | null = null;
  private isInterstitialLoaded = false;
  private isInterstitialLoading = false;
  private unsubInterstitialLoaded: (() => void) | null = null;
  private unsubInterstitialClosed: (() => void) | null = null;
  private unsubInterstitialError: (() => void) | null = null;

  private isInitialized = false;

  public init(): void {
    if (!ENABLE_ADS || isPremiumEnabled()) {
      return;
    }
    if (this.isInitialized) {
      return;
    }
    this.isInitialized = true;
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.log('[AdManager] Initializing background ads...');
    }
    this.preloadRewardedAd();
    this.preloadInterstitialAd();
  }

  public preloadRewardedAd(): void {
    if (!ENABLE_ADS || isPremiumEnabled() || this.isRewardedLoading || this.isRewardedLoaded) {
      return;
    }

    this.cleanupRewardedListeners();
    this.isRewardedLoading = true;

    try {
      const ad = RewardedAd.createForAdRequest(REWARDED_AD_UNIT_ID);

      this.unsubRewardedLoaded = ad.addAdEventListener(RewardedAdEventType.LOADED, () => {
        if (__DEV__) {
          // eslint-disable-next-line no-console
          console.log('[AdManager] Rewarded ad loaded');
        }
        this.isRewardedLoaded = true;
        this.isRewardedLoading = false;
      });

      this.unsubRewardedClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
        if (__DEV__) {
          // eslint-disable-next-line no-console
          console.log('[AdManager] Rewarded ad closed, preloading next');
        }
        this.isRewardedLoaded = false;
        this.preloadRewardedAd();
      });

      this.unsubRewardedError = ad.addAdEventListener(
        AdEventType.ERROR,
        (error: { message?: string }) => {
          if (__DEV__) {
            // eslint-disable-next-line no-console
            console.warn('[AdManager] Rewarded ad failed to load:', error);
          }
          trackCustomEvent('ad_load_error', {
            type: 'rewarded',
            message: error?.message || 'unknown',
          });
          this.isRewardedLoaded = false;
          this.isRewardedLoading = false;
        },
      );

      this.rewardedAd = ad;
      ad.load();
    } catch (error) {
      this.isRewardedLoading = false;
      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.warn('[AdManager] Error creating/loading rewarded ad:', error);
      }
    }
  }

  public preloadInterstitialAd(): void {
    if (
      !ENABLE_ADS ||
      isPremiumEnabled() ||
      this.isInterstitialLoading ||
      this.isInterstitialLoaded
    ) {
      return;
    }

    this.cleanupInterstitialListeners();
    this.isInterstitialLoading = true;

    try {
      const ad = InterstitialAd.createForAdRequest(INTERSTITIAL_AD_UNIT_ID);

      this.unsubInterstitialLoaded = ad.addAdEventListener(AdEventType.LOADED, () => {
        if (__DEV__) {
          // eslint-disable-next-line no-console
          console.log('[AdManager] Interstitial ad loaded');
        }
        this.isInterstitialLoaded = true;
        this.isInterstitialLoading = false;
      });

      this.unsubInterstitialClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
        if (__DEV__) {
          // eslint-disable-next-line no-console
          console.log('[AdManager] Interstitial ad closed, preloading next');
        }
        this.isInterstitialLoaded = false;
        this.preloadInterstitialAd();
      });

      this.unsubInterstitialError = ad.addAdEventListener(
        AdEventType.ERROR,
        (error: { message?: string }) => {
          if (__DEV__) {
            // eslint-disable-next-line no-console
            console.warn('[AdManager] Interstitial ad failed to load:', error);
          }
          trackCustomEvent('ad_load_error', {
            type: 'interstitial',
            message: error?.message || 'unknown',
          });
          this.isInterstitialLoaded = false;
          this.isInterstitialLoading = false;
        },
      );

      this.interstitialAd = ad;
      ad.load();
    } catch (error) {
      this.isInterstitialLoading = false;
      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.warn('[AdManager] Error creating/loading interstitial ad:', error);
      }
    }
  }

  private cleanupRewardedListeners(): void {
    this.unsubRewardedLoaded?.();
    this.unsubRewardedClosed?.();
    this.unsubRewardedError?.();
    this.unsubRewardedLoaded = null;
    this.unsubRewardedClosed = null;
    this.unsubRewardedError = null;
  }

  private cleanupInterstitialListeners(): void {
    this.unsubInterstitialLoaded?.();
    this.unsubInterstitialClosed?.();
    this.unsubInterstitialError?.();
    this.unsubInterstitialLoaded = null;
    this.unsubInterstitialClosed = null;
    this.unsubInterstitialError = null;
  }

  private showLoadedRewarded(): Promise<boolean> {
    const ad = this.rewardedAd;
    if (!ad) {
      return Promise.resolve(false);
    }

    return new Promise<boolean>(resolve => {
      let rewardEarned = false;

      const unsubEarned = ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
        if (__DEV__) {
          // eslint-disable-next-line no-console
          console.log('[AdManager] Rewarded ad earned reward');
        }
        rewardEarned = true;
      });

      const unsubClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
        unsubEarned();
        unsubClosed();
        trackCustomEvent('ad_rewarded_shown', {});
        this.isRewardedLoaded = false;
        this.preloadRewardedAd();
        resolve(rewardEarned);
      });

      ad.show().catch(err => {
        if (__DEV__) {
          // eslint-disable-next-line no-console
          console.warn('[AdManager] Error showing rewarded ad:', err);
        }
        unsubEarned();
        unsubClosed();
        this.isRewardedLoaded = false;
        resolve(false);
      });
    });
  }

  private showLoadedInterstitial(): Promise<boolean> {
    const ad = this.interstitialAd;
    if (!ad) {
      return Promise.resolve(false);
    }

    return new Promise<boolean>(resolve => {
      const unsubClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
        unsubClosed();
        trackCustomEvent('ad_interstitial_fallback_shown', {});
        this.isInterstitialLoaded = false;
        this.preloadInterstitialAd();
        resolve(true);
      });

      ad.show().catch(err => {
        if (__DEV__) {
          // eslint-disable-next-line no-console
          console.warn('[AdManager] Error showing interstitial ad:', err);
        }
        unsubClosed();
        this.isInterstitialLoaded = false;
        resolve(false);
      });
    });
  }

  /**
   * Shows a rewarded ad. If unavailable, cascades to an interstitial ad.
   * If both are unavailable within FALLBACK_TIMEOUT_MS, grants grace access and logs ad_no_fill.
   */
  public async showRewardedOrFallback(): Promise<boolean> {
    if (!ENABLE_ADS || isPremiumEnabled()) {
      return true;
    }

    // 1. If Rewarded ad is ready, show it
    if (this.isRewardedLoaded && this.rewardedAd) {
      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.log('[AdManager] Showing preloaded rewarded ad');
      }
      return this.showLoadedRewarded();
    }

    // 2. If Interstitial ad is ready, show fallback
    if (this.isInterstitialLoaded && this.interstitialAd) {
      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.log('[AdManager] Rewarded not ready, showing fallback interstitial');
      }
      return this.showLoadedInterstitial();
    }

    // 3. Neither ready -> ensure both are loading, wait up to FALLBACK_TIMEOUT_MS
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.log('[AdManager] No ad ready, waiting up to 8s for ad to load...');
    }
    this.preloadRewardedAd();
    this.preloadInterstitialAd();

    return new Promise<boolean>(resolve => {
      let isSettled = false;
      let timer: ReturnType<typeof setTimeout> | null = null;
      let unsubRew: (() => void) | null = null;
      let unsubInt: (() => void) | null = null;

      const cleanup = () => {
        if (timer) clearTimeout(timer);
        unsubRew?.();
        unsubInt?.();
      };

      const handleTimeoutOrError = () => {
        if (isSettled) return;
        isSettled = true;
        cleanup();
        if (__DEV__) {
          // eslint-disable-next-line no-console
          console.log('[AdManager] No ads filled within timeout. Granting grace access.');
        }
        trackCustomEvent('ad_no_fill', { reason: 'timeout_or_error' });
        resolve(true);
      };

      timer = setTimeout(handleTimeoutOrError, FALLBACK_TIMEOUT_MS);

      if (this.rewardedAd) {
        unsubRew = this.rewardedAd.addAdEventListener(RewardedAdEventType.LOADED, async () => {
          if (isSettled) return;
          isSettled = true;
          cleanup();
          this.isRewardedLoaded = true;
          if (__DEV__) {
            // eslint-disable-next-line no-console
            console.log('[AdManager] Rewarded ad loaded within timeout, showing');
          }
          const result = await this.showLoadedRewarded();
          resolve(result);
        });
      }

      if (this.interstitialAd) {
        unsubInt = this.interstitialAd.addAdEventListener(AdEventType.LOADED, async () => {
          if (isSettled) return;
          isSettled = true;
          cleanup();
          this.isInterstitialLoaded = true;
          if (__DEV__) {
            // eslint-disable-next-line no-console
            console.log('[AdManager] Interstitial ad loaded within timeout, showing');
          }
          const result = await this.showLoadedInterstitial();
          resolve(result);
        });
      }
    });
  }
}

export const adManager = new AdManager();
