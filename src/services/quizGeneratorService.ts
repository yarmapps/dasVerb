import { VerbCard, VerbSentence, Tense } from '../../docs/verb.types';
import { progressService, SentenceProgressStats } from './progressService';

export interface QuizGap {
  id: string;
  correctValue: string;
  options: string[];
}

export interface SentenceSegment {
  text?: string;
  gapIndex?: number;
}

export interface PrefixGrammarHintData {
  prefix: string;
  prefixType: 'separable' | 'inseparable' | 'dual';
  infinitive: string;
  ruleExplanationKey: string;
}

export interface ConjugationRowData {
  pronoun: string;
  gapIndex: number;
  correctValue: string;
  reflexivePronoun?: string;
}

export interface ConjugationGrammarHintData {
  infinitive: string;
  rootVowelChange?: 'e -> i' | 'e -> ie' | 'a -> ä' | 'au -> äu' | null;
  ruleExplanationKey?: string;
}

export interface QuizExercise {
  id: string;
  type?: 'sentence_fill' | 'prefix_dual_slot' | 'conjugation_fill';
  label: string;
  tense: Tense;
  verbCard: VerbCard;
  sentence: VerbSentence;
  segments: SentenceSegment[];
  gaps: QuizGap[];
  translation: Record<string, string>;
  grammarHint?: PrefixGrammarHintData;
  conjugationRows?: ConjugationRowData[];
  conjugationGrammarHint?: ConjugationGrammarHintData;
}

const COMMON_PREFIXES = [
  'an',
  'auf',
  'aus',
  'ein',
  'mit',
  'ab',
  'zu',
  'nach',
  'vor',
  'bei',
  'weg',
  'zurück',
];

const COMMON_PREPOSITIONS = [
  'in',
  'an',
  'auf',
  'mit',
  'nach',
  'zu',
  'aus',
  'von',
  'bei',
  'über',
  'für',
  'um',
];

const PREFIX_RULE_MAP: Record<'separable' | 'inseparable' | 'dual', string> = {
  separable: 'prefixGrammarHint.separableRule',
  inseparable: 'prefixGrammarHint.inseparableRule',
  dual: 'prefixGrammarHint.dualRule',
};

export const AUXILIARY_DISTRACTORS_MAP: Record<string, string[]> = {
  // Standalone Present auxiliaries (haben / sein)
  habe: ['bin', 'hat', 'sind'],
  bin: ['habe', 'ist', 'sind'],

  hast: ['bist', 'hat', 'ist'],
  bist: ['hast', 'ist', 'hat'],

  hat: ['ist', 'habe', 'sind'],
  ist: ['hat', 'bin', 'habe'],

  haben: ['sind', 'hat', 'seid'],
  sind: ['haben', 'ist', 'seid'],

  habt: ['seid', 'haben', 'sind'],
  seid: ['habt', 'sind', 'haben'],

  // Reflexive Present auxiliaries
  'habe mich': ['bin mich', 'hat sich', 'sind uns'],
  'hast dich': ['bist dich', 'hat sich', 'ist sich'],
  'hat sich': ['ist sich', 'habe mich', 'sind sich'],
  'haben uns': ['sind uns', 'hat sich', 'seid euch'],
  'habt euch': ['seid euch', 'haben uns', 'sind sich'],
  'haben sich': ['sind sich', 'hat sich', 'seid euch'],

  // Standalone Präteritum auxiliaries (hatte / war)
  hatte: ['war', 'hattest', 'waren'],
  war: ['hatte', 'warst', 'waren'],
  hattest: ['warst', 'hatte', 'waren'],
  warst: ['hattest', 'war', 'waren'],
  hatten: ['waren', 'hatte', 'wart'],
  waren: ['hatten', 'war', 'wart'],
  hattet: ['wart', 'hatten', 'waren'],
  wart: ['hattet', 'waren', 'hatten'],
};

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }
  return arr;
}

