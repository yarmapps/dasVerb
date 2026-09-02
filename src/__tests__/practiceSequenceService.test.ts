import { buildPracticeSequence, getNextPracticeTarget } from '../services/practiceSequenceService';
import { verbDataService } from '../services/verbDataService';
import { VerbCard } from '../../docs/verb.types';

describe('practiceSequenceService', () => {
  const createMockVerb = (infinitive: string, level: 'A1' | 'A2' = 'A1', rank = 1): VerbCard => ({
    id: infinitive,
    infinitive,
    level,
    frequency_rank: rank,
    auxiliary: 'haben',
    morphology: {
      verb_class: 'weak',
      prefix_type: 'none',
      prefix: null,
      is_reflexive: false,
      reflexive_case: null,
    },
    principal_parts: {
      infinitive,
      present_3sg: `${infinitive}t`,
      praeteritum_3sg: `${infinitive}te`,
      partizip_2: `ge${infinitive}t`,
    },
    conjugation: {
      present: {
        ich: `${infinitive}e`,
        du: `${infinitive}st`,
        er_sie_es: `${infinitive}t`,
        wir: `${infinitive}en`,
        ihr: `${infinitive}t`,
        sie_Sie: `${infinitive}en`,
      },
    },
    rektion: {
      requires_object: false,
      direct_case: null,
      preposition: null,
      preposition_case: null,
    },
    sentences: [],
    translation: { ru: infinitive, en: infinitive },
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should build sequence with checkpoints every 10 verbs', async () => {
    const mockVerbs = Array.from({ length: 15 }, (_, i) =>
      createMockVerb(`verb_${i + 1}`, 'A1', i + 1),
    );
    jest.spyOn(verbDataService, 'getVerbsOrderedByDifficulty').mockResolvedValue(mockVerbs);

    const sequence = await buildPracticeSequence();
    // 15 verbs + 1 checkpoint (after 10) = 16 items
    expect(sequence.length).toBe(16);
    expect(sequence[9].type).toBe('verb');
    expect(sequence[10].type).toBe('checkpoint');
    if (sequence[10].type === 'checkpoint') {
      expect(sequence[10].checkpointId).toBe('checkpoint-1');
      expect(sequence[10].fromIndex).toBe(1);
      expect(sequence[10].toIndex).toBe(10);
      expect(sequence[10].infinitives.length).toBe(10);
    }
    expect(sequence[11].type).toBe('verb');
    if (sequence[11].type === 'verb') {
      expect(sequence[11].infinitive).toBe('verb_11');
    }
  });

  it('should get next practice target for regular verb', async () => {
    const mockVerbs = Array.from({ length: 12 }, (_, i) =>
      createMockVerb(`verb_${i + 1}`, 'A1', i + 1),
    );
    jest.spyOn(verbDataService, 'getVerbsOrderedByDifficulty').mockResolvedValue(mockVerbs);

    // From verb_1 -> next is verb_2
    const nextAfter1 = await getNextPracticeTarget({ infinitive: 'verb_1', level: 'A1' });
    expect(nextAfter1).toEqual({
      type: 'verb',
      infinitive: 'verb_2',
      level: 'A1',
    });

    // From verb_10 -> next is checkpoint-1
    const nextAfter10 = await getNextPracticeTarget({ infinitive: 'verb_10', level: 'A1' });
    expect(nextAfter10?.type).toBe('checkpoint');
    if (nextAfter10?.type === 'checkpoint') {
      expect(nextAfter10.checkpointId).toBe('checkpoint-1');
      expect(nextAfter10.checkpointNumber).toBe(1);
    }
  });

  it('should get next practice target after checkpoint', async () => {
    const mockVerbs = Array.from({ length: 15 }, (_, i) =>
      createMockVerb(`verb_${i + 1}`, 'A1', i + 1),
    );
    jest.spyOn(verbDataService, 'getVerbsOrderedByDifficulty').mockResolvedValue(mockVerbs);

    const nextAfterCp1 = await getNextPracticeTarget({
      isCheckpoint: true,
      checkpointId: 'checkpoint-1',
    });
    expect(nextAfterCp1).toEqual({
      type: 'verb',
      infinitive: 'verb_11',
      level: 'A1',
    });
  });

  it('should return null when already on the last item', async () => {
    const mockVerbs = [createMockVerb('verb_1', 'A1', 1)];
    jest.spyOn(verbDataService, 'getVerbsOrderedByDifficulty').mockResolvedValue(mockVerbs);

    const nextAfterLast = await getNextPracticeTarget({ infinitive: 'verb_1', level: 'A1' });
    expect(nextAfterLast).toBeNull();
  });
});
