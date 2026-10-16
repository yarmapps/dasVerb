import { getAuth, signInAnonymously } from '@react-native-firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocs,
  collection,
  query,
  orderBy,
  limit,
  writeBatch,
  increment,
  arrayUnion,
  serverTimestamp,
  where,
  getCountFromServer,
  runTransaction,
} from '@react-native-firebase/firestore';
import { createStorage } from './storageService';
import { getRevenueCatAppUserID } from './revenueCatService';
import { appConfigService } from './appConfigService';
import appConfig from '../../assets/app-config.json';

const storage = createStorage('app-leaderboard-data');

const DISPLAY_NAME_KEY = 'user_display_name';
const USER_MONTHLY_RANK_KEY = 'user_monthly_rank';
const PENDING_QUIZ_POINTS_KEY = 'pending_quiz_points';
const DEBUG_LEADERBOARD_OVERRIDE_KEY = 'debug_leaderboard_enabled';
const DEBUG_LEADERBOARD_HISTORY_TAB_OVERRIDE_KEY = 'debug_leaderboard_history_tab_enabled';
const CANONICAL_UID_KEY = 'user_canonical_uid';
const USER_NUMBER_KEY = 'user_number';
const LAST_SEEN_MONTHLY_RECAP_KEY = 'last_seen_monthly_recap_month';

/**
 * Resolves whether Leaderboard functionality & header icon are enabled.
 * Priority: Debug override > Remote app-config > Local app-config > false
 */
export function isLeaderboardEnabled(): boolean {
  const override = storage.getString(DEBUG_LEADERBOARD_OVERRIDE_KEY);
  if (override !== undefined) {
    return override === 'true';
  }
  const features = appConfigService.getFeaturesConfig();
  if (features.enable_leaderboard !== undefined) {
    return Boolean(features.enable_leaderboard);
  }
  const localFeatures = (appConfig as { features?: { enable_leaderboard?: boolean } }).features;
  if (localFeatures?.enable_leaderboard !== undefined) {
    return Boolean(localFeatures.enable_leaderboard);
  }
  return false;
}

/**
 * Resolves whether Leaderboard History tab is enabled.
 * Priority: Debug override > Remote app-config > Local app-config > false
 */
export function isLeaderboardHistoryTabEnabled(): boolean {
  const override = storage.getString(DEBUG_LEADERBOARD_HISTORY_TAB_OVERRIDE_KEY);
  if (override !== undefined) {
    return override === 'true';
  }
  const features = appConfigService.getFeaturesConfig();
  if (features.enable_leaderboard_history_tab !== undefined) {
    return Boolean(features.enable_leaderboard_history_tab);
  }
  const localFeatures = (appConfig as { features?: { enable_leaderboard_history_tab?: boolean } })
    .features;
  if (localFeatures?.enable_leaderboard_history_tab !== undefined) {
    return Boolean(localFeatures.enable_leaderboard_history_tab);
  }
  return false;
}

/**
 * Gets debug override state for Leaderboard (true, false, or null for default).
 */
export function getLeaderboardDebugOverride(): boolean | null {
  const override = storage.getString(DEBUG_LEADERBOARD_OVERRIDE_KEY);
  if (override !== undefined) {
    return override === 'true';
  }
  return null;
}

/**
 * Sets or clears debug override state for Leaderboard.
 */
export function setLeaderboardDebugOverride(enabled: boolean | null): void {
  if (enabled === null) {
    storage.delete(DEBUG_LEADERBOARD_OVERRIDE_KEY);
  } else {
    storage.set(DEBUG_LEADERBOARD_OVERRIDE_KEY, String(enabled));
  }
}

/**
 * Gets debug override state for Leaderboard History Tab (true, false, or null for default).
 */
export function getLeaderboardHistoryTabDebugOverride(): boolean | null {
  const override = storage.getString(DEBUG_LEADERBOARD_HISTORY_TAB_OVERRIDE_KEY);
  if (override !== undefined) {
    return override === 'true';
  }
  return null;
}