function extractVerbFormsPool(verb: VerbCard): string[] {
  const forms: string[] = [];

  if (verb.conjugation?.present) {
    const { ich, du, er_sie_es, wir, ihr, sie_Sie } = verb.conjugation.present;
    [ich, du, er_sie_es, wir, ihr, sie_Sie].forEach(form => {
      if (typeof form === 'string' && form.length > 0) {
        forms.push(form.split(' ')[0]);
      }
    });
  }

  if (verb.conjugation?.praeteritum) {
    const { ich, du, er_sie_es, wir, ihr, sie_Sie } = verb.conjugation.praeteritum;
    [ich, du, er_sie_es, wir, ihr, sie_Sie].forEach(form => {
      if (typeof form === 'string' && form.length > 0) {
        forms.push(form.split(' ')[0]);
      }
    });
  }

  if (verb.conjugation?.imperative) {
    const { du, ihr, Sie } = verb.conjugation.imperative;
    [du, ihr, Sie].forEach(form => {
      if (typeof form === 'string' && form.length > 0) {
        forms.push(form.replace(/!$/, '').split(' ')[0]);
      }
    });
  }

  if (verb.principal_parts) {
    const { infinitive, present_3sg, praeteritum_3sg, partizip_2 } = verb.principal_parts;
    [infinitive, present_3sg, praeteritum_3sg, partizip_2].forEach(form => {
      if (typeof form === 'string' && form.length > 0) {
        forms.push(form.split(' ')[0]);
      }
    });
  }

  return forms;
}

function buildDistractorOptions(
  correctValue: string,
  candidatesPool: string[],
  mandatoryCandidate?: string,
): string[] {
  const isCapitalized = /^[A-ZÄÖÜ]/.test(correctValue);
  const normalizedCorrect = correctValue.trim();
  const lowerCorrect = normalizedCorrect.toLowerCase();

  // 1. Dedicated pedagogical distractors for auxiliary verbs (haben / sein in all persons & tenses)
  if (AUXILIARY_DISTRACTORS_MAP[lowerCorrect]) {
    const distractors = AUXILIARY_DISTRACTORS_MAP[lowerCorrect].map(word => {
      if (!isCapitalized) return word;
      return word
        .split(' ')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
    });
    return shuffleArray([normalizedCorrect, ...distractors]);
  }

  const uniqueCandidates = new Set<string>();
  uniqueCandidates.add(normalizedCorrect);

  // 2. If a mandatory candidate (e.g. infinitive for Perfekt Partizip II) is specified, include it
  if (mandatoryCandidate && mandatoryCandidate.trim().length > 0) {
    const cleanMandatory = mandatoryCandidate.trim().split(' ')[0];
    const formattedMandatory = isCapitalized
      ? cleanMandatory.charAt(0).toUpperCase() + cleanMandatory.slice(1)
      : cleanMandatory.charAt(0).toLowerCase() + cleanMandatory.slice(1);
    if (formattedMandatory !== normalizedCorrect) {
      uniqueCandidates.add(formattedMandatory);
    }
  }

  for (const candidate of candidatesPool) {
    if (!candidate) continue;
    const clean = candidate
      .replace(/[!?,.]/g, '')
      .trim()
      .split(' ')[0];
    if (!clean) continue;

    const formatted = isCapitalized
      ? clean.charAt(0).toUpperCase() + clean.slice(1)
      : clean.charAt(0).toLowerCase() + clean.slice(1);

    if (formatted !== normalizedCorrect && formatted.length > 0) {
      uniqueCandidates.add(formatted);
    }
    if (uniqueCandidates.size >= 4) break;
  }

  // Fallback suffixes if pool was too small
  const fallbackEndings = ['e', 'st', 't', 'en', 'te', 'tet'];
  const base = normalizedCorrect.replace(/(st|tet|te|e|t|en)$/, '');
  for (const ending of fallbackEndings) {
    if (uniqueCandidates.size >= 4) break;
    const fallback = base + ending;
    if (fallback !== normalizedCorrect && fallback.length > 0) {
      uniqueCandidates.add(
        isCapitalized ? fallback.charAt(0).toUpperCase() + fallback.slice(1) : fallback,
      );
    }
  }

  return shuffleArray(Array.from(uniqueCandidates).slice(0, 4));
}

function splitTextIntoWordSegments(rawText: string): SentenceSegment[] {
  const result: SentenceSegment[] = [];
  const words = rawText.trim().split(/\s+/).filter(Boolean);
  for (const word of words) {
    result.push({ text: word });
  }
  return result;
}

