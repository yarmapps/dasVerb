import { Platform } from 'react-native';
import Purchases from 'react-native-purchases';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from '@react-native-firebase/firestore';
import { createStorage } from './storageService';
import { progressService, VerbProgress, SentenceProgressStats } from './progressService';
import { SupportedLocales } from '../types/intl';
import { getStreakState, setStreakState, StreakState } from './streakService';
import {
  getSettings,
  updateSettings,
  getNativeLanguage,
  updateLanguageSettings,
  AppSettings,
} from './settingsService';
import {
  getEffectiveUserId,
  ensureUserNumber,
  setStoredCanonicalUid,
  setStoredUserNumber,
  getStoredUserNumber,
  getStoredDisplayName,
  setStoredDisplayName,
  updateDisplayName,
} from './leaderboardService';
import { isPremiumEnabled } from './premiumAccessService';
import { PREMIUM_ENTITLEMENT } from './revenueCatService';
import { trackEvent } from './analyticsService';

const storage = createStorage('app-cloud-sync');

const INITIAL_BACKUP_DONE_KEY = 'is_initial_cloud_backup_done';
const LAST_SYNC_TIMESTAMP_KEY = 'last_cloud_sync_timestamp';
const SCHEMA_VERSION = 1;

export function isInitialBackupDone(): boolean {
  return storage.getString(INITIAL_BACKUP_DONE_KEY) === 'true';
}

export function getLastSyncTimestamp(): number | null {
  const ts = storage.getString(LAST_SYNC_TIMESTAMP_KEY);
  return ts ? Number(ts) : null;
}

export interface VerbCloudBackup {
  displayName?: string;
  userNumber?: number;
  verbProgress: Record<string, VerbProgress>;
  checkpointProgress: Record<string, VerbProgress>;
  prefixLevelsProgress: Record<string, VerbProgress>;
  conjugationLevelsProgress: Record<string, VerbProgress>;
  verbFormsLevelsProgress: Record<string, VerbProgress>;
  prepositionLevelsProgress: Record<string, VerbProgress>;
  sentenceErrors?: Record<string, SentenceProgressStats>;
  settings: AppSettings;
  nativeLanguage: SupportedLocales | null;
  streak: {
    currentStreak: number;
    bestStreak: number;
    lastActiveDate: string | null;
    activeDates?: string[];
    frozenDates?: string[];
    frozenDate?: string | null;
  };
  updatedAt: number;
  schemaVersion: number;
}

/**
 * Strips all undefined fields recursively so Firestore doesn't throw 'Unsupported field value: undefined'.
 */
export function sanitizeForFirestore<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

/**
 * Derives a sanitized, unique subscription identifier.
 * RevenueCat preserves originalAppUserId across restores for the same App Store / Google Play account.
 * If running in development/debug with manual premium enabled, falls back to the persistent user ID.
 */
export async function getSubscriptionIdentifier(): Promise<string | null> {
  try {
    let rawId: string | null = null;

    try {
      const info = await Purchases.getCustomerInfo();
      const active = info?.entitlements?.active?.[PREMIUM_ENTITLEMENT];

      if (active) {
        rawId =
          info.originalAppUserId ||
          (active as { originalPurchaseDate?: string }).originalPurchaseDate ||
          null;
      }
    } catch (purchasesError) {
      if (__DEV__) {
        console.warn('[cloudSyncService] Purchases.getCustomerInfo failed:', purchasesError);
      }
    }

    // Try Purchases.getAppUserID if rawId is not yet resolved
    if (!rawId && isPremiumEnabled()) {
      try {
        const appUserId = await Purchases.getAppUserID();
        if (appUserId && !appUserId.startsWith('$RCAnonymousID:')) {
          rawId = appUserId;
        } else if (appUserId) {
          rawId = appUserId;
        }
      } catch {
        // Ignored
      }
    }

    // Fallback for debug/manual premium overrides or offline premium
    if (!rawId && isPremiumEnabled()) {
      const effectiveUid = await getEffectiveUserId();
      if (effectiveUid) {
        rawId = `dev_sub_${effectiveUid}`;
      }
    }

    if (!rawId) return null;

    return encodeURIComponent(rawId).replace(/\./g, '_');
  } catch (error) {
    if (__DEV__) {
      console.warn('[cloudSyncService] Failed to get subscription identifier:', error);
    }
    return null;
  }
}

/**
 * Gathers a full snapshot of learning progress stored across MMKV and settings.
 */
