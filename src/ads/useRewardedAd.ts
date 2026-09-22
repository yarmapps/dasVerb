import { useCallback, useState, useEffect } from 'react';
import { adManager } from './adManager';
import { trackEvent } from '../services/analyticsService';
import { getAdGrantsToday } from '../services/usageService';

export function preloadRewardedAdOnAppStart(): void {
  adManager.init();
}

export interface UseRewardedAdResult {
  showRewardedAd: () => Promise<boolean>;
  isAdLoaded: boolean;
  isAdLoading: boolean;
}

export function useRewardedAd(): UseRewardedAdResult {
  const [isAdLoading, setIsAdLoading] = useState(false);

  useEffect(() => {
    adManager.init();
  }, []);

  const showRewardedAd = useCallback(async (): Promise<boolean> => {
    setIsAdLoading(true);
    try {
      const rewardEarned = await adManager.showRewardedOrFallback();
      if (rewardEarned) {
        trackEvent('ad_reward_earned', {
          placement: 'daily_limit',
          grant_number_today: getAdGrantsToday() + 1,
        });
      }
      return rewardEarned;
    } finally {
      setIsAdLoading(false);
    }
  }, []);

  return {
    showRewardedAd,
    isAdLoaded: true,
    isAdLoading,
  };
}
