import { QuizExercise } from '../services/quizGeneratorService';
import { isAnswerCorrect, normalizeGermanAnswer } from './answerValidation';

export interface AlignedSegment {
  segmentIndex: number;
  text: string;
  isGap: boolean;
  gapIndex?: number;
  isMatched: boolean;
  matchedText?: string;
}

export interface SpeechEvaluationResult {
  isCompleted: boolean;
  isCorrect: boolean;
  capturedAnswers: Record<number, string>;
  selectedAuxiliary?: 'haben' | 'sein';
  alignedSegments: AlignedSegment[];
}

/**
 * Tokenizes text into lowercase normalized words without punctuation.
 */
export function tokenizeSpeech(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[.,!?:;"'«»„“—–-]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * Evaluates speech transcript against any of the 5 quiz exercise types.
 */
export function evaluateSpeechForExercise(
  exercise: QuizExercise,
  transcript: string,
): SpeechEvaluationResult {
  if (!exercise) {
    return {
      isCompleted: false,
      isCorrect: false,
      capturedAnswers: {},
      alignedSegments: [],
    };
  }

  const spokenTokens = tokenizeSpeech(transcript);

  switch (exercise.type) {
    case 'verb_forms_fill':
      return evaluateVerbFormsSpeech(exercise, spokenTokens);
    case 'conjugation_fill':
      return evaluateConjugationSpeech(exercise, spokenTokens);
    case 'sentence_fill':
    case 'prefix_dual_slot':
    case 'preposition_fill':
    default:
      return evaluateSentenceSpeech(exercise, spokenTokens);
  }
}

/**
 * Evaluates sentence-based exercises (Sentence Fill, Prefix Dual Slot, Preposition Fill).
 */
function evaluateSentenceSpeech(
  exercise: QuizExercise,
  spokenTokens: string[],
): SpeechEvaluationResult {
  const alignedSegments: AlignedSegment[] = [];
  const capturedAnswers: Record<number, string> = {};

  let tokenIndex = 0;
  let correctGapsCount = 0;
  let totalGapsCount = 0;

  for (let segIdx = 0; segIdx < exercise.segments.length; segIdx++) {
    const segment = exercise.segments[segIdx];

    if (typeof segment.gapIndex === 'number') {
      const gapIdx = segment.gapIndex;
      const targetGap = exercise.gaps[gapIdx];
      const targetVal = targetGap?.correctValue || '';
      totalGapsCount++;

      // Inseparable prefix placeholder: requires no spoken word
      if (targetVal === '—' || targetVal === '-') {
        alignedSegments.push({
          segmentIndex: segIdx,
          text: '—',
          isGap: true,
          gapIndex: gapIdx,
          isMatched: true,
          matchedText: '—',
        });
        capturedAnswers[gapIdx] = '—';
        correctGapsCount++;
        continue;
      }

      // Target may be multi-word (e.g. 'auf den', 'in dem', 'rufe an')
      const targetTokens = tokenizeSpeech(targetVal);
      const targetTokenCount = Math.max(1, targetTokens.length);

      let matched = false;
      let matchedWord = '';

      // Try matching 1, 2, or 3 spoken tokens
      const candidateLengths = [targetTokenCount, 1, 2, 3].filter(
        (len, idx, arr) => arr.indexOf(len) === idx && tokenIndex + len <= spokenTokens.length,
      );

      for (const len of candidateLengths) {
        const candidate = spokenTokens.slice(tokenIndex, tokenIndex + len).join(' ');
        if (isAnswerCorrect(candidate, targetVal)) {
          matched = true;
          matchedWord = candidate;
          tokenIndex += len;
          break;
        }
      }

      if (matched) {
        alignedSegments.push({
          segmentIndex: segIdx,
          text: targetVal,
          isGap: true,
          gapIndex: gapIdx,
          isMatched: true,
          matchedText: matchedWord,
        });
        capturedAnswers[gapIdx] = matchedWord;
        correctGapsCount++;
      } else if (tokenIndex < spokenTokens.length) {
        // Gap attempted but incorrect
        const candidate = spokenTokens.slice(tokenIndex, tokenIndex + targetTokenCount).join(' ');
        alignedSegments.push({
          segmentIndex: segIdx,
          text: targetVal,
          isGap: true,
          gapIndex: gapIdx,
          isMatched: false,
          matchedText: candidate,
        });
        capturedAnswers[gapIdx] = candidate;
        tokenIndex += targetTokenCount;
      } else {
        // Not reached yet
        alignedSegments.push({
          segmentIndex: segIdx,
          text: targetVal,
          isGap: true,
          gapIndex: gapIdx,
          isMatched: false,
        });
      }
    } else {
      // Context text segment
      const rawText = segment.text || '';
      const textTokens = tokenizeSpeech(rawText);

      if (textTokens.length === 0) {
        // Punctuation only (e.g. ".")
        alignedSegments.push({
          segmentIndex: segIdx,
          text: rawText,
          isGap: false,
          isMatched: tokenIndex > 0,
        });
        continue;
      }

      let matched = false;

      // Lookahead up to 2 tokens in case user skipped or added filler
      const maxLookahead = Math.min(2, spokenTokens.length - tokenIndex);
      for (let offset = 0; offset <= maxLookahead; offset++) {
        const candidateSlice = spokenTokens.slice(
          tokenIndex + offset,
          tokenIndex + offset + textTokens.length,
        );
        const normCandidate = candidateSlice.map(normalizeGermanAnswer).join(' ');
        const normExpected = textTokens.map(normalizeGermanAnswer).join(' ');

        if (normCandidate === normExpected) {
          matched = true;
          tokenIndex += offset + textTokens.length;
          break;
        }
      }

      alignedSegments.push({
        segmentIndex: segIdx,
        text: rawText,
        isGap: false,
        isMatched: matched,
      });
    }
  }

  const isAllGapsFilled = Object.keys(capturedAnswers).length >= totalGapsCount;
  const isCorrect = totalGapsCount > 0 && correctGapsCount === totalGapsCount;
  const isCompleted = isAllGapsFilled || tokenIndex >= spokenTokens.length;

  return {
    isCompleted,
    isCorrect,
    capturedAnswers,
    alignedSegments,
  };
}

/**
 * Evaluates Verb Forms exercise (Infinitive - Präteritum - Auxiliary + Partizip II).
 * Accepts both full triad ("gehen ging ist gegangen") and forms ("ging ist gegangen").
 */
function evaluateVerbFormsSpeech(
  exercise: QuizExercise,
  spokenTokens: string[],
): SpeechEvaluationResult {
  const capturedAnswers: Record<number, string> = {};
  let selectedAuxiliary: 'haben' | 'sein' | undefined;
  const alignedSegments: AlignedSegment[] = [];

  const infinitive = exercise.verbFormsData?.infinitive || exercise.verbCard?.infinitive || '';
  const praeteritumTarget =
    exercise.verbFormsData?.correctPraeteritum || exercise.gaps[0]?.correctValue || '';

  const isThreeGaps = exercise.gaps.length >= 3;
  const partizipGapIndex = isThreeGaps ? 2 : 1;
  const partizipTarget =
    exercise.verbFormsData?.correctPartizipII ||
    exercise.gaps[partizipGapIndex]?.correctValue ||
    exercise.gaps[1]?.correctValue ||
    '';

  const expectedAuxiliaryWord =
    exercise.verbFormsData?.correctAuxiliary ||
    (isThreeGaps ? exercise.gaps[1]?.correctValue : '') ||
    (exercise.verbCard?.auxiliary === 'sein' ? 'ist' : 'hat');

  let tokenIndex = 0;

  // 1. Check if optional infinitive was spoken
  const infinitiveTokens = tokenizeSpeech(infinitive);
  if (infinitiveTokens.length > 0 && tokenIndex + infinitiveTokens.length <= spokenTokens.length) {
    const candidate = spokenTokens
      .slice(tokenIndex, tokenIndex + infinitiveTokens.length)
      .map(normalizeGermanAnswer)
      .join(' ');
    const normInfinitive = infinitiveTokens.map(normalizeGermanAnswer).join(' ');
    if (candidate === normInfinitive) {
      tokenIndex += infinitiveTokens.length;
    }
  }

  // 2. Parse Präteritum (Gap 0)
  const praeteritumTokens = tokenizeSpeech(praeteritumTarget);
  const praeteritumLen = Math.max(1, praeteritumTokens.length);

  let isPraeteritumCorrect = false;
  if (tokenIndex < spokenTokens.length) {
    const candidateLengths = [praeteritumLen, 1, 2].filter(
      len => tokenIndex + len <= spokenTokens.length,
    );
    for (const len of candidateLengths) {
      const candidate = spokenTokens.slice(tokenIndex, tokenIndex + len).join(' ');
      if (isAnswerCorrect(candidate, praeteritumTarget)) {
        isPraeteritumCorrect = true;
        capturedAnswers[0] = candidate;
        tokenIndex += len;
        break;
      }
    }

    if (!isPraeteritumCorrect && tokenIndex < spokenTokens.length) {
      const fallbackCandidate = spokenTokens
        .slice(tokenIndex, tokenIndex + praeteritumLen)
        .join(' ');
      capturedAnswers[0] = fallbackCandidate;
      tokenIndex += praeteritumLen;
    }
  }

  // 3. Parse Auxiliary ('hat' / 'ist')
  let isAuxiliaryCorrect = false;
  if (tokenIndex < spokenTokens.length) {
    const nextToken = spokenTokens[tokenIndex];
    if (nextToken === 'hat' || nextToken === 'ist') {
      selectedAuxiliary = nextToken === 'ist' ? 'sein' : 'haben';
      isAuxiliaryCorrect = nextToken === expectedAuxiliaryWord;
      if (isThreeGaps) {
        capturedAnswers[1] = nextToken;
      }
      tokenIndex++;
    }
  }

  // 4. Parse Partizip II
  const partizipTokens = tokenizeSpeech(partizipTarget);
  const partizipLen = Math.max(1, partizipTokens.length);

  let isPartizipCorrect = false;
  if (tokenIndex < spokenTokens.length) {
    const candidateLengths = [partizipLen, 1, 2].filter(
      len => tokenIndex + len <= spokenTokens.length,
    );
    for (const len of candidateLengths) {
      const candidate = spokenTokens.slice(tokenIndex, tokenIndex + len).join(' ');
      if (isAnswerCorrect(candidate, partizipTarget)) {
        isPartizipCorrect = true;
        capturedAnswers[partizipGapIndex] = candidate;
        tokenIndex += len;
        break;
      }
    }

    if (!isPartizipCorrect && tokenIndex < spokenTokens.length) {
      const fallbackCandidate = spokenTokens.slice(tokenIndex, tokenIndex + partizipLen).join(' ');
      capturedAnswers[partizipGapIndex] = fallbackCandidate;
      tokenIndex += partizipLen;
    }
  }

  alignedSegments.push({
    segmentIndex: 0,
    text: praeteritumTarget,
    isGap: true,
    gapIndex: 0,
    isMatched: isPraeteritumCorrect,
    matchedText: capturedAnswers[0],
  });

  let matchedAuxText: string | undefined;
  if (selectedAuxiliary === 'sein') {
    matchedAuxText = 'ist';
  } else if (selectedAuxiliary === 'haben') {
    matchedAuxText = 'hat';
  }

  alignedSegments.push({
    segmentIndex: 1,
    text: expectedAuxiliaryWord,
    isGap: isThreeGaps,
    gapIndex: isThreeGaps ? 1 : undefined,
    isMatched: isAuxiliaryCorrect,
    matchedText: matchedAuxText,
  });

  alignedSegments.push({
    segmentIndex: 2,
    text: partizipTarget,
    isGap: true,
    gapIndex: partizipGapIndex,
    isMatched: isPartizipCorrect,
    matchedText: capturedAnswers[partizipGapIndex],
  });

  const isCompleted =
    capturedAnswers[0] !== undefined &&
    selectedAuxiliary !== undefined &&
    capturedAnswers[partizipGapIndex] !== undefined;

  const isCorrect = isPraeteritumCorrect && isAuxiliaryCorrect && isPartizipCorrect;

  return {
    isCompleted,
    isCorrect,
    capturedAnswers,
    selectedAuxiliary,
    alignedSegments,
  };
}

const CONJUGATION_PRONOUNS = [
  ['ich'],
  ['du'],
  ['er', 'sie', 'es', 'er_sie_es'],
  ['wir'],
  ['ihr'],
  ['sie', 'sie_sie'],
];

/**
 * Evaluates Conjugation exercise (all 6 forms top to bottom).
 * Accepts both full recitation ("ich gehe, du gehst...") and verb forms only ("gehe, gehst...").
 */
function evaluateConjugationSpeech(
  exercise: QuizExercise,
  spokenTokens: string[],
): SpeechEvaluationResult {
  const capturedAnswers: Record<number, string> = {};
  const alignedSegments: AlignedSegment[] = [];

  let tokenIndex = 0;
  let correctCount = 0;

  for (let personIdx = 0; personIdx < 6; personIdx++) {
    const gap = exercise.gaps[personIdx];
    const targetVal = gap?.correctValue || '';
    const targetTokens = tokenizeSpeech(targetVal);
    const targetLen = Math.max(1, targetTokens.length);

    if (tokenIndex >= spokenTokens.length) {
      alignedSegments.push({
        segmentIndex: personIdx,
        text: targetVal,
        isGap: true,
        gapIndex: personIdx,
        isMatched: false,
      });
      continue;
    }

    // 1. Check if person pronoun was spoken (e.g. 'ich', 'du')
    const possiblePronouns = CONJUGATION_PRONOUNS[personIdx] || [];
    const currentToken = spokenTokens[tokenIndex];

    if (possiblePronouns.includes(currentToken)) {
      tokenIndex++;
    }

    // 2. Match verb form (1 or 2 tokens for separable prefixes like 'rufe an')
    let isMatched = false;
    let matchedCandidate = '';

    const candidateLengths = [targetLen, 1, 2].filter(
      len => tokenIndex + len <= spokenTokens.length,
    );

    for (const len of candidateLengths) {
      const candidate = spokenTokens.slice(tokenIndex, tokenIndex + len).join(' ');
      if (isAnswerCorrect(candidate, targetVal)) {
        isMatched = true;
        matchedCandidate = candidate;
        tokenIndex += len;
        break;
      }
    }

    if (isMatched) {
      correctCount++;
      capturedAnswers[personIdx] = matchedCandidate;
      alignedSegments.push({
        segmentIndex: personIdx,
        text: targetVal,
        isGap: true,
        gapIndex: personIdx,
        isMatched: true,
        matchedText: matchedCandidate,
      });
    } else if (tokenIndex < spokenTokens.length) {
      const fallbackCandidate = spokenTokens.slice(tokenIndex, tokenIndex + targetLen).join(' ');
      capturedAnswers[personIdx] = fallbackCandidate;
      tokenIndex += targetLen;
      alignedSegments.push({
        segmentIndex: personIdx,
        text: targetVal,
        isGap: true,
        gapIndex: personIdx,
        isMatched: false,
        matchedText: fallbackCandidate,
      });
    } else {
      alignedSegments.push({
        segmentIndex: personIdx,
        text: targetVal,
        isGap: true,
        gapIndex: personIdx,
        isMatched: false,
      });
    }
  }

  const isCompleted = Object.keys(capturedAnswers).length === 6;
  const isCorrect = correctCount === 6;

  return {
    isCompleted,
    isCorrect,
    capturedAnswers,
    alignedSegments,
  };
}
