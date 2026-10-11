import { useState, useEffect, useCallback } from 'react';
import {
  MonthlyRecapData,
  checkMonthlyRecap,
  markMonthlyRecapSeen,
} from '../services/leaderboardService';
import { soundService } from '../services/soundService';

export interface UseMonthlySummaryResult {
  recapData: MonthlyRecapData | null;
  isModalVisible: boolean;
  isLoading: boolean;
  closeModal: () => void;
  debugTriggerModal: (data: MonthlyRecapData) => void;
}

export function useMonthlySummary(enabled = true): UseMonthlySummaryResult {
  const [recapData, setRecapData] = useState<MonthlyRecapData | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    let isMounted = true;

    const runCheck = async () => {
      try {
        setIsLoading(true);
        const data = await checkMonthlyRecap();
        if (isMounted && data) {
          setRecapData(data);
          setIsModalVisible(true);
        }
      } catch (error) {
        if (__DEV__) {
          console.error('[useMonthlySummary] Error checking monthly recap:', error);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    runCheck();

    return () => {
      isMounted = false;
    };
  }, [enabled]);

  const closeModal = useCallback(() => {
    soundService.playTapSound();
    if (recapData?.yearMonth) {
      markMonthlyRecapSeen(recapData.yearMonth);
    }
    setIsModalVisible(false);
  }, [recapData]);

  const debugTriggerModal = useCallback((data: MonthlyRecapData) => {
    setRecapData(data);
    setIsModalVisible(true);
  }, []);

  return {
    recapData,
    isModalVisible,
    isLoading,
    closeModal,
    debugTriggerModal,
  };
}