export async function collectLocalBackupSnapshot(): Promise<VerbCloudBackup> {
  const progressSnapshot = progressService.getAllProgressSnapshot();
  const settings = getSettings();
  const nativeLanguage = getNativeLanguage();
  const streak = getStreakState();
  const storedName = getStoredDisplayName().trim();
  const displayName = storedName && storedName.toLowerCase() !== 'learner' ? storedName : undefined;
  const userNumber = getStoredUserNumber();

  return {
    displayName,
    userNumber: userNumber || undefined,
    verbProgress: progressSnapshot.verbProgress,
    checkpointProgress: progressSnapshot.checkpointProgress,
    prefixLevelsProgress: progressSnapshot.prefixLevelsProgress,
    conjugationLevelsProgress: progressSnapshot.conjugationLevelsProgress,
    verbFormsLevelsProgress: progressSnapshot.verbFormsLevelsProgress,
    prepositionLevelsProgress: progressSnapshot.prepositionLevelsProgress,
    sentenceErrors: progressSnapshot.sentenceErrors,
    settings,
    nativeLanguage,
    streak: {
      currentStreak: streak.currentStreak,
      bestStreak: streak.bestStreak,
      lastActiveDate: streak.lastActiveDate,
      activeDates: streak.activeDates,
      frozenDates: streak.frozenDates,
      frozenDate: streak.frozenDate,
    },
    updatedAt: Date.now(),
    schemaVersion: SCHEMA_VERSION,
  };
}

/**
 * Restores state using bidirectional merging from the cloud snapshot.
 */
export async function applyCloudBackupSnapshot(
  backup: VerbCloudBackup,
  canonicalUid: string,
): Promise<void> {
  try {
    // 1. Establish canonical identity
    setStoredCanonicalUid(canonicalUid);
    if (backup.userNumber) {
      setStoredUserNumber(backup.userNumber);
    }

    // 2. Display Name Protection Rule
    const localName = getStoredDisplayName().trim();
    const remoteName = backup.displayName?.trim();
    const isDefaultLocal = !localName || localName.toLowerCase() === 'learner';
    const isCustomRemote = Boolean(remoteName && remoteName.toLowerCase() !== 'learner');

    if (isDefaultLocal && isCustomRemote && remoteName) {
      setStoredDisplayName(remoteName);
      updateDisplayName(remoteName).catch(() => {});
    } else if (localName && !isDefaultLocal) {
      updateDisplayName(localName).catch(() => {});
    }

    // 3. Bidirectional progress merge (preserves highest scores across both devices)
    progressService.restoreAllProgressSnapshot(
      {
        verbProgress: backup.verbProgress,
        checkpointProgress: backup.checkpointProgress,
        prefixLevelsProgress: backup.prefixLevelsProgress,
        conjugationLevelsProgress: backup.conjugationLevelsProgress,
        verbFormsLevelsProgress: backup.verbFormsLevelsProgress,
        prepositionLevelsProgress: backup.prepositionLevelsProgress,
        sentenceErrors: backup.sentenceErrors,
      },
      true,
    );

    // 4. Bidirectional streak merge (mathematical set union of dates)
    if (backup.streak) {
      const localStreak = getStreakState();
      const localActive = localStreak.activeDates || [];
      const remoteActive = backup.streak.activeDates || [];
      const mergedActive = Array.from(new Set([...localActive, ...remoteActive])).sort();

      const localFrozen = localStreak.frozenDates || [];
      const remoteFrozen = backup.streak.frozenDates || [];
      const mergedFrozen = Array.from(new Set([...localFrozen, ...remoteFrozen])).sort();

      const mergedBest = Math.max(localStreak.bestStreak, backup.streak.bestStreak || 0);
      const mergedCurrent = Math.max(localStreak.currentStreak, backup.streak.currentStreak || 0);

      setStreakState({
        currentStreak: mergedCurrent,
        bestStreak: mergedBest,
        lastActiveDate: backup.streak.lastActiveDate || localStreak.lastActiveDate,
        activeDates: mergedActive,
        frozenDates: mergedFrozen,
        frozenDate: backup.streak.frozenDate || localStreak.frozenDate,
      });
    }

    // 5. Restore settings & language (skipSync = true to prevent echo loop)
    if (backup.settings) {
      updateSettings(backup.settings, true);
    }
    if (backup.nativeLanguage) {
      updateLanguageSettings(true, backup.nativeLanguage, true);
    }

    storage.set(INITIAL_BACKUP_DONE_KEY, 'true');
    storage.set(LAST_SYNC_TIMESTAMP_KEY, String(Date.now()));
  } catch (error) {
    if (__DEV__) {
      console.error('[cloudSyncService] Failed to apply cloud backup snapshot:', error);
    }
    throw error;
  }
}

/**
 * Creates initial backup and subscription link in Firestore, or triggers zero-tap restore.
 * Triggered on first purchase or first launch by existing subscribers.
 */