/**
 * Sets or clears debug override state for Leaderboard History Tab.
 */
export function setLeaderboardHistoryTabDebugOverride(enabled: boolean | null): void {
  if (enabled === null) {
    storage.delete(DEBUG_LEADERBOARD_HISTORY_TAB_OVERRIDE_KEY);
  } else {
    storage.set(DEBUG_LEADERBOARD_HISTORY_TAB_OVERRIDE_KEY, String(enabled));
  }
}

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  score: number;
  updatedAt?: number;
}

export interface PastChampion {
  yearMonth: string;
  monthLabel: string;
  winnerName: string;
  winnerScore: number;
}

export interface MonthlyRecapData {
  yearMonth: string;
  monthDate: Date;
  rank: number;
  score: number;
  totalParticipants: number;
  allTimeRank?: number | null;
  allTimeTotalParticipants?: number;
  isChampion: boolean;
  isInTop3: boolean;
  isInTop10: boolean;
}

export interface UserRankInfo {
  rank: number;
  score: number;
  displayName: string;
  inTop20: boolean;
}

type RankListener = (rank: number | null) => void;
const rankListeners = new Set<RankListener>();

export function addRankListener(listener: RankListener): () => void {
  rankListeners.add(listener);
  return () => {
    rankListeners.delete(listener);
  };
}

function notifyRankListeners(rank: number | null): void {
  rankListeners.forEach(fn => fn(rank));
}

// 5-minute memory cache
interface CacheItem<T> {
  timestamp: number;
  data: T;
}
const cacheStore: Record<string, CacheItem<unknown>> = {};
const CACHE_TTL_MS = 5 * 60 * 1000;

function getCached<T>(key: string): T | null {
  const item = cacheStore[key];
  if (item && Date.now() - item.timestamp < CACHE_TTL_MS) {
    return item.data as T;
  }
  return null;
}

function setCached<T>(key: string, data: T): void {
  cacheStore[key] = { timestamp: Date.now(), data };
}

export function clearLeaderboardCache(): void {
  Object.keys(cacheStore).forEach(k => delete cacheStore[k]);
}

/**
 * Ensures Firebase anonymous authentication is initialized.
 */
export async function ensureAuthenticated(): Promise<string> {
  try {
    const authInstance = getAuth();
    let { currentUser } = authInstance;
    if (!currentUser) {
      const { user } = await signInAnonymously(authInstance);
      currentUser = user;
    }
    return currentUser.uid;
  } catch (error) {
    if (__DEV__) {
      console.warn(
        '[leaderboardService] ensureAuthenticated error (app may need native rebuild for @react-native-firebase/auth):',
        error,
      );
    }
    let localUid = storage.getString(CANONICAL_UID_KEY);
    if (!localUid) {
      localUid = 'local_' + Math.random().toString(36).substring(2, 12);
      storage.set(CANONICAL_UID_KEY, localUid);
    }
    return localUid;
  }
}

/**
 * Returns the effective user ID for Firestore operations.
 */
export async function getEffectiveUserId(): Promise<string> {
  const canonicalUid = storage.getString(CANONICAL_UID_KEY);
  if (canonicalUid) {
    await ensureAuthenticated();
    return canonicalUid;
  }
  return await ensureAuthenticated();
}

export function getStoredCanonicalUid(): string | undefined {
  return storage.getString(CANONICAL_UID_KEY);
}

export function setStoredCanonicalUid(uid: string): void {
  storage.set(CANONICAL_UID_KEY, uid);
}

export function getStoredUserNumber(): number | undefined {
  const val = storage.getString(USER_NUMBER_KEY);
  if (val !== undefined && val !== '') {
    const num = Number(val);
    return isNaN(num) ? undefined : num;
  }
  return undefined;
}

export function setStoredUserNumber(num: number): void {
  storage.set(USER_NUMBER_KEY, String(num));
}

