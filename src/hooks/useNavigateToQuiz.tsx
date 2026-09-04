import React, { useState, useCallback } from 'react';
import {
  canStartQuiz,
  canWatchAdToday,
  getDailyCompletedQuizzesCount,
  getFreeDailyQuizzes,
} from '../services/usageService';
import { isPremiumEnabled } from '../services/premiumAccessService';
import { trackEvent } from '../services/analyticsService';
import { DailyQuizLimitModal } from '../components/DailyQuizLimitModal/DailyQuizLimitModal';
import { PremiumSubscribeSheet } from '../components/PremiumSubscribeSheet/PremiumSubscribeSheet';
import { RootStackParamList } from '../types/navigation';

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
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
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
    (params: VerbQuizParams, mode: 'navigate' | 'replace' = 'navigate') => {
      if (isPremiumEnabled() || canStartQuiz()) {
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

  const handlePremiumCTA = useCallback(() => {
    setShowLimitModal(false);
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
        onPremiumCTA={handlePremiumCTA}
        onVideoSuccess={handleVideoSuccess}
        canWatchAd={canWatchAdToday()}
      />
      <PremiumSubscribeSheet
        visible={showPaywall}
        onClose={handlePaywallClose}
        onPurchaseSuccess={handlePurchaseSuccess}
        source="daily_quiz_limit"
      />
    </>
  );

  return { navigateToQuiz, dailyQuizLimitModalUI };
}
