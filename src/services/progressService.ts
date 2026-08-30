import { createStorage } from './storageService';

export type VerbProgressStatus = 'uncompleted' | 'bronze' | 'silver' | 'trophy';

export interface VerbProgress {
  score: number;
  status: VerbProgressStatus;
  lastPracticedAt?: number;
}

const progressStorage = createStorage('verb_progress');

export function calculateVerbStatus(score: number): VerbProgressStatus {
  if (score <= 0) return 'uncompleted';
  if (score < 75) return 'bronze';
  if (score < 100) return 'silver';
  return 'trophy';
}

export const progressService = {
  getVerbProgress(verbId: string): VerbProgress {
    const rawData = progressStorage.getString(verbId);
    if (!rawData) {
      return { score: 0, status: 'uncompleted' };
    }
    try {
      const parsed = JSON.parse(rawData);
      const score = typeof parsed.score === 'number' ? parsed.score : 0;
      return {
        score,
        status: calculateVerbStatus(score),
        lastPracticedAt: parsed.lastPracticedAt,
      };
    } catch {
      return { score: 0, status: 'uncompleted' };
    }
  },

  setVerbProgress(verbId: string, score: number): void {
    const clampedScore = Math.max(0, Math.min(100, score));
    const status = calculateVerbStatus(clampedScore);
    const progressData: VerbProgress = {
      score: clampedScore,
      status,
      lastPracticedAt: Date.now(),
    };
    progressStorage.set(verbId, JSON.stringify(progressData));
  },

  clearAllProgress(): void {
    // Used for tests and resets
  },
};