export function resetStoredUserNumber(): void {
  storage.delete(USER_NUMBER_KEY);
}

export function resetStoredCanonicalUid(): void {
  storage.delete(CANONICAL_UID_KEY);
}

/**
 * Ensures user has an assigned sequential unique number from global counter.
 * Returns undefined if offline or unavailable (will retry on next sync/quiz).
 */
export async function ensureUserNumber(userId: string): Promise<number | undefined> {
  const storedNum = getStoredUserNumber();
  if (storedNum) return storedNum;

  try {
    const db = getFirestore();
    const userRef = doc(db, 'users', userId);

    // 1. Fast check if user already has userNumber in their Firestore document
    const userSnap = await getDoc(userRef);
    const uData = userSnap.data();
    if (userSnap.exists() && uData?.userNumber) {
      const existingNum = Number(uData.userNumber);
      setStoredUserNumber(existingNum);
      return existingNum;
    }

    // 2. Allocate new sequential number from global counter
    const counterRef = doc(db, 'system', 'counters');
    let assignedNumber: number | undefined;

    await runTransaction(db, async transaction => {
      const uSnap = await transaction.get(userRef);
      if (uSnap.exists() && uSnap.data()?.userNumber) {
        assignedNumber = Number(uSnap.data().userNumber);
        return;
      }

      const counterSnap = await transaction.get(counterRef);
      let lastNum = 0;
      if (counterSnap.exists() && counterSnap.data()?.lastUserNumber) {
        lastNum = Number(counterSnap.data().lastUserNumber);
      }

      assignedNumber = lastNum + 1;
      transaction.set(counterRef, { lastUserNumber: assignedNumber }, { merge: true });
      transaction.set(userRef, { userNumber: assignedNumber }, { merge: true });
    });

    if (assignedNumber !== undefined) {
      setStoredUserNumber(assignedNumber);
    }
    return assignedNumber;
  } catch (error) {
    if (__DEV__) {
      console.warn('[leaderboardService] Failed to assign userNumber (will retry later):', error);
    }
    return undefined;
  }
}

/**
 * Gets local display name from MMKV.
 */
export function getStoredDisplayName(): string {
  return storage.getString(DISPLAY_NAME_KEY) || '';
}

/**
 * Sets local display name in MMKV.
 */
export function setStoredDisplayName(name: string): void {
  storage.set(DISPLAY_NAME_KEY, name.trim());
}

/**
 * Resets local display name in MMKV.
 */
export function resetStoredDisplayName(): void {
  storage.delete(DISPLAY_NAME_KEY);
  clearLeaderboardCache();
}

/**
 * Formats user display name.
 */
export function formatLeaderboardDisplayName(displayName?: string): string {
  const isCustom = displayName && displayName.trim().length > 0;
  return isCustom ? displayName.trim() : 'Learner';
}

/**
 * Gets cached rank from MMKV.
 */
export function getStoredUserMonthlyRank(): number | null {
  const val = storage.getString(USER_MONTHLY_RANK_KEY);
  if (val !== undefined && val !== '') {
    const num = Number(val);
    return isNaN(num) ? null : num;
  }
  return null;
}

/**
 * Sets cached rank in MMKV and notifies listeners.
 */
export function setStoredUserMonthlyRank(rank: number | null): void {
  if (rank === null) {
    storage.delete(USER_MONTHLY_RANK_KEY);
  } else {
    storage.set(USER_MONTHLY_RANK_KEY, String(rank));
  }
  notifyRankListeners(rank);
}

/**
 * Returns formatted YYYY_MM string (e.g. "2026_10").
 */
export function getYearMonthString(date: Date = new Date()): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  return `${yyyy}_${mm}`;
}

/**
 * Returns Date object pointing to the first day of the previous calendar month.
 */
export function getPreviousMonthDate(date: Date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth() - 1, 1);
}

/**
 * Returns formatted YYYY_MM string for the previous calendar month (e.g. "2026_09").
 */
