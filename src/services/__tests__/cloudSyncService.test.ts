import Purchases from 'react-native-purchases';
import { getDoc, setDoc } from '@react-native-firebase/firestore';
import {
  sanitizeForFirestore,
  getSubscriptionIdentifier,
  collectLocalBackupSnapshot,
  applyCloudBackupSnapshot,
  ensureInitialPremiumBackup,
  syncProgressAfterQuiz,
  syncSettings,
  restoreCloudProgress,
  VerbCloudBackup,
} from '../cloudSyncService';
import { setPremiumEnabled } from '../premiumAccessService';
import { progressService } from '../progressService';
import { getStreakState, setStreakState } from '../streakService';
import { getSettings, updateSettings } from '../settingsService';
import {
  getStoredCanonicalUid,
  getStoredDisplayName,
  setStoredDisplayName,
  getStoredUserNumber,
  setStoredUserNumber,
} from '../leaderboardService';
import { resetAllStorages } from '../storageService';

describe('cloudSyncService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetAllStorages();
    setPremiumEnabled(false);
    setStoredDisplayName('');
  });

  describe('sanitizeForFirestore', () => {
    it('removes undefined fields recursively while preserving null and valid values', () => {
      const input = {
        name: 'test',
        age: 25,
        extra: undefined,
        nested: {
          active: true,
          deletedAt: null,
          skipped: undefined,
        },
        list: [1, 2, undefined],
      };

      const sanitized = sanitizeForFirestore(input);

      expect(sanitized).toEqual({
        name: 'test',
        age: 25,
        nested: {
          active: true,
          deletedAt: null,
        },
        list: [1, 2, null],
      });
      expect('extra' in sanitized).toBe(false);
      expect('skipped' in sanitized.nested).toBe(false);
    });
  });

  describe('getSubscriptionIdentifier', () => {
    it('returns null if no active premium entitlement exists', async () => {
      (Purchases.getCustomerInfo as jest.Mock).mockResolvedValueOnce({
        entitlements: { active: {} },
      });

      const subId = await getSubscriptionIdentifier();
      expect(subId).toBeNull();
    });

    it('derives and sanitizes subId from originalAppUserId', async () => {
      (Purchases.getCustomerInfo as jest.Mock).mockResolvedValueOnce({
        entitlements: {
          active: {
            premium: {
              originalPurchaseDate: '2026-01-01T00:00:00Z',
            },
          },
        },
        originalAppUserId: '$RCAnonymousID:user.123.abc',
      });

      const subId = await getSubscriptionIdentifier();
      expect(subId).toBe('%24RCAnonymousID%3Auser_123_abc');
    });

    it('falls back to originalPurchaseDate if originalAppUserId is absent', async () => {
      (Purchases.getCustomerInfo as jest.Mock).mockResolvedValueOnce({
        entitlements: {
          active: {
            premium: {
              originalPurchaseDate: '2026-03-15T10:00:00.000Z',
            },
          },
        },
        originalAppUserId: null,
      });

      const subId = await getSubscriptionIdentifier();
      expect(subId).toBe('2026-03-15T10%3A00%3A00_000Z');
    });
  });

  describe('collectLocalBackupSnapshot', () => {
    it('collects full snapshot including progress, streak, settings, and profile', async () => {
      progressService.setVerbProgress('sehen', 90);
      setStoredDisplayName('Hans');
      setStoredUserNumber(1042);

      const snapshot = await collectLocalBackupSnapshot();

      expect(snapshot.displayName).toBe('Hans');
      expect(snapshot.userNumber).toBe(1042);
      expect(snapshot.verbProgress.sehen).toBeDefined();
      expect(snapshot.verbProgress.sehen.score).toBe(90);
      expect(snapshot.settings).toBeDefined();
      expect(snapshot.streak).toBeDefined();
      expect(snapshot.schemaVersion).toBe(1);
    });

    it('omits default Learner display name', async () => {
      setStoredDisplayName('Learner');

      const snapshot = await collectLocalBackupSnapshot();
      expect(snapshot.displayName).toBeUndefined();
    });
  });

  describe('applyCloudBackupSnapshot', () => {
    it('applies cloud snapshot and enforces Display Name Protection Rule', async () => {
      setStoredDisplayName('Learner');

      const mockBackup: VerbCloudBackup = {
        displayName: 'Erika',
        userNumber: 1099,
        verbProgress: {
          gehen: { score: 100, status: 'trophy', lastPracticedAt: 123456 },
        },
        checkpointProgress: {},
        prefixLevelsProgress: {},
        conjugationLevelsProgress: {},
        verbFormsLevelsProgress: {},
        prepositionLevelsProgress: {},
        settings: {
          soundEffects: false,
          haptics: true,
          notifications: true,
          themeMode: 'dark',
          speakOnCorrectAnswer: false,
          ttsVoiceGender: 'female',
          completedQuizCount: 4,
          lastReviewPromptDate: null,
          quizInputMode: 'choice',
        },
        nativeLanguage: 'ru',
        streak: {
          currentStreak: 5,
          bestStreak: 10,
          lastActiveDate: '2026-10-10',
          activeDates: ['2026-10-09', '2026-10-10'],
          frozenDates: [],
        },
        updatedAt: Date.now(),
        schemaVersion: 1,
      };

      await applyCloudBackupSnapshot(mockBackup, 'canonical-user-999');

      expect(getStoredCanonicalUid()).toBe('canonical-user-999');
      expect(getStoredUserNumber()).toBe(1099);
      expect(getStoredDisplayName()).toBe('Erika');
      expect(progressService.getVerbProgress('gehen').score).toBe(100);
      expect(getSettings().themeMode).toBe('dark');
      expect(getStreakState().bestStreak).toBe(10);
    });

    it('performs bidirectional union merge of streak dates', async () => {
      setStreakState({
        currentStreak: 2,
        bestStreak: 4,
        lastActiveDate: '2026-10-10',
        activeDates: ['2026-10-09', '2026-10-10'],
        frozenDates: ['2026-10-08'],
      });

      const mockBackup: VerbCloudBackup = {
        displayName: 'Learner',
        verbProgress: {},
        checkpointProgress: {},
        prefixLevelsProgress: {},
        conjugationLevelsProgress: {},
        verbFormsLevelsProgress: {},
        prepositionLevelsProgress: {},
        settings: getSettings(),
        nativeLanguage: null,
        streak: {
          currentStreak: 3,
          bestStreak: 7,
          lastActiveDate: '2026-10-11',
          activeDates: ['2026-10-07', '2026-10-11'],
          frozenDates: ['2026-10-06'],
        },
        updatedAt: Date.now(),
        schemaVersion: 1,
      };

      await applyCloudBackupSnapshot(mockBackup, 'uid-123');

      const streak = getStreakState();
      expect(streak.bestStreak).toBe(7);
      expect(streak.activeDates).toEqual(
        expect.arrayContaining(['2026-10-07', '2026-10-09', '2026-10-10', '2026-10-11']),
      );
      expect(streak.frozenDates).toEqual(expect.arrayContaining(['2026-10-06', '2026-10-08']));
    });
  });

  describe('ensureInitialPremiumBackup', () => {
    it('skips if user is not premium', async () => {
      setPremiumEnabled(false);

      await ensureInitialPremiumBackup(true);
      expect(setDoc).not.toHaveBeenCalled();
    });

    it('creates initial backup and links subscription in Firestore on new purchase', async () => {
      setPremiumEnabled(true);
      (Purchases.getCustomerInfo as jest.Mock).mockResolvedValueOnce({
        entitlements: {
          active: {
            premium: { originalPurchaseDate: '2026-05-01T00:00:00Z' },
          },
        },
        originalAppUserId: 'sub-user-1',
      });

      await ensureInitialPremiumBackup(true);

      expect(setDoc).toHaveBeenCalledTimes(2);
      // 1st call: /subscriptions/{subId}
      expect(setDoc).toHaveBeenCalledWith(
        expect.objectContaining({ path: expect.stringContaining('subscriptions/sub-user-1') }),
        expect.objectContaining({ canonical_uid: expect.any(String) }),
        { merge: true },
      );
      // 2nd call: /users/{userId}/backup/data
      expect(setDoc).toHaveBeenCalledWith(
        expect.objectContaining({ path: expect.stringContaining('backup/data') }),
        expect.objectContaining({ schemaVersion: 1 }),
        { merge: true },
      );
    });

    it('triggers zero-tap restore on cold launch when existing subscription doc is found', async () => {
      setPremiumEnabled(true);
      (Purchases.getCustomerInfo as jest.Mock).mockResolvedValue({
        entitlements: {
          active: {
            premium: { originalPurchaseDate: '2026-05-01T00:00:00Z' },
          },
        },
        originalAppUserId: 'sub-existing-user',
      });

      (getDoc as jest.Mock).mockImplementation((ref: { path: string }) => {
        if (ref.path.includes('subscriptions/sub-existing-user')) {
          return Promise.resolve({
            exists: () => true,
            data: () => ({ canonical_uid: 'canon-user-77', user_number: 1055 }),
          });
        }
        if (ref.path.includes('users/canon-user-77/backup/data')) {
          return Promise.resolve({
            exists: () => true,
            data: () => ({
              displayName: 'CloudLearner',
              userNumber: 1055,
              verbProgress: {
                lernen: { score: 100, status: 'trophy', lastPracticedAt: 12345 },
              },
              streak: { currentStreak: 3, bestStreak: 8, lastActiveDate: '2026-10-10' },
              schemaVersion: 1,
            }),
          });
        }
        return Promise.resolve({
          exists: () => true,
          data: () => ({ displayName: 'CloudLearner' }),
        });
      });

      await ensureInitialPremiumBackup(false);

      expect(getStoredCanonicalUid()).toBe('canon-user-77');
      expect(getStoredDisplayName()).toBe('CloudLearner');
      expect(progressService.getVerbProgress('lernen').score).toBe(100);
    });
  });

  describe('syncProgressAfterQuiz', () => {
    it('skips sync when user is not premium', async () => {
      setPremiumEnabled(false);

      await syncProgressAfterQuiz();
      expect(setDoc).not.toHaveBeenCalled();
    });

    it('performs delta sync to /backup/data when user is premium', async () => {
      setPremiumEnabled(true);
      progressService.setVerbProgress('kommen', 85);

      await syncProgressAfterQuiz();

      expect(setDoc).toHaveBeenCalledWith(
        expect.objectContaining({ path: expect.stringContaining('backup/data') }),
        expect.objectContaining({
          verbProgress: expect.objectContaining({
            kommen: expect.objectContaining({ score: 85 }),
          }),
        }),
        { merge: true },
      );
    });
  });

  describe('syncSettings', () => {
    it('skips sync when user is not premium', async () => {
      setPremiumEnabled(false);

      await syncSettings();
      expect(setDoc).not.toHaveBeenCalled();
    });

    it('syncs settings and language when user is premium', async () => {
      setPremiumEnabled(true);
      updateSettings({ soundEffects: false }, true);

      await syncSettings();

      expect(setDoc).toHaveBeenCalledWith(
        expect.objectContaining({ path: expect.stringContaining('backup/data') }),
        expect.objectContaining({
          settings: expect.objectContaining({ soundEffects: false }),
        }),
        { merge: true },
      );
    });
  });

  describe('restoreCloudProgress', () => {
    it('returns failure when no subscription document exists', async () => {
      (Purchases.getCustomerInfo as jest.Mock).mockResolvedValueOnce({
        entitlements: {
          active: {
            premium: { originalPurchaseDate: '2026-01-01T00:00:00Z' },
          },
        },
        originalAppUserId: 'unregistered-sub',
      });
      (getDoc as jest.Mock).mockResolvedValueOnce({
        exists: () => false,
        data: () => null,
      });

      const result = await restoreCloudProgress('manual_restore');
      expect(result.success).toBe(false);
    });

    it('restores all state when subscription doc and backup doc exist', async () => {
      (Purchases.getCustomerInfo as jest.Mock).mockResolvedValueOnce({
        entitlements: {
          active: {
            premium: { originalPurchaseDate: '2026-01-01T00:00:00Z' },
          },
        },
        originalAppUserId: 'valid-sub',
      });

      (getDoc as jest.Mock).mockImplementation((ref: { path: string }) => {
        if (ref.path.includes('subscriptions/valid-sub')) {
          return Promise.resolve({
            exists: () => true,
            data: () => ({ canonical_uid: 'target-uid', user_number: 1200 }),
          });
        }
        if (ref.path.includes('users/target-uid/backup/data')) {
          return Promise.resolve({
            exists: () => true,
            data: () => ({
              displayName: 'RestoredUser',
              userNumber: 1200,
              verbProgress: {
                arbeiten: { score: 95, status: 'silver', lastPracticedAt: 9999 },
              },
              settings: {
                soundEffects: true,
                notifications: false,
                themeMode: 'light',
                speakOnCorrectAnswer: true,
                ttsVoiceGender: 'male',
                completedQuizCount: 10,
                lastReviewPromptDate: null,
              },
              streak: { currentStreak: 4, bestStreak: 12, lastActiveDate: '2026-10-11' },
              schemaVersion: 1,
            }),
          });
        }
        return Promise.resolve({
          exists: () => true,
          data: () => ({ displayName: 'RestoredUser', userNumber: 1200 }),
        });
      });

      const result = await restoreCloudProgress('manual_restore');

      expect(result.success).toBe(true);
      expect(result.restoredUserNumber).toBe(1200);
      expect(getStoredCanonicalUid()).toBe('target-uid');
      expect(getStoredDisplayName()).toBe('RestoredUser');
      expect(progressService.getVerbProgress('arbeiten').score).toBe(95);
      expect(getSettings().completedQuizCount).toBe(10);
    });
  });
});
