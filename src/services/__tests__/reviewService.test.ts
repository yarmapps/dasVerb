import * as StoreReview from 'expo-store-review';
import {
  tryRequestReview,
  forceRequestReview,
  getDaysSinceLastPrompt,
  MIN_QUIZZES_BEFORE_PROMPT,
  MIN_DAYS_BETWEEN_PROMPTS,
} from '../reviewService';
import { getSettings, updateSettings } from '../settingsService';
import { trackEvent } from '../analyticsService';

jest.mock('expo-store-review', () => ({
  isAvailableAsync: jest.fn(),
  requestReview: jest.fn(),
}));

jest.mock('../analyticsService', () => ({
  trackEvent: jest.fn(),
}));

describe('reviewService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    updateSettings({
      completedQuizCount: 0,
      lastReviewPromptDate: null,
    });
    (StoreReview.isAvailableAsync as jest.Mock).mockResolvedValue(true);
    (StoreReview.requestReview as jest.Mock).mockResolvedValue(undefined);
  });

  describe('getDaysSinceLastPrompt', () => {
    it('should return Infinity if lastDate is null', () => {
      expect(getDaysSinceLastPrompt(null)).toBe(Infinity);
    });

    it('should return correct number of days for past date', () => {
      const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();
      const days = getDaysSinceLastPrompt(fiveDaysAgo);
      expect(Math.round(days)).toBe(5);
    });
  });

  describe('tryRequestReview', () => {
    it('should always increment completedQuizCount regardless of status', async () => {
      expect(getSettings().completedQuizCount).toBe(0);

      await tryRequestReview('uncompleted');
      expect(getSettings().completedQuizCount).toBe(1);

      await tryRequestReview('bronze');
      expect(getSettings().completedQuizCount).toBe(2);
    });

    it('should not request review if status is uncompleted or bronze', async () => {
      updateSettings({ completedQuizCount: MIN_QUIZZES_BEFORE_PROMPT });

      const resultUncompleted = await tryRequestReview('uncompleted');
      expect(resultUncompleted).toBe(false);
      expect(StoreReview.requestReview).not.toHaveBeenCalled();

      const resultBronze = await tryRequestReview('bronze');
      expect(resultBronze).toBe(false);
      expect(StoreReview.requestReview).not.toHaveBeenCalled();
    });

    it('should not request review if completedQuizCount < 5', async () => {
      updateSettings({ completedQuizCount: 2 });

      const result = await tryRequestReview('silver');
      expect(result).toBe(false);
      expect(StoreReview.requestReview).not.toHaveBeenCalled();
    });

    it('should not request review if cooldown period has not elapsed', async () => {
      const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
      updateSettings({
        completedQuizCount: MIN_QUIZZES_BEFORE_PROMPT,
        lastReviewPromptDate: twoDaysAgo,
      });

      const result = await tryRequestReview('silver');
      expect(result).toBe(false);
      expect(StoreReview.requestReview).not.toHaveBeenCalled();
    });

    it('should not request review if StoreReview is not available on device', async () => {
      (StoreReview.isAvailableAsync as jest.Mock).mockResolvedValue(false);
      updateSettings({
        completedQuizCount: MIN_QUIZZES_BEFORE_PROMPT - 1,
        lastReviewPromptDate: null,
      });

      const result = await tryRequestReview('silver');
      expect(result).toBe(false);
      expect(StoreReview.requestReview).not.toHaveBeenCalled();
    });

    it('should successfully request review and set cooldown date on positive outcome with >= 5 quizzes', async () => {
      updateSettings({
        completedQuizCount: MIN_QUIZZES_BEFORE_PROMPT - 1,
        lastReviewPromptDate: null,
      });

      const result = await tryRequestReview('trophy');
      expect(result).toBe(true);
      expect(StoreReview.requestReview).toHaveBeenCalledTimes(1);
      expect(trackEvent).toHaveBeenCalledWith('rating_popup_shown', {});
      expect(getSettings().lastReviewPromptDate).not.toBeNull();
    });

    it('should request review if past cooldown date (e.g. >= 5 days ago)', async () => {
      const sixDaysAgo = new Date(
        Date.now() - (MIN_DAYS_BETWEEN_PROMPTS + 1) * 24 * 60 * 60 * 1000,
      ).toISOString();
      updateSettings({
        completedQuizCount: MIN_QUIZZES_BEFORE_PROMPT,
        lastReviewPromptDate: sixDaysAgo,
      });

      const result = await tryRequestReview('silver');
      expect(result).toBe(true);
      expect(StoreReview.requestReview).toHaveBeenCalledTimes(1);
      expect(trackEvent).toHaveBeenCalledWith('rating_popup_shown', {});
    });
  });

  describe('forceRequestReview', () => {
    it('should request review when available and track event', async () => {
      const result = await forceRequestReview();
      expect(result).toBe(true);
      expect(StoreReview.requestReview).toHaveBeenCalledTimes(1);
      expect(trackEvent).toHaveBeenCalledWith('rating_popup_shown', {});
      expect(getSettings().lastReviewPromptDate).not.toBeNull();
    });

    it('should return false when StoreReview is not available', async () => {
      (StoreReview.isAvailableAsync as jest.Mock).mockResolvedValue(false);
      const result = await forceRequestReview();
      expect(result).toBe(false);
      expect(StoreReview.requestReview).not.toHaveBeenCalled();
    });
  });
});
