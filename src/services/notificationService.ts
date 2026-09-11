import * as Notifications from 'expo-notifications';
import { getSettings, getNativeLanguage } from './settingsService';
import { SupportedLocales } from '../types/intl';
import { getTranslations } from './intlService';
import { getStreakState, addStreakListener } from './streakService';

const REMINDER_IDENTIFIER = 'daily-practice-reminder';
const REMINDER_HOUR = 10;
const REMINDER_MINUTE = 0;

const STREAK_REMINDER_IDENTIFIER = 'streak-saver-reminder';
const STREAK_REMINDER_HOUR = 19;
const STREAK_REMINDER_MINUTE = 0;

const TRIAL_REMINDER_IDENTIFIER = 'trial-ending-reminder';

/**
 * Configures notification handler for foreground behavior.
 * Should be called once at app startup.
 */
export function configureNotifications(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

/**
 * Requests notification permissions from the user.
 * @returns true if permissions were granted
 */
export async function requestPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();

  if (existingStatus === 'granted') {
    return true;
  }

  const { status } = await Notifications.requestPermissionsAsync();

  return status === 'granted';
}

/**
 * Gets the notification content in the user's selected language.
 */
function getNotificationContent(locale: SupportedLocales): {
  title: string;
  body: string;
} {
  const translations = getTranslations(locale);
  const fallbackTitle = 'Time to practice!';
  const fallbackBody =
    'A quick session with German verbs and sentence structures will help you master them.';

  return {
    title: translations.notifications?.reminderTitle ?? fallbackTitle,
    body: translations.notifications?.reminderBody ?? fallbackBody,
  };
}

/**
 * Schedules a daily practice reminder notification at 10:00 AM.
 * Cancels any existing reminder before scheduling a new one.
 */
export async function scheduleDailyReminder(): Promise<void> {
  await cancelDailyReminder();

  const locale = getNativeLanguage() || 'en';
  const content = getNotificationContent(locale);

  await Notifications.scheduleNotificationAsync({
    identifier: REMINDER_IDENTIFIER,
    content: {
      title: content.title,
      body: content.body,
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: REMINDER_HOUR,
      minute: REMINDER_MINUTE,
    },
  });
}

/**
 * Cancels the daily practice reminder notification.
 */
export async function cancelDailyReminder(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(REMINDER_IDENTIFIER);
}

/**
 * Schedules an evening streak saver reminder at 7:00 PM local time.
 * If user already completed a quiz today or if it is past 7:00 PM today,
 * schedules for tomorrow at 7:00 PM so the OS maintains a queued reminder for un-opened days.
 */
export async function scheduleStreakReminder(isActiveTodayOverride?: boolean): Promise<void> {
  await cancelStreakReminder();

  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    return;
  }

  const isActiveToday =
    isActiveTodayOverride !== undefined ? isActiveTodayOverride : getStreakState().isActiveToday;
  const locale = getNativeLanguage() || 'en';
  const translations = getTranslations(locale);

  const fallbackStreakTitle = "Don't break your streak! 🔥";
  const fallbackStreakBody =
    "You haven't practiced today. Take a quick 2-minute quiz to keep your streak going!";

  const title = translations.notifications?.streakReminderTitle ?? fallbackStreakTitle;
  const body = translations.notifications?.streakReminderBody ?? fallbackStreakBody;

  const now = new Date();
  const targetDate = new Date();
  targetDate.setHours(STREAK_REMINDER_HOUR, STREAK_REMINDER_MINUTE, 0, 0);

  if (isActiveToday || now.getTime() >= targetDate.getTime()) {
    targetDate.setDate(targetDate.getDate() + 1);
  }

  await Notifications.scheduleNotificationAsync({
    identifier: STREAK_REMINDER_IDENTIFIER,
    content: {
      title,
      body,
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: targetDate,
    },
  });
}

/**
 * Cancels the streak saver reminder notification.
 */
export async function cancelStreakReminder(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(STREAK_REMINDER_IDENTIFIER);
}

/**
 * Schedules a trial reminder notification 48 hours after the trial starts.
 */
export async function scheduleTrialReminder(trialStartDateMs: number): Promise<void> {
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    return;
  }

  const locale = getNativeLanguage() || 'en';
  const translations = getTranslations(locale);

  const fallbackTrialTitle = 'Your free trial is ending soon';
  const fallbackTrialBody = 'Make the most of Premium today! Your trial ends in 24 hours.';

  const title = translations.notifications?.trialReminderTitle ?? fallbackTrialTitle;
  const body = translations.notifications?.trialReminderBody ?? fallbackTrialBody;

  // 48 hours = 48 * 60 * 60 * 1000 = 172800000 ms
  const targetDate = new Date(trialStartDateMs + 48 * 60 * 60 * 1000);

  if (targetDate.getTime() <= Date.now()) {
    return;
  }

  await Notifications.scheduleNotificationAsync({
    identifier: TRIAL_REMINDER_IDENTIFIER,
    content: {
      title,
      body,
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: targetDate,
    },
  });
}

/**
 * Initializes notifications on app start.
 * If notifications are enabled in settings, ensures the daily reminder and streak reminder are scheduled.
 */
export async function initializeNotifications(): Promise<void> {
  configureNotifications();

  // Automatically reschedule streak reminder when streak state changes
  addStreakListener(streakState => {
    scheduleStreakReminder(streakState.isActiveToday).catch(() => {});
  });

  const settings = getSettings();

  if (!settings.notifications) {
    return;
  }

  const hasPermission = await requestPermissions();

  if (!hasPermission) {
    return;
  }

  await scheduleDailyReminder();
  await scheduleStreakReminder();
}
