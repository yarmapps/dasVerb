import * as Notifications from 'expo-notifications';
import {
  configureNotifications,
  requestPermissions,
  scheduleDailyReminder,
  cancelDailyReminder,
  scheduleStreakReminder,
  cancelStreakReminder,
  scheduleTrialReminder,
  initializeNotifications,
} from '../notificationService';
import * as settingsService from '../settingsService';
import * as streakService from '../streakService';

describe('notificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('configureNotifications', () => {
    it('sets the notification handler with correct foreground presentation', () => {
      configureNotifications();
      expect(Notifications.setNotificationHandler).toHaveBeenCalledTimes(1);
    });
  });

  describe('requestPermissions', () => {
    it('returns true when permissions are already granted', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        status: 'granted',
      });

      const result = await requestPermissions();
      expect(result).toBe(true);
      expect(Notifications.requestPermissionsAsync).not.toHaveBeenCalled();
    });

    it('requests permissions if not already granted', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        status: 'undetermined',
      });
      (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        status: 'granted',
      });

      const result = await requestPermissions();
      expect(result).toBe(true);
      expect(Notifications.requestPermissionsAsync).toHaveBeenCalledTimes(1);
    });

    it('returns false when permissions are denied', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        status: 'undetermined',
      });
      (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        status: 'denied',
      });

      const result = await requestPermissions();
      expect(result).toBe(false);
    });
  });

  describe('scheduleDailyReminder', () => {
    it('cancels existing reminder and schedules a new daily reminder at 10:00 AM', async () => {
      await scheduleDailyReminder();

      expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith(
        'daily-practice-reminder',
      );
      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        identifier: 'daily-practice-reminder',
        content: expect.objectContaining({
          title: expect.any(String),
          body: expect.any(String),
          sound: true,
        }),
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: 10,
          minute: 0,
        },
      });
    });
  });

  describe('cancelDailyReminder', () => {
    it('cancels the daily reminder notification', async () => {
      await cancelDailyReminder();
      expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith(
        'daily-practice-reminder',
      );
    });
  });

  describe('scheduleStreakReminder', () => {
    it('does not schedule if permissions are not granted', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        status: 'denied',
      });

      await scheduleStreakReminder();
      expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
    });

    it('schedules streak reminder with date trigger when permissions are granted', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        status: 'granted',
      });
      jest.spyOn(streakService, 'getStreakState').mockReturnValueOnce({
        currentStreak: 2,
        bestStreak: 5,
        lastActiveDate: '2026-09-05',
        isActiveToday: false,
      });

      await scheduleStreakReminder();

      expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith(
        'streak-saver-reminder',
      );
      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        identifier: 'streak-saver-reminder',
        content: expect.objectContaining({
          sound: true,
        }),
        trigger: expect.objectContaining({
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: expect.any(Date),
        }),
      });
    });
  });

  describe('cancelStreakReminder', () => {
    it('cancels the streak reminder notification', async () => {
      await cancelStreakReminder();
      expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith(
        'streak-saver-reminder',
      );
    });
  });

  describe('scheduleTrialReminder', () => {
    it('schedules trial reminder 48 hours after trial start date', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        status: 'granted',
      });

      const now = Date.now();
      await scheduleTrialReminder(now);

      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        identifier: 'trial-ending-reminder',
        content: expect.objectContaining({
          sound: true,
        }),
        trigger: expect.objectContaining({
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: expect.any(Date),
        }),
      });
    });

    it('does not schedule if target date is in the past', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        status: 'granted',
      });

      const longAgo = Date.now() - 50 * 60 * 60 * 1000;
      await scheduleTrialReminder(longAgo);

      expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
    });
  });

  describe('initializeNotifications', () => {
    it('does not schedule if notifications are disabled in settings', async () => {
      jest.spyOn(settingsService, 'getSettings').mockReturnValueOnce({
        soundEffects: true,
        notifications: false,
        themeMode: 'system',
        speakOnCorrectAnswer: true,
        ttsVoiceGender: 'male',
        completedQuizCount: 0,
        lastReviewPromptDate: null,
      });

      await initializeNotifications();

      expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
    });

    it('schedules reminders when notifications are enabled and permissions granted', async () => {
      jest.spyOn(settingsService, 'getSettings').mockReturnValueOnce({
        soundEffects: true,
        notifications: true,
        themeMode: 'system',
        speakOnCorrectAnswer: true,
        ttsVoiceGender: 'male',
        completedQuizCount: 0,
        lastReviewPromptDate: null,
      });
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });

      await initializeNotifications();

      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalled();
    });
  });
});