export function getPreviousYearMonthString(date: Date = new Date()): string {
  return getYearMonthString(getPreviousMonthDate(date));
}

/**
 * Submits quiz score asynchronously to user profile and current monthly leaderboard.
 */
export async function submitQuizScore(points: number): Promise<void> {
  if (points <= 0) return;

  try {
    const userId = await getEffectiveUserId();
    const displayName = getStoredDisplayName();
    const yearMonth = getYearMonthString();
    const db = getFirestore();
    const rcId = await getRevenueCatAppUserID();

    const rawPending = storage.getString(PENDING_QUIZ_POINTS_KEY);
    const pending = rawPending ? Number(rawPending) || 0 : 0;
    const totalPointsToSubmit = points + pending;

    const batch = writeBatch(db);

    // 1. Update User Profile
    const userDocRef = doc(db, 'users', userId);
    batch.set(
      userDocRef,
      {
        displayName: displayName || 'Learner',
        revenueCatId: rcId || null,
        totalScore: increment(totalPointsToSubmit),
        participatedMonths: arrayUnion(yearMonth),
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );

    // 2. Update Current Monthly Leaderboard Doc
    const monthlyDocRef = doc(db, `leaderboard_${yearMonth}`, userId);
    batch.set(
      monthlyDocRef,
      {
        displayName: displayName || 'Learner',
        monthlyScore: increment(totalPointsToSubmit),
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );

    await batch.commit();

    storage.delete(PENDING_QUIZ_POINTS_KEY);
    clearLeaderboardCache();

    // Update user rank in background
    getUserMonthlyRank(yearMonth).catch(() => {});
  } catch (error) {
    if (__DEV__) {
      console.error(
        '[leaderboardService] Error submitting quiz score, saving to offline MMKV queue:',
        error,
      );
    }
    const rawPending = storage.getString(PENDING_QUIZ_POINTS_KEY);
    const currentPending = rawPending ? Number(rawPending) || 0 : 0;
    storage.set(PENDING_QUIZ_POINTS_KEY, String(currentPending + points));
  }
}

/**
 * Updates display name across MMKV, user profile, and all cloud-persisted participated months.
 */
export async function updateDisplayName(newName: string): Promise<void> {
  const trimmed = newName.trim().slice(0, 15);
  if (!trimmed) return;

  setStoredDisplayName(trimmed);

  try {
    const userId = await getEffectiveUserId();
    const currentMonth = getYearMonthString();
    const db = getFirestore();
    const rcId = await getRevenueCatAppUserID();

    const userSnap = await getDoc(doc(db, 'users', userId));
    const userData = userSnap.data();
    const participatedMonths: string[] = userData?.participatedMonths || [];

    const allMonths = Array.from(new Set([...participatedMonths, currentMonth]));

    const batch = writeBatch(db);

    batch.set(
      doc(db, 'users', userId),
      { displayName: trimmed, revenueCatId: rcId || null, updatedAt: serverTimestamp() },
      { merge: true },
    );

    allMonths.forEach(mKey => {
      const docRef = doc(db, `leaderboard_${mKey}`, userId);
      batch.set(docRef, { displayName: trimmed, updatedAt: serverTimestamp() }, { merge: true });
    });

    await batch.commit();
    clearLeaderboardCache();
  } catch (error) {
    if (__DEV__) {
      console.error('[leaderboardService] Error updating display name:', error);
    }
  }
}

/**
 * Fetches Top 20 entries for a given month (defaults to current month).
 */
export async function fetchMonthlyLeaderboard(
  yearMonth?: string,
  bypassCache = false,
): Promise<LeaderboardEntry[]> {
  const targetMonth = yearMonth || getYearMonthString();
  const cacheKey = `monthly_${targetMonth}`;

  if (!bypassCache) {
    const cached = getCached<LeaderboardEntry[]>(cacheKey);
    if (cached) return cached;
  }

  try {
    await ensureAuthenticated();
    const db = getFirestore();

    const q = query(
      collection(db, `leaderboard_${targetMonth}`),
      where('monthlyScore', '>', 0),
      orderBy('monthlyScore', 'desc'),
      limit(20),
    );
    const snap = await getDocs(q);

    const result: LeaderboardEntry[] = snap.docs
      .map(docSnap => {
        const data = docSnap.data();
        let updatedAt = 0;
        if (data.updatedAt?.toMillis) {
          updatedAt = data.updatedAt.toMillis();
        } else if (data.updatedAt?.seconds) {
          updatedAt = data.updatedAt.seconds * 1000;
        }
        return {
          userId: docSnap.id,
          displayName: data.displayName || '',
          score: Number(data.monthlyScore) || 0,
          updatedAt,
        };
      })
      .sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        // Tie-breaker: earliest user to reach score gets higher position
        return a.updatedAt - b.updatedAt;
      })
      .map(({ userId, displayName, score }) => ({
        userId,
        displayName,
        score,
      }));

    setCached(cacheKey, result);
    return result;
  } catch (error) {
    if (__DEV__) {
      console.error('[leaderboardService] Error fetching monthly leaderboard:', error);
    }
    return [];
  }
}

