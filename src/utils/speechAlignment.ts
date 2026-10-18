import { QuizExercise } from '../services/quizGeneratorService';
import { isAnswerCorrect, normalizeGermanAnswer } from './answerValidation';

export interface AlignedSegment {
  segmentIndex: number;
  text: string;
  isGap: boolean;
  gapIndex?: number;
  isMatched: boolean;
  matchedWordsCount?: number;
  matchedText?: string;
}

export interface SpeechEvaluationResult {
  isCompleted: boolean;
  isCorrect: boolean;
  capturedAnswers: Record<number, string>;
  selectedAuxiliary?: 'haben' | 'sein';
  alignedSegments: AlignedSegment[];
  matchedPronounIndices?: number[];
  isInfinitiveMatched?: boolean;
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

      let matchedWordsCount = 0;

      for (const expectedToken of textTokens) {
        if (tokenIndex >= spokenTokens.length) break;
        const normExpected = normalizeGermanAnswer(expectedToken);
        const maxLookahead = Math.min(2, spokenTokens.length - tokenIndex - 1);
        let wordFound = false;

        for (let offset = 0; offset <= maxLookahead; offset++) {
          const normCandidate = normalizeGermanAnswer(spokenTokens[tokenIndex + offset]);
          if (normCandidate === normExpected) {
            wordFound = true;
            tokenIndex += offset + 1;
            matchedWordsCount++;
            break;
          }
        }

        if (!wordFound) {
          break;
        }
      }

