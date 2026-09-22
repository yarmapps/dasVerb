import { Platform, Linking } from 'react-native';
import * as StoreReview from 'expo-store-review';
import { getSettings, updateSettings } from './settingsService';
import { VerbProgressStatus } from './progressService';
import { trackEvent } from './analyticsService';

export const MIN_QUIZZES_BEFORE_PROMPT = 5;
export const MIN_DAYS_BETWEEN_PROMPTS = 5;

export function getDaysSinceLastPrompt(lastDate: string | null): number {
  if (!lastDate) {
    return Infinity;
  }

  const differenceMilliseconds = Date.now() - new Date(lastDate).getTime();
  const differenceDays = differenceMilliseconds / (1000 * 60 * 60 * 24);

  return differenceDays;
}

/**
 * Attempts to request an app store review after a positive quiz result.
 * Only prompts if:
 * - The user has completed at least 5 quizzes (successful OR failed)
 * - The completion status for the CURRENT quiz is silver or trophy (prompt on success)
 * - At least 5 days have passed since the last review prompt
 *
 * The OS ultimately decides whether to show the review dialog.
 */
export async function tryRequestReview(status: VerbProgressStatus): Promise<boolean> {
  const settings = getSettings();

  // 1. Always increment completed quiz count (for EVERY quiz)
  const completedQuizCount = (settings.completedQuizCount || 0) + 1;
  updateSettings({ completedQuizCount });

  // 2. Only prompt on positive outcomes (silver or trophy / score >= 80%)
  if (status !== 'silver' && status !== 'trophy') {
    return false;
  }

  // 3. Ensure enough engagement before prompting (Threshold: 5 quizzes)
  if (completedQuizCount < MIN_QUIZZES_BEFORE_PROMPT) {
    return false;
  }

  // 4. Respect cooldown period between prompts (5 days)
  const daysSinceLastPrompt = getDaysSinceLastPrompt(settings.lastReviewPromptDate);
  if (daysSinceLastPrompt < MIN_DAYS_BETWEEN_PROMPTS) {
    return false;
  }

  // 5. Check if the device supports in-app review
  const isAvailable = await StoreReview.isAvailableAsync();
  if (!isAvailable) {
    return false;
  }

  // 6. Request review — the OS decides whether to actually show it
  trackEvent('rating_popup_shown', {});
  await StoreReview.requestReview();
  updateSettings({
    lastReviewPromptDate: new Date().toISOString(),
  });

  return true;
}

/**
 * Force trigger store review request for testing/debug purposes.
 */
export async function forceRequestReview(): Promise<boolean> {
  const isAvailable = await StoreReview.isAvailableAsync();
  if (!isAvailable) {
    return false;
  }

  trackEvent('rating_popup_shown', {});
  await StoreReview.requestReview();
  updateSettings({
    lastReviewPromptDate: new Date().toISOString(),
  });

  return true;
}

/**
 * Manually trigger app review from settings ("Rate Your App").
 * Attempts in-app review prompt first, then falls back to direct App Store / Play Store page.
 */
export async function openStoreReviewPage(): Promise<void> {
  trackEvent('settings_rate_app_clicked', {});

  try {
    const isAvailable = await StoreReview.isAvailableAsync();
    if (isAvailable && (await StoreReview.hasAction())) {
      await StoreReview.requestReview();
      return;
    }
  } catch (error) {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.warn('[reviewService] In-app review request failed, opening store URL:', error);
    }
  }

  try {
    const isIos = Platform.OS === 'ios';
    if (isIos) {
      const appStoreUrl = 'https://apps.apple.com/app/id6807915857?action=write-review';
      await Linking.openURL(appStoreUrl);
    } else {
      const playMarketUrl = 'market://details?id=com.yarm.apps.dasverb';
      const playWebUrl = 'https://play.google.com/store/apps/details?id=com.yarm.apps.dasverb';
      const canOpen = await Linking.canOpenURL(playMarketUrl).catch(() => false);
      if (canOpen) {
        await Linking.openURL(playMarketUrl);
      } else {
        await Linking.openURL(playWebUrl);
      }
    }
  } catch (error) {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.warn('[reviewService] Failed to open store URL:', error);
    }
  }
}