export async function ensureInitialPremiumBackup(force = false): Promise<void> {
  const isDone = storage.getString(INITIAL_BACKUP_DONE_KEY) === 'true';
  if (isDone && !force) {
    return;
  }

  if (!isPremiumEnabled()) {
    return;
  }

  const startTime = Date.now();
  trackEvent('cloud_sync_started', {
    trigger: force ? 'manual' : 'cold_launch',
  });

  try {
    const subId = await getSubscriptionIdentifier();
    if (!subId) {
      if (__DEV__) {
        console.warn('[cloudSyncService] No subscription identifier available yet');
      }
      return;
    }

    const db = getFirestore();
    const subRef = doc(db, 'subscriptions', subId);

    // If cold launch check (not fresh purchase), see if an existing cloud backup is already linked
    if (!force) {
      const subSnap = await getDoc(subRef);
      if (subSnap.exists()) {
        if (__DEV__) {
          console.log(
            '[cloudSyncService] Existing subscription found on cold launch, auto-restoring progress...',
          );
        }
        await restoreCloudProgress('zero_tap_cold_launch');
        return;
      }
    }

    const userId = await getEffectiveUserId();
    const userNumber = await ensureUserNumber(userId);
    const snapshot = await collectLocalBackupSnapshot();

    // 1. Save link in /subscriptions/{subId}
    const subPayload: Record<string, unknown> = {
      canonical_uid: userId,
      platform: Platform.OS,
      updated_at: serverTimestamp(),
    };
    if (userNumber !== undefined) {
      subPayload.user_number = userNumber;
    }
    await setDoc(subRef, subPayload, { merge: true });

    // 2. Save full backup in /users/{userId}/backup/data
    const backupRef = doc(db, 'users', userId, 'backup', 'data');
    await setDoc(backupRef, sanitizeForFirestore(snapshot), { merge: true });

    storage.set(INITIAL_BACKUP_DONE_KEY, 'true');
    storage.set(LAST_SYNC_TIMESTAMP_KEY, String(Date.now()));

    trackEvent('cloud_sync_success', {
      duration_ms: Date.now() - startTime,
    });
    trackEvent('cloud_identity_resolved', {
      canonical_uid: userId,
      is_existing_user: false,
    });

    if (__DEV__) {
      console.log(
        `[cloudSyncService] Successfully saved backup to /users/${userId}/backup/data and link to /subscriptions/${subId}`,
      );
    }
  } catch (error) {
    if (__DEV__) {
      console.warn('[cloudSyncService] ensureInitialPremiumBackup error:', error);
    }
    trackEvent('cloud_sync_failed', {
      error_message: error instanceof Error ? error.message : String(error),
      trigger: force ? 'manual' : 'cold_launch',
    });
    if (force) {
      throw error;
    }
  }
}

/**
 * Lightweight delta sync executed after each quiz completion (for premium users).
 */
export async function syncProgressAfterQuiz(): Promise<void> {
  if (!isPremiumEnabled()) {
    return;
  }

  const startTime = Date.now();
  trackEvent('cloud_sync_started', {
    trigger: 'quiz_finish',
  });

  try {
    const userId = await getEffectiveUserId();
    const progressSnapshot = progressService.getAllProgressSnapshot();
    const streak: StreakState = getStreakState();
    const db = getFirestore();

    const backupRef = doc(db, 'users', userId, 'backup', 'data');
    await setDoc(
      backupRef,
      sanitizeForFirestore({
        verbProgress: progressSnapshot.verbProgress,
        checkpointProgress: progressSnapshot.checkpointProgress,
        prefixLevelsProgress: progressSnapshot.prefixLevelsProgress,
        conjugationLevelsProgress: progressSnapshot.conjugationLevelsProgress,
        verbFormsLevelsProgress: progressSnapshot.verbFormsLevelsProgress,
        prepositionLevelsProgress: progressSnapshot.prepositionLevelsProgress,
        sentenceErrors: progressSnapshot.sentenceErrors,
        streak: {
          currentStreak: streak.currentStreak,
          bestStreak: streak.bestStreak,
          lastActiveDate: streak.lastActiveDate,
          activeDates: streak.activeDates,
          frozenDates: streak.frozenDates,
          frozenDate: streak.frozenDate,
        },
        updatedAt: Date.now(),
      }),
      { merge: true },
    );

    storage.set(LAST_SYNC_TIMESTAMP_KEY, String(Date.now()));
    trackEvent('cloud_sync_success', {
      duration_ms: Date.now() - startTime,
    });
  } catch (error) {
    if (__DEV__) {
      console.warn('[cloudSyncService] syncProgressAfterQuiz failed (non-blocking):', error);
    }
    trackEvent('cloud_sync_failed', {
      error_message: error instanceof Error ? error.message : String(error),
      trigger: 'quiz_finish',
    });
  }
}

/**
 * Syncs settings and native language to cloud backup.
 */