function getTargetQuizParts(sentence: VerbSentence, verbCard?: VerbCard): string[] {
  const parts = sentence.bracket_parts || [];
  if (!verbCard || verbCard.morphology?.verb_class !== 'modal') {
    return parts;
  }

  // Для модальных глаголов проверяем только сам модальный глагол и вспомогательный глагол в Perfekt.
  // Зависимые смысловые инфинитивы (sprechen, helfen, schwimmen) остаются обычным контекстным текстом.
  if (sentence.tense === 'Perfekt') {
    const targetParts: string[] = [];
    parts.forEach(part => {
      const trimmed = part.trim();
      if (!trimmed) return;
      const lower = trimmed.toLowerCase();
      if (AUXILIARY_DISTRACTORS_MAP[lower]) {
        // Вспомогательный глагол (haben)
        targetParts.push(trimmed);
      } else {
        // Из составной части (например, "kommen können") выделяем только модальный глагол
        const words = trimmed.split(/\s+/);
        const modalWord =
          words.find(w => {
            const wLower = w.toLowerCase();
            return (
              wLower === verbCard.infinitive.toLowerCase() ||
              wLower === (verbCard.principal_parts?.partizip_2 || '').toLowerCase() ||
              wLower === (verbCard.principal_parts?.infinitive || '').toLowerCase()
            );
          }) || words[words.length - 1];
        if (modalWord) {
          targetParts.push(modalWord);
        }
      }
    });
    return targetParts;
  }

  // В остальных временах (Präsens, Präteritum, Imperativ) проверяется только 1-я часть (личная форма модального глагола)
  if (parts.length > 0) {
    return [parts[0].trim()];
  }

  return [];
}

function createSegmentsAndGapsFromSentence(
  sentence: VerbSentence,
  distractorPool: string[],
  infinitive?: string,
  verbCard?: VerbCard,
): { segments: SentenceSegment[]; gaps: QuizGap[] } {
  const segments: SentenceSegment[] = [];
  const gaps: QuizGap[] = [];

  const rawGerman = sentence.german.trim();
  const endsWithQuestionOrExclamation = /[?!]$/.test(rawGerman);
  // Ensure the sentence ends with a period if it's not a question or exclamation
  let remainingText = endsWithQuestionOrExclamation
    ? rawGerman
    : `${rawGerman.replace(/\.*$/, '')}.`;

  let gapIndex = 0;

  const parts = getTargetQuizParts(sentence, verbCard);

  for (const part of parts) {
    const trimmedPart = part.trim();
    if (!trimmedPart) continue;

    const lowerRemaining = remainingText.toLowerCase();
    const lowerPart = trimmedPart.toLowerCase();
    const matchIndex = lowerRemaining.indexOf(lowerPart);

    if (matchIndex === -1) {
      continue;
    }

    if (matchIndex > 0) {
      const beforeText = remainingText.slice(0, matchIndex);
      const beforeWords = splitTextIntoWordSegments(beforeText);
      segments.push(...beforeWords);
    }

    const actualMatchedWord = remainingText.slice(matchIndex, matchIndex + trimmedPart.length);

    const isPrefix = COMMON_PREFIXES.includes(trimmedPart.toLowerCase());
    const isPreposition = COMMON_PREPOSITIONS.includes(trimmedPart.toLowerCase());
    const isAuxiliary = Boolean(AUXILIARY_DISTRACTORS_MAP[trimmedPart.toLowerCase()]);

    let pool: string[];
    if (isPrefix) {
      pool = COMMON_PREFIXES;
    } else if (isPreposition) {
      pool = COMMON_PREPOSITIONS;
    } else if (isAuxiliary) {
      pool = Object.keys(AUXILIARY_DISTRACTORS_MAP);
    } else {
      pool = distractorPool;
    }

    const mandatoryCandidate =
      sentence.tense === 'Perfekt' && !isAuxiliary ? infinitive : undefined;
    const options = buildDistractorOptions(actualMatchedWord, pool, mandatoryCandidate);

    gaps.push({
      id: `gap_${gapIndex}`,
      correctValue: actualMatchedWord,
      options,
    });

    segments.push({ gapIndex });
    gapIndex++;

    remainingText = remainingText.slice(matchIndex + trimmedPart.length);
  }

  remainingText = remainingText.trimEnd();

  if (remainingText.length > 0) {
    const remainingWords = splitTextIntoWordSegments(remainingText);
    segments.push(...remainingWords);
  }

  return { segments, gaps };
}

