import { progressService, calculateVerbStatus } from '../services/progressService';

describe('progressService', () => {
  it('should calculate correct status for different score ranges', () => {
    // 0..3 of 6 correct (< 60%) -> uncompleted
    expect(calculateVerbStatus(0)).toBe('uncompleted');
    expect(calculateVerbStatus(-10)).toBe('uncompleted');
    expect(calculateVerbStatus(33)).toBe('uncompleted');
    expect(calculateVerbStatus(50)).toBe('uncompleted');
    expect(calculateVerbStatus(59)).toBe('uncompleted');

    // 4 of 6 correct (60..79%, ~67%) -> bronze
    expect(calculateVerbStatus(60)).toBe('bronze');
    expect(calculateVerbStatus(67)).toBe('bronze');
    expect(calculateVerbStatus(79)).toBe('bronze');

    // 5 of 6 correct (80..99%, ~83%) -> silver
    expect(calculateVerbStatus(80)).toBe('silver');
    expect(calculateVerbStatus(83)).toBe('silver');
    expect(calculateVerbStatus(99)).toBe('silver');

    // 6 of 6 correct (100%) -> trophy
    expect(calculateVerbStatus(100)).toBe('trophy');
  });

  it('should default to uncompleted with 0 score when no progress saved', () => {
    const progress = progressService.getVerbProgress('non_existent_verb');
    expect(progress.score).toBe(0);
    expect(progress.status).toBe('uncompleted');
  });

  it('should save and retrieve verb progress accurately while preserving highest score', () => {
    progressService.setVerbProgress('anrufen', 83);
    const progress = progressService.getVerbProgress('anrufen');
    expect(progress.score).toBe(83);
    expect(progress.status).toBe('silver');
    expect(progress.lastPracticedAt).toBeDefined();

    progressService.setVerbProgress('anrufen', 100);
    const perfectProgress = progressService.getVerbProgress('anrufen');
    expect(perfectProgress.score).toBe(100);
    expect(perfectProgress.status).toBe('trophy');

    // Retain best score if lower score achieved on retry
    progressService.setVerbProgress('anrufen', 67);
    const retainedProgress = progressService.getVerbProgress('anrufen');
    expect(retainedProgress.score).toBe(100);
    expect(retainedProgress.status).toBe('trophy');
  });

  it('should seamlessly match progress between umlauts and transliterated keys (können <-> koennen)', () => {
    progressService.setVerbProgress('können', 100);
    const progressFromTransliterated = progressService.getVerbProgress('koennen');
    expect(progressFromTransliterated.score).toBe(100);
    expect(progressFromTransliterated.status).toBe('trophy');

    const progressFromUmlaut = progressService.getVerbProgress('können');
    expect(progressFromUmlaut.score).toBe(100);
    expect(progressFromUmlaut.status).toBe('trophy');
  });

  it('should track sentence attempts, successes, and errors accurately', () => {
    const sentenceKey = 'anrufen_s1';
    expect(progressService.getSentenceStats(sentenceKey)).toEqual({
      attempts: 0,
      correct: 0,
      incorrect: 0,
    });

    progressService.recordSentenceResult(sentenceKey, false);
    progressService.recordSentenceResult(sentenceKey, false);
    expect(progressService.getSentenceStats(sentenceKey)).toEqual({
      attempts: 2,
      correct: 0,
      incorrect: 2,
    });

    progressService.recordSentenceResult(sentenceKey, true);
    expect(progressService.getSentenceStats(sentenceKey)).toEqual({
      attempts: 3,
      correct: 1,
      incorrect: 2,
    });
  });

  it('should save and retrieve checkpoint progress preserving highest score', () => {
    const checkpointId = 'checkpoint-1';
    expect(progressService.getCheckpointProgress(checkpointId).status).toBe('uncompleted');

    progressService.setCheckpointProgress(checkpointId, 70);
    const bronzeProgress = progressService.getCheckpointProgress(checkpointId);
    expect(bronzeProgress.score).toBe(70);
    expect(bronzeProgress.status).toBe('bronze');

    progressService.setCheckpointProgress(checkpointId, 100);
    const trophyProgress = progressService.getCheckpointProgress(checkpointId);
    expect(trophyProgress.score).toBe(100);
    expect(trophyProgress.status).toBe('trophy');

    // Retain higher score on retry
    progressService.setCheckpointProgress(checkpointId, 50);
    const retainedProgress = progressService.getCheckpointProgress(checkpointId);
    expect(retainedProgress.score).toBe(100);
    expect(retainedProgress.status).toBe('trophy');
  });
});
