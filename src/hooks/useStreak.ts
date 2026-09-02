import { useState, useEffect } from 'react';
import { getStreakState, addStreakListener, StreakState } from '../services/streakService';

/**
 * Hook that reactively tracks streak status.
 * Automatically updates when streak changes.
 */
export function useStreak(): StreakState {
  const [streakState, setStreakState] = useState<StreakState>(getStreakState);

  useEffect(() => {
    return addStreakListener(setStreakState);
  }, []);

  return streakState;
}