function createSegmentsAndGapsFromPrefixSentence(
  sentence: VerbSentence,
  verbCard: VerbCard,
): { segments: SentenceSegment[]; gaps: QuizGap[] } | null {
  const segments: SentenceSegment[] = [];
  const gaps: QuizGap[] = [];

  const rawGerman = sentence.german.trim();
  const endsWithPunct = /[.?!]$/.test(rawGerman);
  const punctuation = endsWithPunct ? rawGerman.slice(-1) : '.';
  const sentenceBody = endsWithPunct ? rawGerman.slice(0, -1).trimEnd() : rawGerman;

  const isSeparable = verbCard.morphology?.prefix_type === 'separable';
  const prefix = verbCard.morphology?.prefix || '';
  const parts = sentence.bracket_parts || [];

  const part0 = parts[0]?.trim() || '';
  const part1 = isSeparable && parts.length >= 2 ? parts[1]?.trim() || '' : '';

  const lowerBody = sentenceBody.toLowerCase();
  const lowerPart0 = part0.toLowerCase();
  const matchIndex0 = lowerBody.indexOf(lowerPart0);

  if (matchIndex0 === -1) {
    return null;
  }

  const before0 = sentenceBody.slice(0, matchIndex0);
  if (before0.trim()) {
    segments.push(...splitTextIntoWordSegments(before0));
  }

  const actualPart0 = sentenceBody.slice(matchIndex0, matchIndex0 + part0.length);
  const isCap0 = /^[A-ZÄÖÜ]/.test(actualPart0);

  // Distractors for Slot 1
  const slot1Candidates = new Set<string>([actualPart0]);
  if (isSeparable && prefix) {
    const joined = prefix + actualPart0.toLowerCase();
    slot1Candidates.add(isCap0 ? joined.charAt(0).toUpperCase() + joined.slice(1) : joined);
  } else if (!isSeparable && prefix && actualPart0.toLowerCase().startsWith(prefix.toLowerCase())) {
    const stripped = actualPart0.slice(prefix.length);
    if (stripped.length >= 2) {
      slot1Candidates.add(
        isCap0 ? stripped.charAt(0).toUpperCase() + stripped.slice(1) : stripped.toLowerCase(),
      );
    }
  }
  slot1Candidates.add(
    isCap0
      ? verbCard.infinitive.charAt(0).toUpperCase() + verbCard.infinitive.slice(1)
      : verbCard.infinitive.toLowerCase(),
  );

  const fallbackEndings = ['e', 'st', 't', 'en'];
  const base = actualPart0.replace(/(st|tet|te|e|t|en)$/, '');
  for (const ending of fallbackEndings) {
    if (slot1Candidates.size >= 4) break;
    const fb = base + ending;
    if (fb !== actualPart0 && fb.length > 0) {
      slot1Candidates.add(isCap0 ? fb.charAt(0).toUpperCase() + fb.slice(1) : fb);
    }
  }

  gaps.push({
    id: 'gap_0',
    correctValue: actualPart0,
    options: shuffleArray(Array.from(slot1Candidates).slice(0, 4)),
  });
  segments.push({ gapIndex: 0 });

  if (isSeparable && part1) {
    const after0 = sentenceBody.slice(matchIndex0 + part0.length);
    const lowerAfter0 = after0.toLowerCase();
    const lowerPart1 = part1.toLowerCase();
    const matchIndex1 = lowerAfter0.lastIndexOf(lowerPart1);

    if (matchIndex1 !== -1) {
      const between = after0.slice(0, matchIndex1);
      if (between.trim()) {
        segments.push(...splitTextIntoWordSegments(between));
      }

      const actualPart1 = after0.slice(matchIndex1, matchIndex1 + part1.length);
      const prefixPool = COMMON_PREFIXES.filter(p => p.toLowerCase() !== actualPart1.toLowerCase());
      const slot2Candidates = [actualPart1, '—', ...shuffleArray(prefixPool).slice(0, 2)];

      gaps.push({
        id: 'gap_1',
        correctValue: actualPart1,
        options: shuffleArray(slot2Candidates),
      });
      segments.push({ gapIndex: 1 });

      const after1 = after0.slice(matchIndex1 + part1.length);
      if (after1.trim()) {
        segments.push(...splitTextIntoWordSegments(after1));
      }
    } else {
      if (after0.trim()) segments.push(...splitTextIntoWordSegments(after0));
    }
  } else {
    const after0 = sentenceBody.slice(matchIndex0 + part0.length);
    if (after0.trim()) {
      segments.push(...splitTextIntoWordSegments(after0));
    }
    const competitorPrefixes = prefix
      ? [prefix, ...COMMON_PREFIXES.filter(p => p.toLowerCase() !== prefix.toLowerCase())]
      : COMMON_PREFIXES;
    const slot2Candidates = ['—', ...shuffleArray(competitorPrefixes).slice(0, 3)];
    gaps.push({
      id: 'gap_1',
      correctValue: '—',
      options: shuffleArray(slot2Candidates),
    });
    segments.push({ gapIndex: 1 });
  }

  segments.push({ text: punctuation });
  return { segments, gaps };
}