/**
 * Calculates current user's rank info (including if outside Top 20).
 */
export async function getUserMonthlyRank(yearMonth?: string): Promise<UserRankInfo | null> {
  try {
    const userId = await getEffectiveUserId();
    const currentMonth = getYearMonthString();
    const targetMonth = yearMonth || currentMonth;
    const isCurrentMonth = targetMonth === currentMonth;
    const db = getFirestore();

    const userDocSnap = await getDoc(doc(db, `leaderboard_${targetMonth}`, userId));

    if (!userDocSnap.exists()) {
      if (isCurrentMonth) {
        setStoredUserMonthlyRank(null);
      }
      return null;
    }

    const userData = userDocSnap.data();
    const myScore = Number(userData?.monthlyScore) || 0;
    const displayName = userData?.displayName || getStoredDisplayName() || '';

    if (myScore <= 0) {
      if (isCurrentMonth) {
        setStoredUserMonthlyRank(null);
      }
      return null;
    }

    const q = query(
      collection(db, `leaderboard_${targetMonth}`),
      where('monthlyScore', '>', myScore),
    );
    const higherSnap = await getDocs(q);

    const rank = higherSnap.size + 1;
    if (isCurrentMonth) {
      setStoredUserMonthlyRank(rank);
    }

    const userRankInfo: UserRankInfo = {
      rank,
      score: myScore,
      displayName,
      inTop20: rank <= 20,
    };

    return userRankInfo;
  } catch (error) {
    if (__DEV__) {
      console.error('[leaderboardService] Error calculating user monthly rank:', error);
    }
    if (!yearMonth || yearMonth === getYearMonthString()) {
      setStoredUserMonthlyRank(null);
    }
    return null;
  }
}

/**
 * Calculates current user's all-time rank info.
 */
export async function getUserAllTimeRank(): Promise<UserRankInfo | null> {
  try {
    const userId = await getEffectiveUserId();
    const db = getFirestore();

    const userDocSnap = await getDoc(doc(db, 'users', userId));

    if (!userDocSnap.exists()) {
      return null;
    }

    const userData = userDocSnap.data();
    const myScore = Number(userData?.totalScore) || 0;
    const displayName = userData?.displayName || getStoredDisplayName() || '';

    if (myScore <= 0) {
      return null;
    }

    const q = query(collection(db, 'users'), where('totalScore', '>', myScore));
    let rank = 1;
    try {
      const snapshot = await getCountFromServer(q);
      rank = snapshot.data().count + 1;
    } catch {
      const higherSnap = await getDocs(q);
      rank = higherSnap.size + 1;
    }

    const userRankInfo: UserRankInfo = {
      rank,
      score: myScore,
      displayName,
      inTop20: rank <= 20,
    };

    return userRankInfo;
  } catch (error) {
    if (__DEV__) {
      console.error('[leaderboardService] Error calculating user all-time rank:', error);
    }
    return null;
  }
}

