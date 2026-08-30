import { progressService, calculateVerbStatus } from '../services/progressService';

describe('progressService', () => {
  it('should calculate correct status for different score ranges', () => {
    expect(calculateVerbStatus(0)).toBe('uncompleted');
    expect(calculateVerbStatus(-10)).toBe('uncompleted');
    expect(calculateVerbStatus(1)).toBe('bronze');
    expect(calculateVerbStatus(50)).toBe('bronze');
    expect(calculateVerbStatus(74)).toBe('bronze');
    expect(calculateVerbStatus(75)).toBe('silver');
    expect(calculateVerbStatus(90)).toBe('silver');
    expect(calculateVerbStatus(99)).toBe('silver');
    expect(calculateVerbStatus(100)).toBe('trophy');
  });

  it('should default to uncompleted with 0 score when no progress saved', () => {
    const progress = progressService.getVerbProgress('non_existent_verb');
    expect(progress.score).toBe(0);
    expect(progress.status).toBe('uncompleted');
  });

  it('should save and retrieve verb progress accurately', () => {
    progressService.setVerbProgress('anrufen', 85);
    const progress = progressService.getVerbProgress('anrufen');
    expect(progress.score).toBe(85);
    expect(progress.status).toBe('silver');
    expect(progress.lastPracticedAt).toBeDefined();

    progressService.setVerbProgress('anrufen', 100);
    const perfectProgress = progressService.getVerbProgress('anrufen');
    expect(perfectProgress.score).toBe(100);
    expect(perfectProgress.status).toBe('trophy');
  });
});