      alignedSegments.push({
        segmentIndex: segIdx,
        text: rawText,
        isGap: false,
        isMatched: matchedWordsCount === textTokens.length && textTokens.length > 0,
        matchedWordsCount,
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

const SUBJECT_PRONOUNS_SET = new Set(['ich', 'du', 'er', 'sie', 'es', 'wir', 'ihr']);
const REFLEXIVE_PRONOUNS_SET = new Set(['mich', 'dich', 'sich', 'uns', 'euch', 'mir', 'dir']);
const PRONOUN_CONNECTORS_SET = new Set(['oder', 'und']);

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
  let isInfinitiveMatched = false;

  // 1. Check if optional infinitive was spoken (full or without 'sich')
  const infinitiveTokens = tokenizeSpeech(infinitive);
  const baseInfinitive = infinitive
    .replace(/^(sich|mich|dich)\s+/i, '')
    .replace(/\s+sich$/i, '')
    .trim();
  const baseInfinitiveTokens = tokenizeSpeech(baseInfinitive);
  const praeteritumTokens = tokenizeSpeech(praeteritumTarget);
  const normPraet = praeteritumTokens.map(normalizeGermanAnswer).join(' ');

  if (infinitiveTokens.length > 0 && tokenIndex + infinitiveTokens.length <= spokenTokens.length) {
    const candidate = spokenTokens
      .slice(tokenIndex, tokenIndex + infinitiveTokens.length)
      .map(normalizeGermanAnswer)
      .join(' ');
    const normInfinitive = infinitiveTokens.map(normalizeGermanAnswer).join(' ');
    if (candidate === normInfinitive && normInfinitive !== normPraet) {
      isInfinitiveMatched = true;
      tokenIndex += infinitiveTokens.length;
    }
  }

  if (
    !isInfinitiveMatched &&
    baseInfinitiveTokens.length > 0 &&
    tokenIndex + baseInfinitiveTokens.length <= spokenTokens.length
  ) {
    const candidate = spokenTokens
      .slice(tokenIndex, tokenIndex + baseInfinitiveTokens.length)
      .map(normalizeGermanAnswer)
      .join(' ');
    const normBaseInf = baseInfinitiveTokens.map(normalizeGermanAnswer).join(' ');
    if (candidate === normBaseInf && normBaseInf !== normPraet) {
      isInfinitiveMatched = true;
      tokenIndex += baseInfinitiveTokens.length;
    }
  }

  // Skip optional 3rd person pronoun ('er' / 'sie' / 'es') before Präteritum
  while (
    tokenIndex < spokenTokens.length &&
    ['er', 'sie', 'es'].includes(spokenTokens[tokenIndex])
  ) {
    tokenIndex++;
  }

  const praeteritumLen = Math.max(1, praeteritumTokens.length);
  const partizipTokens = tokenizeSpeech(partizipTarget);
  const partizipLen = Math.max(1, partizipTokens.length);

  let isPraeteritumCorrect = false;
  let isAuxiliaryCorrect = false;
  let isPartizipCorrect = false;

  // Find auxiliary ('hat' or 'ist') after at least 1 Präteritum token
  let auxIdx = -1;
  for (let i = tokenIndex + 1; i < spokenTokens.length; i++) {
    if (spokenTokens[i] === 'hat' || spokenTokens[i] === 'ist') {
      auxIdx = i;
      break;
    }
  }

  if (auxIdx !== -1) {
    // Tokens between tokenIndex and auxIdx belong to Präteritum (excluding trailing 'er'/'sie'/'es' before aux)
    let praetEnd = auxIdx;
    while (praetEnd > tokenIndex + 1 && ['er', 'sie', 'es'].includes(spokenTokens[praetEnd - 1])) {
      praetEnd--;
    }
    const spokenPraetSlice = spokenTokens.slice(tokenIndex, praetEnd);
    const fullSpokenPraet = spokenPraetSlice.join(' ');

    if (isAnswerCorrect(fullSpokenPraet, praeteritumTarget)) {
      isPraeteritumCorrect = true;
      capturedAnswers[0] = fullSpokenPraet;
    } else {
      // Also check if the last `praeteritumLen` tokens before aux match (in case user said extra words at start)
      const tailSlice = spokenPraetSlice.slice(-praeteritumLen).join(' ');
      if (isAnswerCorrect(tailSlice, praeteritumTarget)) {
        isPraeteritumCorrect = true;
        capturedAnswers[0] = tailSlice;
      } else {
        capturedAnswers[0] = fullSpokenPraet;
      }
    }

    // Auxiliary at auxIdx
    const auxToken = spokenTokens[auxIdx];
    selectedAuxiliary = auxToken === 'ist' ? 'sein' : 'haben';
    isAuxiliaryCorrect = auxToken === expectedAuxiliaryWord;
    if (isThreeGaps) {
      capturedAnswers[1] = auxToken;
    }

    // Tokens after auxIdx belong to Partizip II
    const partStart = auxIdx + 1;
    if (partStart < spokenTokens.length) {
      const candidateLengths = Array.from(new Set([partizipLen, 2, 1])).filter(
        len => partStart + len <= spokenTokens.length,
      );
      for (const len of candidateLengths) {
        const candidate = spokenTokens.slice(partStart, partStart + len).join(' ');
        if (isAnswerCorrect(candidate, partizipTarget)) {
          isPartizipCorrect = true;
          capturedAnswers[partizipGapIndex] = candidate;
          break;
        }
      }
      if (!isPartizipCorrect) {
        const fallbackPart = spokenTokens.slice(partStart, partStart + partizipLen).join(' ');
        capturedAnswers[partizipGapIndex] = fallbackPart;
      }
    }
  } else {
    // No 'hat' / 'ist' spoken yet — parse Präteritum from tokenIndex
    if (tokenIndex < spokenTokens.length) {
      const candidateLengths = Array.from(new Set([praeteritumLen, 2, 1])).filter(
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

    // If more tokens follow without 'hat'/'ist', check if they match Partizip II
    if (tokenIndex < spokenTokens.length) {
      const candidateLengths = Array.from(new Set([partizipLen, 2, 1])).filter(
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
        const fallbackCandidate = spokenTokens
          .slice(tokenIndex, tokenIndex + partizipLen)
          .join(' ');
        capturedAnswers[partizipGapIndex] = fallbackCandidate;
        tokenIndex += partizipLen;
      }
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
    isInfinitiveMatched,
  };
}

const CONJUGATION_NOISE_TOKENS = new Set([
  // Subject pronouns
  'ich',
  'du',
  'er',
  'sie',
  'es',
  'wir',
  'ihr',
  'man',
  // Reflexive pronouns
  'mich',
  'dich',
  'sich',
  'uns',
  'euch',
  'mir',
  'dir',
  // Connectors & spoken punctuation
  'oder',
  'und',
  'komma',
  'punkt',
  'strich',
  'schrägstrich',
  'schraegstrich',
  // Common German ASR sound-alikes for 'ich', 'du', 'er', 'sie', 'es', 'wir', 'ihr'
  'der',
  'die',
  'das',
  'den',
  'dem',
  'des',
  'ein',
  'eine',
  'einer',
  'einem',
  'einen',
  's',
  'eh',
  'äh',
  'ähm',
  'hm',
  'na',
  'ja',
  'herr',
  'he',
  'so',
  'zu',
  'da',
  'hier',
  'vier',
  'wie',
  'wo',
  'wer',
  'ist',
  'is',
]);

/**
 * Evaluates Conjugation exercise (all 6 forms top to bottom).
 * Extracts spoken verb forms strictly sequentially (slots 0..5) while ignoring
 * pronouns ("ich", "du", "er/sie/es", "wir", "ihr", "sie") and ASR pronoun noise.
 */
function evaluateConjugationSpeech(
  exercise: QuizExercise,
  spokenTokens: string[],
): SpeechEvaluationResult {
  const capturedAnswers: Record<number, string> = {};
  const matchedByPerson: Record<number, boolean> = {};
  const alignedSegments: AlignedSegment[] = [];
  const matchedPronounIndices: number[] = [];

  // Collect all valid target tokens for this verb so we never filter out a real target token (e.g. 'ist' for 'sein')
  const targetTokensSet = new Set<string>();
  exercise.gaps.forEach(gap => {
    tokenizeSpeech(gap.correctValue || '').forEach(tok => {
      targetTokensSet.add(tok);
      targetTokensSet.add(normalizeGermanAnswer(tok));
    });
  });

  const isPronounOrNoise = (token: string, allowReflexive = false): boolean => {
    if (allowReflexive && REFLEXIVE_PRONOUNS_SET.has(token)) {
      return false;
    }
    if (
      SUBJECT_PRONOUNS_SET.has(token) ||
      REFLEXIVE_PRONOUNS_SET.has(token) ||
      PRONOUN_CONNECTORS_SET.has(token)
    ) {
      return true;
    }
    if (targetTokensSet.has(token) || targetTokensSet.has(normalizeGermanAnswer(token))) {
      return false;
    }
    if (token.length <= 1 || CONJUGATION_NOISE_TOKENS.has(token)) {
      return true;
    }
    return false;
  };

  let tokenIndex = 0;

  // Skip optional infinitive at the start if followed by 'ich'
  const infinitive = exercise.verbCard?.infinitive || '';
  const infTokens = tokenizeSpeech(infinitive);
  if (
    infTokens.length > 0 &&
    tokenIndex + infTokens.length < spokenTokens.length &&
    spokenTokens[tokenIndex + infTokens.length] === 'ich'
  ) {
    const candidateInf = spokenTokens
      .slice(tokenIndex, tokenIndex + infTokens.length)
      .map(normalizeGermanAnswer)
      .join(' ');
    const normInf = infTokens.map(normalizeGermanAnswer).join(' ');
    if (candidateInf === normInf) {
      tokenIndex += infTokens.length;
    }
  }

  for (let personIdx = 0; personIdx < 6; personIdx++) {
    // 1. Skip all pronoun and noise tokens before the verb for this slot
    let sawPronounBeforeSlot = false;
    while (tokenIndex < spokenTokens.length && isPronounOrNoise(spokenTokens[tokenIndex], false)) {
      sawPronounBeforeSlot = true;
      tokenIndex++;
    }

    if (sawPronounBeforeSlot && !matchedPronounIndices.includes(personIdx)) {
      matchedPronounIndices.push(personIdx);
    }

    // If user has only spoken the pronoun(s) so far (e.g. "er sie es"), wait for the verb
    if (tokenIndex >= spokenTokens.length) {
      break;
    }

    // 2. Extract the verb form for `personIdx` in strict sequential order (0 -> 1 -> 2 -> 3 -> 4 -> 5)
    const gap = exercise.gaps[personIdx];
    const row = exercise.conjugationRows?.[personIdx];
    const targetVal = gap?.correctValue || '';
    const targetTokens = tokenizeSpeech(targetVal);
    const targetLen = Math.max(1, targetTokens.length);
    const targetHasInternalReflexive =
      !row?.reflexivePronoun && targetTokens.some(tok => REFLEXIVE_PRONOUNS_SET.has(tok));

    let isMatched = false;
    let matchedCandidate = '';

    const candidateLengths = Array.from(new Set([targetLen, 2, 1, 3])).filter(
      len => tokenIndex + len <= spokenTokens.length,
    );

    for (const len of candidateLengths) {
      const slice = spokenTokens.slice(tokenIndex, tokenIndex + len);
      if (slice.some(tok => isPronounOrNoise(tok, targetHasInternalReflexive))) {
        continue;
      }
      const candidate = slice.join(' ');
      if (isAnswerCorrect(candidate, targetVal)) {
        isMatched = true;
        matchedCandidate = candidate;
        tokenIndex += len;
        break;
      }
    }

    if (isMatched) {
      capturedAnswers[personIdx] = matchedCandidate;
      matchedByPerson[personIdx] = true;
      if (!matchedPronounIndices.includes(personIdx)) {
        matchedPronounIndices.push(personIdx);
      }
    } else {
      const fallbackTokens: string[] = [];
      while (
        fallbackTokens.length < targetLen &&
        tokenIndex < spokenTokens.length &&
        !isPronounOrNoise(spokenTokens[tokenIndex], targetHasInternalReflexive)
      ) {
        fallbackTokens.push(spokenTokens[tokenIndex]);
        tokenIndex++;
      }
      if (fallbackTokens.length > 0) {
        capturedAnswers[personIdx] = fallbackTokens.join(' ');
        matchedByPerson[personIdx] = false;
        if (!matchedPronounIndices.includes(personIdx)) {
          matchedPronounIndices.push(personIdx);
        }
      }
    }

    // 3. Skip any trailing reflexive pronoun spoken right after the verb
    while (
      tokenIndex < spokenTokens.length &&
      REFLEXIVE_PRONOUNS_SET.has(spokenTokens[tokenIndex])
    ) {
      tokenIndex++;
    }
  }

  let correctCount = 0;
  for (let personIdx = 0; personIdx < 6; personIdx++) {
    const gap = exercise.gaps[personIdx];
    const targetVal = gap?.correctValue || '';
    const isMatched = Boolean(matchedByPerson[personIdx]);
    if (isMatched) {
      correctCount++;
    }
    alignedSegments.push({
      segmentIndex: personIdx,
      text: targetVal,
      isGap: true,
      gapIndex: personIdx,
      isMatched,
      matchedText: capturedAnswers[personIdx],
    });
  }

  const isCompleted = Object.keys(capturedAnswers).length === 6;
  const isCorrect = correctCount === 6;

  return {
    isCompleted,
    isCorrect,
    capturedAnswers,
    alignedSegments,
    matchedPronounIndices,
  };
}