/**
 * Fetches total count of participants for the specified month.
 */
export async function getMonthlyParticipantCount(yearMonth?: string): Promise<number> {
  try {
    const targetMonth = yearMonth || getYearMonthString();
    const db = getFirestore();
    const q = query(collection(db, `leaderboard_${targetMonth}`), where('monthlyScore', '>', 0));
    const snapshot = await getCountFromServer(q);
    return snapshot.data().count;
  } catch (error) {
    if (__DEV__) {
      console.error('[leaderboardService] Error fetching monthly participant count:', error);
    }
    return 0;
  }
}

/**
 * Fetches total count of all users registered in the app.
 */
export async function getAllTimeParticipantCount(): Promise<number> {
  try {
    const db = getFirestore();
    const q = query(collection(db, 'users'), where('totalScore', '>', 0));
    const snapshot = await getCountFromServer(q);
    return snapshot.data().count;
  } catch (error) {
    if (__DEV__) {
      console.error('[leaderboardService] Error fetching all-time participant count:', error);
    }
    return 0;
  }
}

/**
 * Fetches Top 20 all-time leaders from users collection.
 */
export async function fetchAllTimeLeaderboard(bypassCache = false): Promise<LeaderboardEntry[]> {
  const cacheKey = 'alltime_top20';

  if (!bypassCache) {
    const cached = getCached<LeaderboardEntry[]>(cacheKey);
    if (cached) return cached;
  }

  try {
    await ensureAuthenticated();
    const db = getFirestore();

    const q = query(
      collection(db, 'users'),
      where('totalScore', '>', 0),
      orderBy('totalScore', 'desc'),
      limit(20),
    );
    const snap = await getDocs(q);

    const result: LeaderboardEntry[] = snap.docs
      .map(docSnap => {
        const data = docSnap.data();
        let updatedAt = 0;
        if (data.updatedAt?.toMillis) {
          updatedAt = data.updatedAt.toMillis();
        } else if (data.updatedAt?.seconds) {
          updatedAt = data.updatedAt.seconds * 1000;
        }
        return {
          userId: docSnap.id,
          displayName: data.displayName || '',
          score: Number(data.totalScore) || 0,
          updatedAt,
        };
      })
      .sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        // Tie-breaker: earliest user to reach score gets higher position
        return a.updatedAt - b.updatedAt;
      })
      .map(({ userId, displayName, score }) => ({
        userId,
        displayName,
        score,
      }));

    setCached(cacheKey, result);
    return result;
  } catch (error) {
    if (__DEV__) {
      console.error('[leaderboardService] Error fetching all-time leaderboard:', error);
    }
    return [];
  }
}

/**
 * Fetches past monthly winners in 1 parallel network request (limit(1) across past 6 months).
 */
export async function fetchPastChampions(bypassCache = false): Promise<PastChampion[]> {
  const cacheKey = 'past_champions';

  if (!bypassCache) {
    const cached = getCached<PastChampion[]>(cacheKey);
    if (cached) return cached;
  }

  try {
    await ensureAuthenticated();
    const db = getFirestore();

    const now = new Date();
    const fetchPromises: Promise<PastChampion | null>[] = [];

    for (let i = 1; i <= 6; i++) {
      const pastDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const yyyy_mm = getYearMonthString(pastDate);
      const mm = String(pastDate.getMonth() + 1).padStart(2, '0');
      const yy = String(pastDate.getFullYear()).slice(-2);
      const monthLabel = `${mm}/${yy}`;

      const q = query(
        collection(db, `leaderboard_${yyyy_mm}`),
        orderBy('monthlyScore', 'desc'),
        limit(1),
      );

      fetchPromises.push(
        getDocs(q)
          .then(snap => {
            if (!snap.empty) {
              const data = snap.docs[0].data();
              return {
                yearMonth: yyyy_mm,
                monthLabel,
                winnerName: data.displayName || 'Learner',
                winnerScore: Number(data.monthlyScore) || 0,
              };
            }
            return null;
          })
          .catch(() => null),
      );
    }

    const results = await Promise.all(fetchPromises);
    const validChampions = results.filter((c): c is PastChampion => c !== null);

    setCached(cacheKey, validChampions);
    return validChampions;
  } catch (error) {
    if (__DEV__) {
      console.error('[leaderboardService] Error fetching past champions:', error);
    }
    return [];
  }
}

