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
  const levelMap = new Map<string, { infinitive: string; level: string }[]>();
  const seenInfinitives = new Set<string>();

  allVerbs.forEach((verb: VerbCard) => {
    if (!seenInfinitives.has(verb.infinitive)) {
      seenInfinitives.add(verb.infinitive);
      if (!levelMap.has(verb.level)) {
        levelMap.set(verb.level, []);
      }
      levelMap.get(verb.level)!.push({ infinitive: verb.infinitive, level: verb.level });
    }
  });

  const sequence: PracticeSequenceItem[] = [];

  levelMap.forEach((verbs, level) => {
    let currentBatch: { infinitive: string; level: string }[] = [];

    verbs.forEach((verbItem, index) => {
      const levelIndex = index + 1;
      sequence.push({
        type: 'verb',
        infinitive: verbItem.infinitive,
        level: verbItem.level,
        globalIndex: levelIndex,
      });

      currentBatch.push(verbItem);

      if (levelIndex % 10 === 0) {
        const checkpointNumber = levelIndex / 10;
        const checkpointId = `checkpoint-${level.toLowerCase()}-${checkpointNumber}`;
        const fromIndex = (checkpointNumber - 1) * 10 + 1;
        const toIndex = checkpointNumber * 10;

        sequence.push({
          type: 'checkpoint',
          checkpointId,
          checkpointNumber,
          fromIndex,
          toIndex,
          level,
          infinitives: currentBatch.map(v => v.infinitive),
        });

        currentBatch = [];
      }
    });

    if (verbs.length > 0) {
      const finalCheckpointId = `checkpoint-${level.toLowerCase()}-final`;
      sequence.push({
        type: 'checkpoint',
        checkpointId: finalCheckpointId,
        checkpointNumber: Math.ceil(verbs.length / 10),
        fromIndex: 1,
        toIndex: verbs.length,
        level,
        infinitives: verbs.map(v => v.infinitive),
      });
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
      item => item?.type === 'checkpoint' && item.checkpointId === current.checkpointId,
    );
  } else if (current.infinitive) {
    currentIndex = sequence.findIndex(
      item =>
        item?.type === 'verb' &&
        item.infinitive?.toLowerCase() === current.infinitive?.toLowerCase(),
    );
  }

  if (currentIndex === -1 || currentIndex + 1 >= sequence.length) {
    return null;
  }

  const nextItem = sequence[currentIndex + 1];

  if (nextItem?.type === 'checkpoint') {
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
