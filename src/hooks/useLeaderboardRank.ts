import { useState, useEffect } from 'react';
import {
  getStoredUserMonthlyRank,
  addRankListener,
  getUserMonthlyRank,
} from '../services/leaderboardService';

export function useLeaderboardRank(): { rank: number | null; isRanked: boolean } {
  const [rank, setRank] = useState<number | null>(getStoredUserMonthlyRank());

  useEffect(() => {
    // Initial fetch to ensure fresh rank
    getUserMonthlyRank().then(info => {
      if (info) {
        setRank(info.rank);
      }
    });

    const unsubscribe = addRankListener(newRank => {
      setRank(newRank);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return {
    rank,
    isRanked: rank !== null && rank > 0,
  };
}