/**
 * Checks whether user has an unshown monthly recap for the previous calendar month.
 * If user scored points in previous month and hasn't seen the recap yet, returns MonthlyRecapData.
 * Otherwise returns null and marks as seen to avoid re-checking every launch.
 */
export async function checkMonthlyRecap(): Promise<MonthlyRecapData | null> {
  if (!isLeaderboardEnabled()) {
    return null;
  }

  const prevDate = getPreviousMonthDate();
  const prevYearMonth = getYearMonthString(prevDate);
  const lastSeen = storage.getString(LAST_SEEN_MONTHLY_RECAP_KEY);

  if (lastSeen === prevYearMonth) {
    return null;
  }

  try {
    const userId = await getEffectiveUserId();
    const db = getFirestore();
    const userDocSnap = await getDoc(doc(db, `leaderboard_${prevYearMonth}`, userId));

    if (!userDocSnap.exists()) {
      storage.set(LAST_SEEN_MONTHLY_RECAP_KEY, prevYearMonth);
      return null;
    }

    const userData = userDocSnap.data();
    const myScore = Number(userData?.monthlyScore) || 0;

    if (myScore <= 0) {
      storage.set(LAST_SEEN_MONTHLY_RECAP_KEY, prevYearMonth);
      return null;
    }

    const higherQuery = query(
      collection(db, `leaderboard_${prevYearMonth}`),
      where('monthlyScore', '>', myScore),
    );

    // Concurrently fetch monthly rank, monthly count, user global doc, and all-time total count
    const [higherSnap, totalCount, userGlobalSnap, allTimeTotalCount] = await Promise.all([
      getDocs(higherQuery),
      getMonthlyParticipantCount(prevYearMonth),
      getDoc(doc(db, 'users', userId)),
      getAllTimeParticipantCount(),
    ]);

    const rank = higherSnap.size + 1;

    let allTimeRank: number | null = null;
    const allTimeScore = Number(userGlobalSnap.data()?.totalScore) || 0;
    if (allTimeScore > 0) {
      const allTimeHigherSnap = await getDocs(
        query(collection(db, 'users'), where('totalScore', '>', allTimeScore)),
      );
      allTimeRank = allTimeHigherSnap.size + 1;
    }

    storage.set(LAST_SEEN_MONTHLY_RECAP_KEY, prevYearMonth);

    return {
      yearMonth: prevYearMonth,
      monthDate: prevDate,
      rank,
      score: myScore,
      totalParticipants: totalCount,
      allTimeRank,
      allTimeTotalParticipants: allTimeTotalCount,
      isChampion: rank === 1,
      isInTop3: rank <= 3,
      isInTop10: rank <= 10,
    };
  } catch (error) {
    if (__DEV__) {
      console.error('[leaderboardService] Error checking monthly recap:', error);
    }
    return null;
  }
}

/**
 * Marks monthly recap as seen for given month or previous month.
 */
export function markMonthlyRecapSeen(yearMonth?: string): void {
  const target = yearMonth || getPreviousYearMonthString();
  storage.set(LAST_SEEN_MONTHLY_RECAP_KEY, target);
}

/**
 * Resets monthly recap debug state to allow testing.
 */
export function resetMonthlyRecapDebug(): void {
  storage.delete(LAST_SEEN_MONTHLY_RECAP_KEY);
}