export async function syncSettings(): Promise<void> {
  if (!isPremiumEnabled()) {
    return;
  }

  const startTime = Date.now();
  trackEvent('cloud_sync_started', {
    trigger: 'settings_change',
  });

  try {
    const userId = await getEffectiveUserId();
    const settings = getSettings();
    const nativeLanguage = getNativeLanguage();
    const db = getFirestore();

    const backupRef = doc(db, 'users', userId, 'backup', 'data');
    await setDoc(
      backupRef,
      sanitizeForFirestore({
        settings,
        nativeLanguage,
        updatedAt: Date.now(),
      }),
      { merge: true },
    );

    storage.set(LAST_SYNC_TIMESTAMP_KEY, String(Date.now()));
    trackEvent('cloud_sync_success', {
      duration_ms: Date.now() - startTime,
    });
  } catch (error) {
    if (__DEV__) {
      console.warn('[cloudSyncService] syncSettings failed (non-blocking):', error);
    }
    trackEvent('cloud_sync_failed', {
      error_message: error instanceof Error ? error.message : String(error),
      trigger: 'settings_change',
    });
  }
}

/**
 * Restores cloud progress when Restore Purchases or zero-tap restore is triggered.
 * Resolves canonical UID from /subscriptions/{subId}, downloads /users/{canonical_uid}/backup/data,
 * and restores state to MMKV and user identity.
 */
export async function restoreCloudProgress(
  source: 'zero_tap_cold_launch' | 'manual_restore' = 'manual_restore',
): Promise<{
  success: boolean;
  restoredUserNumber?: number;
}> {
  try {
    const subId = await getSubscriptionIdentifier();
    if (!subId) {
      if (__DEV__) {
        console.warn('[cloudSyncService] No subscription identifier found during restore');
      }
      return { success: false };
    }

    const db = getFirestore();
    const subSnap = await getDoc(doc(db, 'subscriptions', subId));
    if (!subSnap.exists()) {
      if (__DEV__) {
        console.log('[cloudSyncService] No subscription link document found for subId:', subId);
      }
      return { success: false };
    }

    const subData = subSnap.data();
    const canonicalUid = subData?.canonical_uid;
    if (!canonicalUid) {
      if (__DEV__) {
        console.warn('[cloudSyncService] Subscription document missing canonical_uid');
      }
      return { success: false };
    }

    const [userDocSnap, backupSnap] = await Promise.all([
      getDoc(doc(db, 'users', canonicalUid)),
      getDoc(doc(db, 'users', canonicalUid, 'backup', 'data')),
    ]);

    if (!backupSnap.exists()) {
      if (__DEV__) {
        console.warn(
          '[cloudSyncService] Backup document not found for canonical UID:',
          canonicalUid,
        );
      }
      return { success: false };
    }

    const backupData = backupSnap.data() as VerbCloudBackup;

    // Restore learning progress (verbs, checkpoints, streak, settings, etc.)
    await applyCloudBackupSnapshot(backupData, canonicalUid);

    // Resolve target displayName: prefer backupData.displayName if custom, else check user profile
    let restoredDisplayName = backupData.displayName?.trim();
    if (
      (!restoredDisplayName || restoredDisplayName.toLowerCase() === 'learner') &&
      userDocSnap.exists()
    ) {
      const userData = userDocSnap.data();
      if (userData?.displayName && userData.displayName.toLowerCase() !== 'learner') {
        restoredDisplayName = userData.displayName.trim();
      }
    }

    // Restore userNumber
    let restoredNumber: number | undefined;
    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();
      if (userData?.userNumber) {
        restoredNumber = Number(userData.userNumber);
      }
    } else if (backupData.userNumber) {
      restoredNumber = Number(backupData.userNumber);
    }
    if (restoredNumber !== undefined) {
      setStoredUserNumber(restoredNumber);
    }

    // Persist displayName and update root profile
    if (restoredDisplayName) {
      setStoredDisplayName(restoredDisplayName);
      await updateDisplayName(restoredDisplayName);
    }

    trackEvent('cloud_restore_success', {
      source,
      active_dates_count: backupData.streak?.activeDates?.length || 0,
    });
    trackEvent('cloud_identity_resolved', {
      canonical_uid: canonicalUid,
      is_existing_user: true,
    });

    if (__DEV__) {
      console.log(
        `[cloudSyncService] Successfully restored user from cloud! Canonical UID: ${canonicalUid}, UserNumber: ${restoredNumber ?? 'undefined'}`,
      );
    }

    return {
      success: true,
      restoredUserNumber: restoredNumber,
    };
  } catch (error) {
    if (__DEV__) {
      console.error('[cloudSyncService] Error restoring cloud progress:', error);
    }
    trackEvent('cloud_sync_failed', {
      error_message: error instanceof Error ? error.message : String(error),
      trigger: source,
    });
    return { success: false };
  }
}
