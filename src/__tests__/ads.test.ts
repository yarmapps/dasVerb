import { renderHook, act } from '@testing-library/react-native';
import { useRewardedAd } from '../ads/useRewardedAd';
import { ENABLE_ADS, REWARDED_AD_UNIT_ID } from '../ads/adConfig';

describe('Ads Module', () => {
  describe('adConfig', () => {
    it('should have valid ad config constants', () => {
      expect(typeof ENABLE_ADS).toBe('boolean');
      expect(REWARDED_AD_UNIT_ID).toBeDefined();
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
});
