import { useState, useEffect } from 'react';
import { isPremiumEnabled, addPremiumListener } from '../services/premiumAccessService';

/**
 * Hook that reactively tracks premium status across the app.
 * Automatically triggers re-render when premium status changes (purchase, restore, expiry).
 */
export function usePremiumStatus(): boolean {
  const [isPremium, setIsPremium] = useState<boolean>(isPremiumEnabled());

  useEffect(() => {
    // Subscribe to changes
    return addPremiumListener(setIsPremium);
  }, []);

  return isPremium;
}
