import { createStorage } from './storageService';

export type VerbProgressStatus = 'uncompleted' | 'bronze' | 'silver' | 'trophy';

export interface VerbProgress {
  score: number;
  status: VerbProgressStatus;
  lastPracticedAt?: number;
}

const progressStorage = createStorage('verb_progress');
const sentenceErrorsStorage = createStorage('sentence_error_stats');
const checkpointStorage = createStorage('checkpoint_progress');

export function calculateVerbStatus(score: number): VerbProgressStatus {
  if (score < 60) return 'uncompleted';
  if (score < 80) return 'bronze';
  if (score < 100) return 'silver';
  return 'trophy';
}

function getAlternativeKeys(key: string): string[] {
  const keys = new Set<string>();
  const cleanKey = key.trim();
  keys.add(cleanKey);
  keys.add(cleanKey.toLowerCase());

  // Транслитерация умлаутов (können -> koennen, hängen -> haengen)
  const transliterated = cleanKey
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss');
  keys.add(transliterated);

  // Обратная транслитерация (koennen -> können, haengen -> hängen)
  const detransliterated = cleanKey
    .toLowerCase()
    .replace(/ae/g, 'ä')
    .replace(/oe/g, 'ö')
    .replace(/ue/g, 'ü')
    .replace(/ss/g, 'ß');
  keys.add(detransliterated);

  return Array.from(keys);
}

export interface SentenceProgressStats {
  attempts: number;
  correct: number;
  incorrect: number;
}

export const progressService = {
  getVerbProgress(verbId: string): VerbProgress {
    const candidateKeys = getAlternativeKeys(verbId);
    let bestScore = 0;
    let latestPracticedAt: number | undefined;

    for (const key of candidateKeys) {
      const rawData = progressStorage.getString(key);
      if (rawData) {
        try {
          const parsed = JSON.parse(rawData);
          const score = typeof parsed.score === 'number' ? parsed.score : 0;
          if (score > bestScore) {
            bestScore = score;
            latestPracticedAt = parsed.lastPracticedAt;
          }
        } catch {
          // ignore corrupted json
        }
      }
    }

    return {
      score: bestScore,
      status: calculateVerbStatus(bestScore),
      lastPracticedAt: latestPracticedAt,
    };
  },

  setVerbProgress(verbId: string, score: number): void {
    const clampedScore = Math.max(0, Math.min(100, score));
    const previousProgress = this.getVerbProgress(verbId);
    const bestScore = Math.max(previousProgress.score, clampedScore);
    const status = calculateVerbStatus(bestScore);
    const progressData: VerbProgress = {
      score: bestScore,
      status,
      lastPracticedAt: Date.now(),
    };
    const jsonStr = JSON.stringify(progressData);
    const candidateKeys = getAlternativeKeys(verbId);
    candidateKeys.forEach(key => {
      progressStorage.set(key, jsonStr);
    });
  },

  recordSentenceResult(sentenceKey: string, isCorrect: boolean): void {
    const stats = this.getSentenceStats(sentenceKey);
    const updated: SentenceProgressStats = {
      attempts: stats.attempts + 1,
      correct: isCorrect ? stats.correct + 1 : stats.correct,
      incorrect: isCorrect ? stats.incorrect : stats.incorrect + 1,
    };
    sentenceErrorsStorage.set(sentenceKey, JSON.stringify(updated));
  },

  recordSentenceError(sentenceKey: string): void {
    this.recordSentenceResult(sentenceKey, false);
  },

  recordSentenceSuccess(sentenceKey: string): void {
    this.recordSentenceResult(sentenceKey, true);
  },

  getSentenceStats(sentenceKey: string): SentenceProgressStats {
    const rawValue = sentenceErrorsStorage.getString(sentenceKey);
    if (!rawValue) {
      return { attempts: 0, correct: 0, incorrect: 0 };
    }
    try {
      const parsed = JSON.parse(rawValue);
      if (typeof parsed === 'object' && parsed !== null) {
        return {
          attempts: typeof parsed.attempts === 'number' ? parsed.attempts : 0,
          correct: typeof parsed.correct === 'number' ? parsed.correct : 0,
          incorrect: typeof parsed.incorrect === 'number' ? parsed.incorrect : 0,
        };
      }
      const count = parseInt(rawValue, 10);
      if (Number.isFinite(count) && count > 0) {
        return { attempts: count, correct: 0, incorrect: count };
      }
    } catch {
      const count = parseInt(rawValue, 10);
      if (Number.isFinite(count) && count > 0) {
        return { attempts: count, correct: 0, incorrect: count };
      }
    }
    return { attempts: 0, correct: 0, incorrect: 0 };
  },

  getSentenceErrors(sentenceKey: string): number {
    return this.getSentenceStats(sentenceKey).incorrect;
  },

  getCheckpointProgress(checkpointId: string): VerbProgress {
    const rawData = checkpointStorage.getString(checkpointId);
    if (rawData) {
      try {
        const parsed = JSON.parse(rawData);
        const score = typeof parsed.score === 'number' ? parsed.score : 0;
        return {
          score,
          status: calculateVerbStatus(score),
          lastPracticedAt: parsed.lastPracticedAt,
        };
      } catch {
        // ignore corrupted json
      }
    }

    return {
      score: 0,
      status: 'uncompleted',
    };
  },

  setCheckpointProgress(checkpointId: string, score: number): void {
    const clampedScore = Math.max(0, Math.min(100, score));
    const previousProgress = this.getCheckpointProgress(checkpointId);
    const bestScore = Math.max(previousProgress.score, clampedScore);
    const status = calculateVerbStatus(bestScore);
    const progressData: VerbProgress = {
      score: bestScore,
      status,
      lastPracticedAt: Date.now(),
    };
    checkpointStorage.set(checkpointId, JSON.stringify(progressData));
  },

  clearAllProgress(): void {
    // Used for tests and resets
  },
};
