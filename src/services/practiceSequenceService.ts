import { verbDataService } from './verbDataService';
import { VerbCard } from '../../docs/verb.types';

export interface PracticeNextTarget {
  type: 'verb' | 'checkpoint';
  infinitive?: string;
  level: string;
  checkpointId?: string;
  checkpointNumber?: number;
  fromIndex?: number;
  toIndex?: number;
  infinitives?: string[];
}

export interface CurrentPracticeParams {
  infinitive?: string;
  level?: string;
  isCheckpoint?: boolean;
  checkpointId?: string;
}

type PracticeSequenceItem =
  | {
      type: 'verb';
      infinitive: string;
      level: string;
      globalIndex: number;
    }
  | {
      type: 'checkpoint';
      checkpointId: string;
      checkpointNumber: number;
      fromIndex: number;
      toIndex: number;
      level: string;
      infinitives: string[];
    };

export async function buildPracticeSequence(): Promise<PracticeSequenceItem[]> {
  const allVerbs = await verbDataService.getVerbsOrderedByDifficulty();

  // Group by level and unique infinitive preserving difficulty order
  const uniqueVerbs: { infinitive: string; level: string }[] = [];
  const seenInfinitives = new Set<string>();

  allVerbs.forEach((verb: VerbCard) => {
    if (!seenInfinitives.has(verb.infinitive)) {
      seenInfinitives.add(verb.infinitive);
      uniqueVerbs.push({ infinitive: verb.infinitive, level: verb.level });
    }
  });

  const sequence: PracticeSequenceItem[] = [];
  let currentBatch: { infinitive: string; level: string }[] = [];

  uniqueVerbs.forEach((verbItem, index) => {
    const globalIndex = index + 1;
    sequence.push({
      type: 'verb',
      infinitive: verbItem.infinitive,
      level: verbItem.level,
      globalIndex,
    });

    currentBatch.push(verbItem);

    if (globalIndex % 10 === 0) {
      const checkpointNumber = globalIndex / 10;
      const checkpointId = `checkpoint-${checkpointNumber}`;
      const fromIndex = (checkpointNumber - 1) * 10 + 1;
      const toIndex = checkpointNumber * 10;

      sequence.push({
        type: 'checkpoint',
        checkpointId,
        checkpointNumber,
        fromIndex,
        toIndex,
        level: verbItem.level,
        infinitives: currentBatch.map(v => v.infinitive),
      });

      currentBatch = [];
    }
  });

  return sequence;
}

export async function getNextPracticeTarget(
  current: CurrentPracticeParams,
): Promise<PracticeNextTarget | null> {
  const sequence = await buildPracticeSequence();
  if (sequence.length === 0) return null;

  let currentIndex = -1;

  if (current.isCheckpoint && current.checkpointId) {
    currentIndex = sequence.findIndex(
      item => item.type === 'checkpoint' && item.checkpointId === current.checkpointId,
    );
  } else if (current.infinitive) {
    currentIndex = sequence.findIndex(
      item =>
        item.type === 'verb' && item.infinitive.toLowerCase() === current.infinitive?.toLowerCase(),
    );
  }

  if (currentIndex === -1 || currentIndex + 1 >= sequence.length) {
    return null;
  }

  const nextItem = sequence[currentIndex + 1];

  if (nextItem.type === 'checkpoint') {
    return {
      type: 'checkpoint',
      level: nextItem.level,
      checkpointId: nextItem.checkpointId,
      checkpointNumber: nextItem.checkpointNumber,
      fromIndex: nextItem.fromIndex,
      toIndex: nextItem.toIndex,
      infinitives: nextItem.infinitives,
    };
  }

  return {
    type: 'verb',
    infinitive: nextItem.infinitive,
    level: nextItem.level,
  };
}
