import React, { useState, useCallback } from 'react';
import {
  canStartQuiz,
  canWatchAdToday,
  getDailyCompletedQuizzesCount,
  getFreeDailyQuizzes,
} from '../services/usageService';
import { isPremiumEnabled } from '../services/premiumAccessService';
import { isNetworkConnected } from '../services/networkService';
import { trackEvent } from '../services/analyticsService';
import { DailyQuizLimitModal } from '../components/DailyQuizLimitModal/DailyQuizLimitModal';
import { OfflineLimitModal } from '../components/OfflineLimitModal/OfflineLimitModal';
import { PremiumSubscribeSheet } from '../components/PremiumSubscribeSheet/PremiumSubscribeSheet';
import { RootStackParamList } from '../types/navigation';
import { useFeatureFlag } from '../services/featuresService';

export type VerbQuizParams = RootStackParamList['VerbQuiz'];

export interface NavigationHandler {
  navigate: (screen: 'VerbQuiz', params: VerbQuizParams) => void;
  replace?: (screen: 'VerbQuiz', params: VerbQuizParams) => void;
}

export interface UseNavigateToQuizResult {
  navigateToQuiz: (params: VerbQuizParams, mode?: 'navigate' | 'replace') => void;
  dailyQuizLimitModalUI: React.ReactNode;
}

export function useNavigateToQuiz(navigation: NavigationHandler): UseNavigateToQuizResult {
  const isPremiumFeature = useFeatureFlag('ENABLE_PREMIUM');
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showOfflineModal, setShowOfflineModal] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallSource, setPaywallSource] = useState<'daily_quiz_limit' | 'offline_limit'>(
    'daily_quiz_limit',
  );
  const [pendingParams, setPendingParams] = useState<{
    params: VerbQuizParams;
    mode: 'navigate' | 'replace';
  } | null>(null);

  const startActualQuiz = useCallback(
    (params: VerbQuizParams, mode: 'navigate' | 'replace' = 'navigate') => {
      if (mode === 'replace' && typeof navigation.replace === 'function') {
        navigation.replace('VerbQuiz', params);
      } else {
        navigation.navigate('VerbQuiz', params);
      }
    },
    [navigation],
  );

  const navigateToQuiz = useCallback(
    async (params: VerbQuizParams, mode: 'navigate' | 'replace' = 'navigate') => {
      // 1. Premium users bypass all limits and offline checks
      if (isPremiumEnabled()) {
        startActualQuiz(params, mode);
        return;
      }

      // 2. Free users require an active internet connection
      const online = await isNetworkConnected();
      if (!online) {
        setPendingParams({ params, mode });
        setShowOfflineModal(true);
        return;
      }

      // 3. Check daily quiz quota
      if (canStartQuiz()) {
        startActualQuiz(params, mode);
      } else {
        setPendingParams({ params, mode });
        trackEvent('daily_limit_shown', {
          completed_today: getDailyCompletedQuizzesCount(),
          free_limit: getFreeDailyQuizzes(),
        });
        setShowLimitModal(true);
      }
    },
    [startActualQuiz],
  );

  const handleDismiss = useCallback(() => {
    setShowLimitModal(false);
    setPendingParams(null);
  }, []);

  const handleOfflineDismiss = useCallback(() => {
    setShowOfflineModal(false);
    setPendingParams(null);
  }, []);

  const handleOfflineRetry = useCallback(async () => {
    const online = await isNetworkConnected();
    if (online) {
      setShowOfflineModal(false);
      if (pendingParams) {
        const { params, mode } = pendingParams;
        setPendingParams(null);
        startActualQuiz(params, mode);
      }
    }
  }, [pendingParams, startActualQuiz]);

  const handlePremiumCTA = useCallback(() => {
    setShowLimitModal(false);
    setPaywallSource('daily_quiz_limit');
    setShowPaywall(true);
  }, []);

  const handleOfflinePremiumCTA = useCallback(() => {
    setShowOfflineModal(false);
    setPaywallSource('offline_limit');
    setShowPaywall(true);
  }, []);

  const handlePaywallClose = useCallback(() => {
    setShowPaywall(false);
    setPendingParams(null);
  }, []);

  const handlePurchaseSuccess = useCallback(() => {
    setShowPaywall(false);
    if (pendingParams) {
      startActualQuiz(pendingParams.params, pendingParams.mode);
      setPendingParams(null);
    }
  }, [pendingParams, startActualQuiz]);

  const handleVideoSuccess = useCallback(() => {
    setShowLimitModal(false);
    if (pendingParams) {
      startActualQuiz(pendingParams.params, pendingParams.mode);
      setPendingParams(null);
    }
  }, [pendingParams, startActualQuiz]);

  const dailyQuizLimitModalUI = (
    <>
      <DailyQuizLimitModal
        visible={showLimitModal}
        onDismiss={handleDismiss}
        onPremiumCTA={isPremiumFeature ? handlePremiumCTA : undefined}
        onVideoSuccess={handleVideoSuccess}
        canWatchAd={canWatchAdToday()}
      />
      <OfflineLimitModal
        visible={showOfflineModal}
        onDismiss={handleOfflineDismiss}
        onPremiumCTA={isPremiumFeature ? handleOfflinePremiumCTA : undefined}
        onRetry={handleOfflineRetry}
        onPurchaseSuccess={() => {
          setShowOfflineModal(false);
          if (pendingParams) {
            startActualQuiz(pendingParams.params, pendingParams.mode);
            setPendingParams(null);
          }
        }}
      />
      {isPremiumFeature && (
        <PremiumSubscribeSheet
          visible={showPaywall}
          onClose={handlePaywallClose}
          onPurchaseSuccess={handlePurchaseSuccess}
          source={paywallSource}
        />
      )}
    </>
  );

  return { navigateToQuiz, dailyQuizLimitModalUI };
}