export const quizGeneratorService = {
  generatePrefixExercises(
    entries: Array<{ verbCard: VerbCard; sentence: VerbSentence }>,
  ): QuizExercise[] {
    const exercises: QuizExercise[] = [];

    entries.forEach(({ verbCard, sentence }, index) => {
      const prefixRes = createSegmentsAndGapsFromPrefixSentence(sentence, verbCard);
      const prefixType =
        (verbCard.morphology?.prefix_type as 'separable' | 'inseparable' | 'dual') || 'separable';
      const ruleKey = PREFIX_RULE_MAP[prefixType] || 'prefixGrammarHint.separableRule';

      const grammarHint: PrefixGrammarHintData = {
        prefix: verbCard.morphology?.prefix || '',
        prefixType,
        infinitive: verbCard.infinitive,
        ruleExplanationKey: ruleKey,
      };

      if (prefixRes && prefixRes.gaps.length === 2) {
        exercises.push({
          id: `prefix_${verbCard.id || verbCard.infinitive}_${sentence.id || index}`,
          type: 'prefix_dual_slot',
          label: `${verbCard.level} · ${verbCard.infinitive.toUpperCase()} · ${sentence.tense.toUpperCase()}`,
          tense: sentence.tense,
          verbCard,
          sentence,
          segments: prefixRes.segments,
          gaps: prefixRes.gaps,
          translation: sentence.translation,
          grammarHint,
        });
      } else {
        const formsPool = extractVerbFormsPool(verbCard);
        const { segments, gaps } = createSegmentsAndGapsFromSentence(
          sentence,
          formsPool,
          verbCard.infinitive,
          verbCard,
        );
        exercises.push({
          id: `prefix_${verbCard.id || verbCard.infinitive}_${sentence.id || index}`,
          type: 'sentence_fill',
          label: `${verbCard.level} · ${verbCard.infinitive.toUpperCase()} · ${sentence.tense.toUpperCase()}`,
          tense: sentence.tense,
          verbCard,
          sentence,
          segments,
          gaps,
          translation: sentence.translation,
          grammarHint,
        });
      }
    });

    return shuffleArray(exercises);
  },
  generateExercisesForVerb(verb: VerbCard, allVariants: VerbCard[] = [verb]): QuizExercise[] {
    const formsPool = extractVerbFormsPool(verb);

    // Collect all authentic sentences from current verb and variants
    const sentenceList: { sentence: VerbSentence; verbCard: VerbCard }[] = [];
    allVariants.forEach(variant => {
      variant.sentences.forEach(sentence => {
        sentenceList.push({ sentence, verbCard: variant });
      });
    });

    const perfektItems = sentenceList.filter(item => item.sentence.tense === 'Perfekt');
    const praetItems = sentenceList.filter(item => item.sentence.tense === 'Präteritum');
    const imperativItems = sentenceList.filter(item => item.sentence.tense === 'Imperativ');
    const praesensItems = sentenceList.filter(item => item.sentence.tense === 'Präsens');

    const selectedSentences: { sentence: VerbSentence; verbCard: VerbCard }[] = [];

    // Always include Perfekt
    if (perfektItems.length > 0) {
      selectedSentences.push(...shuffleArray(perfektItems).slice(0, 1));
    }

    // Always include Präteritum
    if (praetItems.length > 0) {
      selectedSentences.push(...shuffleArray(praetItems).slice(0, 1));
    }

    // Always include Imperativ
    if (imperativItems.length > 0) {
      selectedSentences.push(...shuffleArray(imperativItems).slice(0, 1));
    }

    // Fill remaining slots (up to 6) with Präsens
    const neededPraesens = Math.max(0, 6 - selectedSentences.length);
    if (praesensItems.length > 0) {
      selectedSentences.push(...shuffleArray(praesensItems).slice(0, neededPraesens));
    }

    // If still under 6, add any remaining unused sentences
    if (selectedSentences.length < 6) {
      for (const item of sentenceList) {
        if (selectedSentences.length >= 6) break;
        if (!selectedSentences.includes(item)) {
          selectedSentences.push(item);
        }
      }
    }

    const exercises: QuizExercise[] = [];
    selectedSentences.forEach(({ sentence, verbCard }, idx) => {
      const { segments, gaps } = createSegmentsAndGapsFromSentence(
        sentence,
        formsPool,
        verbCard.infinitive,
        verbCard,
      );
      if (gaps.length > 0) {
        exercises.push({
          id: `sentence_${sentence.id || idx}`,
          label: `${verbCard.level} · ${verbCard.infinitive.toUpperCase()} · ${sentence.tense.toUpperCase()}`,
          tense: sentence.tense,
          verbCard,
          sentence,
          segments,
          gaps,
          translation: sentence.translation,
        });
      }
    });

    return shuffleArray(exercises).slice(0, 6);
  },

  generateCheckpointExercises(verbs: VerbCard[]): QuizExercise[] {
    const TIER_ALWAYS_INCORRECT = 1;
    const TIER_MIXED = 2;
    const TIER_ALWAYS_CORRECT = 3;
    const TIER_NEVER_PRACTICED = 4;

    interface SentenceEntry {
      sentence: VerbSentence;
      verbCard: VerbCard;
      stats: SentenceProgressStats;
      tier: number;
      successRate: number;
    }

    const allSentenceEntries: SentenceEntry[] = [];

    verbs.forEach(verbCard => {
      verbCard.sentences.forEach(sentence => {
        const sentenceKey = `${verbCard.id || verbCard.infinitive}_${sentence.id}`;
        const stats = progressService.getSentenceStats(sentenceKey);
        let tier: number;
        let successRate = 0;

        if (stats.attempts === 0) {
          tier = TIER_NEVER_PRACTICED;
        } else if (stats.correct === 0) {
          tier = TIER_ALWAYS_INCORRECT;
        } else if (stats.incorrect === 0) {
          tier = TIER_ALWAYS_CORRECT;
          successRate = 1;
        } else {
          tier = TIER_MIXED;
          successRate = stats.correct / stats.attempts;
        }

        allSentenceEntries.push({
          sentence,
          verbCard,
          stats,
          tier,
          successRate,
        });
      });
    });

    // 1. Always incorrect: sorted by incorrect count DESC
    const tier1Entries = shuffleArray(
      allSentenceEntries.filter(entry => entry.tier === TIER_ALWAYS_INCORRECT),
    ).sort((firstEntry, secondEntry) => secondEntry.stats.incorrect - firstEntry.stats.incorrect);

    // 2. Mixed: sorted by successRate ASC (lowest % correct first), then incorrect count DESC
    const tier2Entries = shuffleArray(
      allSentenceEntries.filter(entry => entry.tier === TIER_MIXED),
    ).sort((firstEntry, secondEntry) => {
      if (firstEntry.successRate !== secondEntry.successRate) {
        return firstEntry.successRate - secondEntry.successRate;
      }
      return secondEntry.stats.incorrect - firstEntry.stats.incorrect;
    });

    // 3. Always correct: shuffled
    const tier3Entries = shuffleArray(
      allSentenceEntries.filter(entry => entry.tier === TIER_ALWAYS_CORRECT),
    );

    // 4. Never practiced: shuffled (lowest priority)
    const tier4Entries = shuffleArray(
      allSentenceEntries.filter(entry => entry.tier === TIER_NEVER_PRACTICED),
    );

    const prioritizedEntries = [...tier1Entries, ...tier2Entries, ...tier3Entries, ...tier4Entries];

    const selectedEntries = prioritizedEntries.slice(0, 20);

    const exercises: QuizExercise[] = [];
    selectedEntries.forEach(({ sentence, verbCard }, index) => {
      const formsPool = extractVerbFormsPool(verbCard);
      const { segments, gaps } = createSegmentsAndGapsFromSentence(
        sentence,
        formsPool,
        verbCard.infinitive,
        verbCard,
      );
      if (gaps.length > 0) {
        exercises.push({
          id: `checkpoint_sentence_${sentence.id || index}_${verbCard.infinitive}`,
          label: `${verbCard.level} · ${verbCard.infinitive.toUpperCase()} · ${sentence.tense.toUpperCase()}`,
          tense: sentence.tense,
          verbCard,
          sentence,
          segments,
          gaps,
          translation: sentence.translation,
        });
      }
    });

    return shuffleArray(exercises).slice(0, 20);
  },

  generateSmartQuizExercises(verbs: VerbCard[], maxCount: number = 50): QuizExercise[] {
    const TIER_ALWAYS_INCORRECT = 1;
    const TIER_MIXED = 2;
    const TIER_ALWAYS_CORRECT = 3;
    const TIER_NEVER_PRACTICED = 4;

    interface SentenceEntry {
      sentence: VerbSentence;
      verbCard: VerbCard;
      stats: SentenceProgressStats;
      tier: number;
      successRate: number;
    }

    const allSentenceEntries: SentenceEntry[] = [];

    verbs.forEach(verbCard => {
      verbCard.sentences.forEach(sentence => {
        const sentenceKey = `${verbCard.id || verbCard.infinitive}_${sentence.id}`;
        const stats = progressService.getSentenceStats(sentenceKey);
        let tier: number;
        let successRate = 0;

        if (stats.attempts === 0) {
          tier = TIER_NEVER_PRACTICED;
        } else if (stats.correct === 0) {
          tier = TIER_ALWAYS_INCORRECT;
        } else if (stats.incorrect === 0) {
          tier = TIER_ALWAYS_CORRECT;
          successRate = 1;
        } else {
          tier = TIER_MIXED;
          successRate = stats.correct / stats.attempts;
        }

        allSentenceEntries.push({
          sentence,
          verbCard,
          stats,
          tier,
          successRate,
        });
      });
    });

    // 1. Always incorrect: sorted by incorrect count DESC
    const tier1Entries = shuffleArray(
      allSentenceEntries.filter(entry => entry.tier === TIER_ALWAYS_INCORRECT),
    ).sort((firstEntry, secondEntry) => secondEntry.stats.incorrect - firstEntry.stats.incorrect);

    // 2. Mixed: sorted by successRate ASC (lowest % correct first), then incorrect count DESC
    const tier2Entries = shuffleArray(
      allSentenceEntries.filter(entry => entry.tier === TIER_MIXED),
    ).sort((firstEntry, secondEntry) => {
      if (firstEntry.successRate !== secondEntry.successRate) {
        return firstEntry.successRate - secondEntry.successRate;
      }
      return secondEntry.stats.incorrect - firstEntry.stats.incorrect;
    });

    // 3. Always correct: shuffled
    const tier3Entries = shuffleArray(
      allSentenceEntries.filter(entry => entry.tier === TIER_ALWAYS_CORRECT),
    );

    // 4. Never practiced: sorted by frequency rank and shuffled
    const tier4Entries = shuffleArray(
      allSentenceEntries.filter(entry => entry.tier === TIER_NEVER_PRACTICED),
    );

    const prioritizedEntries = [...tier1Entries, ...tier2Entries, ...tier3Entries, ...tier4Entries];

    const selectedEntries = prioritizedEntries.slice(0, maxCount);

    const exercises: QuizExercise[] = [];
    selectedEntries.forEach(({ sentence, verbCard }, index) => {
      const isPrefixVerb =
        verbCard.morphology?.prefix_type && verbCard.morphology.prefix_type !== 'none';
      if (isPrefixVerb && sentence.tense !== 'Perfekt') {
        const prefixRes = createSegmentsAndGapsFromPrefixSentence(sentence, verbCard);
        if (prefixRes && prefixRes.gaps.length === 2) {
          const prefixType =
            (verbCard.morphology?.prefix_type as 'separable' | 'inseparable' | 'dual') ||
            'separable';
          const ruleKey = PREFIX_RULE_MAP[prefixType] || 'prefixGrammarHint.separableRule';

          exercises.push({
            id: `smart_sentence_${sentence.id || index}_${verbCard.infinitive}`,
            type: 'prefix_dual_slot',
            label: `${verbCard.level} · ${verbCard.infinitive.toUpperCase()} · ${sentence.tense.toUpperCase()}`,
            tense: sentence.tense,
            verbCard,
            sentence,
            segments: prefixRes.segments,
            gaps: prefixRes.gaps,
            translation: sentence.translation,
            grammarHint: {
              prefix: verbCard.morphology?.prefix || '',
              prefixType,
              infinitive: verbCard.infinitive,
              ruleExplanationKey: ruleKey,
            },
          });
          return;
        }
      }

      const formsPool = extractVerbFormsPool(verbCard);
      const { segments, gaps } = createSegmentsAndGapsFromSentence(
        sentence,
        formsPool,
        verbCard.infinitive,
        verbCard,
      );
      if (gaps.length > 0) {
        exercises.push({
          id: `smart_sentence_${sentence.id || index}_${verbCard.infinitive}`,
          type: 'sentence_fill',
          label: `${verbCard.level} · ${verbCard.infinitive.toUpperCase()} · ${sentence.tense.toUpperCase()}`,
          tense: sentence.tense,
          verbCard,
          sentence,
          segments,
          gaps,
          translation: sentence.translation,
        });
      }
    });

    return shuffleArray(exercises).slice(0, maxCount);
  },

  generateConjugationExercises(verbs: VerbCard[]): QuizExercise[] {
    const PRONOUNS: Array<{
      key: 'ich' | 'du' | 'er_sie_es' | 'wir' | 'ihr' | 'sie_Sie';
      label: string;
    }> = [
      { key: 'ich', label: 'ich' },
      { key: 'du', label: 'du' },
      { key: 'er_sie_es', label: 'er/sie/es' },
      { key: 'wir', label: 'wir' },
      { key: 'ihr', label: 'ihr' },
      { key: 'sie_Sie', label: 'sie/Sie' },
    ];

    const randomizedVerbs = shuffleArray(verbs);
    const exercises: QuizExercise[] = [];

    randomizedVerbs.forEach((verbCard, verbIndex) => {
      const present = verbCard.conjugation?.present;
      if (!present) return;

      const isReflexive = Boolean(verbCard.morphology?.is_reflexive);
      const rows: ConjugationRowData[] = [];
      const gaps: QuizGap[] = [];
      const uniqueFormValuesSet = new Set<string>();

      PRONOUNS.forEach((pronounItem, gapIndex) => {
        const rawForm = (present[pronounItem.key] as string) || '';
        let correctValue = rawForm.trim();
        let reflexivePronoun: string | undefined;

        if (isReflexive) {
          const match = rawForm.match(/^(.*?)\s+(mich|dich|sich|uns|euch|mir|dir)$/i);
          if (match) {
            correctValue = match[1].trim();
            reflexivePronoun = match[2].trim();
          }
        }

        uniqueFormValuesSet.add(correctValue);

        rows.push({
          pronoun: pronounItem.label,
          gapIndex,
          correctValue,
          reflexivePronoun,
        });
      });

      const optionsPool = shuffleArray(Array.from(uniqueFormValuesSet));

      rows.forEach(row => {
        gaps.push({
          id: `gap_${row.gapIndex}`,
          correctValue: row.correctValue,
          options: [...optionsPool],
        });
      });

      const segments: SentenceSegment[] = [];
      rows.forEach(row => {
        segments.push({ text: `${row.pronoun} ` });
        segments.push({ gapIndex: row.gapIndex });
        if (row.reflexivePronoun) {
          segments.push({ text: ` ${row.reflexivePronoun}` });
        }
        segments.push({ text: '\n' });
      });

      const rootVowelChange = present.root_vowel_change || null;
      let ruleExplanationKey: string | undefined;
      if (rootVowelChange === 'e -> i') {
        ruleExplanationKey = 'conjugationGrammarHint.eToIRule';
      } else if (rootVowelChange === 'e -> ie') {
        ruleExplanationKey = 'conjugationGrammarHint.eToIeRule';
      } else if (rootVowelChange === 'a -> ä') {
        ruleExplanationKey = 'conjugationGrammarHint.aToAeRule';
      } else if (rootVowelChange === 'au -> äu') {
        ruleExplanationKey = 'conjugationGrammarHint.auToAeuRule';
      }

      const translation = verbCard.translation || { ru: '', en: '' };
      const dummySentence: VerbSentence = {
        id: `conj_${verbCard.id || verbCard.infinitive}_${verbIndex}`,
        tense: 'Präsens',
        german: `${verbCard.infinitive} (Präsens)`,
        translation,
      };

      exercises.push({
        id: `conjugation_exercise_${verbCard.id || verbCard.infinitive}_${verbIndex}`,
        type: 'conjugation_fill',
        label: `${verbCard.level} · ${verbCard.infinitive.toUpperCase()} · PRÄSENS`,
        tense: 'Präsens',
        verbCard,
        sentence: dummySentence,
        segments,
        gaps,
        translation,
        conjugationRows: rows,
        conjugationGrammarHint: {
          infinitive: verbCard.infinitive,
          rootVowelChange,
          ruleExplanationKey,
        },
      });
    });

    return exercises;
  },
};
