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

export interface VerbFormsExerciseData {
  infinitive: string;
  correctPraeteritum: string;
  correctAuxiliary: 'hat' | 'ist';
  correctPartizipII: string;
  praeteritumOptions: string[];
  partizipIIOptions: string[];
}

export interface VerbFormsGrammarHintData {
  infinitive: string;
  fullChain: string;
  verbClass: string;
  rootVowelPattern?: string;
  auxiliary: 'haben' | 'sein';
  ruleExplanationKey: string;
}

export interface PrepositionGrammarHintData {
  infinitive: string;
  preposition: string;
  prepositionCase: 'Akkusativ' | 'Dativ';
  questions?: string;
  ruleExplanationKey?: string;
}

export interface QuizExercise {
  id: string;
  type?:
    | 'sentence_fill'
    | 'prefix_dual_slot'
    | 'conjugation_fill'
    | 'verb_forms_fill'
    | 'preposition_fill';
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
  verbFormsData?: VerbFormsExerciseData;
  verbFormsGrammarHint?: VerbFormsGrammarHintData;
  prepositionGrammarHint?: PrepositionGrammarHintData;
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

  generateVerbFormsExercises(verbs: VerbCard[], _isCheckpointOrFinal = false): QuizExercise[] {
    const exercises: QuizExercise[] = [];
    if (verbs.length === 0) return exercises;

    const verbsList = shuffleArray([...verbs]);

    verbsList.forEach((card, index) => {
      const isReflexive = Boolean(card.morphology?.is_reflexive);
      const isSeparable = card.morphology?.prefix_type === 'separable';
      const prefix = card.morphology?.prefix || '';
      const verbClass = card.morphology?.verb_class || 'strong';
      const auxiliary = (card.auxiliary === 'sein' ? 'sein' : 'haben') as 'haben' | 'sein';
      const correctAuxiliary = (auxiliary === 'sein' ? 'ist' : 'hat') as 'hat' | 'ist';

      let correctPraeteritum = (card.principal_parts?.praeteritum_3sg || '').trim();
      if (isReflexive && !correctPraeteritum.includes('sich')) {
        correctPraeteritum = `${correctPraeteritum} sich`;
      }

      let correctPartizipII = (card.principal_parts?.partizip_2 || '').trim();
      if (isReflexive && !correctPartizipII.startsWith('sich ')) {
        correctPartizipII = `sich ${correctPartizipII}`;
      }

      // 1. Generate Präteritum distractors
      const praetDistractors = new Set<string>();

      // Heuristic A: Regular weak "-te" ending
      const baseInf = card.infinitive
        .replace(/^(sich|mich|dich)\s+/i, '')
        .replace(/\s+sich$/i, '')
        .trim();
      const rawStem =
        isSeparable && prefix && baseInf.startsWith(prefix)
          ? baseInf.slice(prefix.length)
          : baseInf;
      const stem = rawStem.replace(/(en|n)$/, '');

      if (stem.length > 1) {
        let weakTrap = `${stem}te`;
        if (isSeparable && prefix) {
          weakTrap = `${stem}te ${prefix}`;
        }
        if (isReflexive) {
          weakTrap = `${weakTrap} sich`;
        }
        if (weakTrap !== correctPraeteritum) {
          praetDistractors.add(weakTrap);
        }
      }

      // Heuristic B: Ablaut swap
      const mainPraet = correctPraeteritum
        .replace(/\s+sich$/, '')
        .replace(new RegExp(`\\s+${prefix}$`), '');
      const ablautReplacements: Record<string, string[]> = {
        i: ['a', 'o'],
        ie: ['a', 'o'],
        a: ['e', 'o', 'u'],
        u: ['a', 'o'],
        o: ['a', 'e'],
        e: ['a', 'o'],
      };
      for (const [vowel, replacements] of Object.entries(ablautReplacements)) {
        if (mainPraet.includes(vowel)) {
          for (const rep of replacements) {
            const swapped = mainPraet.replace(vowel, rep);
            let ablautTrap = swapped;
            if (isSeparable && prefix) {
              ablautTrap = `${swapped} ${prefix}`;
            }
            if (isReflexive) {
              ablautTrap = `${ablautTrap} sich`;
            }
            if (ablautTrap !== correctPraeteritum && ablautTrap.length > 2) {
              praetDistractors.add(ablautTrap);
              if (praetDistractors.size >= 2) break;
            }
          }
          if (praetDistractors.size >= 2) break;
        }
      }

      // Heuristic C: Other verbs from the list
      for (const other of verbs) {
        if (praetDistractors.size >= 3) break;
        if (other.infinitive.toLowerCase() === card.infinitive.toLowerCase()) continue;
        let otherPraet = (other.principal_parts?.praeteritum_3sg || '').trim();
        if (isReflexive && !otherPraet.includes('sich')) {
          otherPraet = `${otherPraet} sich`;
        } else if (!isReflexive && otherPraet.includes('sich')) {
          otherPraet = otherPraet.replace(/\s+sich$/, '').trim();
        }
        if (otherPraet && otherPraet !== correctPraeteritum) {
          praetDistractors.add(otherPraet);
        }
      }

      // Fallback
      const fallbackPraet = [
        'stand',
        'sagte',
        'nahm',
        'gab',
        'sah',
        'fuhr',
        'blieb',
        'hatte',
        'kam',
        'rief',
      ];
      for (const fallback of fallbackPraet) {
        if (praetDistractors.size >= 3) break;
        const item = isReflexive ? `${fallback} sich` : fallback;
        if (item !== correctPraeteritum) {
          praetDistractors.add(item);
        }
      }

      const praeteritumOptions = shuffleArray([
        correctPraeteritum,
        ...Array.from(praetDistractors).slice(0, 3),
      ]);

      // 2. Generate Partizip II distractors
      const part2Distractors = new Set<string>();
      const corePart2 = correctPartizipII.replace(/^sich\s+/, '');

      // Heuristic A: Weak vs strong ending swap
      if (corePart2.endsWith('en')) {
        const weakTrap = `${corePart2.slice(0, -2)}t`;
        const fullWeakTrap = isReflexive ? `sich ${weakTrap}` : weakTrap;
        if (fullWeakTrap !== correctPartizipII) {
          part2Distractors.add(fullWeakTrap);
        }
      } else if (corePart2.endsWith('t')) {
        const strongTrap = `${corePart2.slice(0, -1)}en`;
        const fullStrongTrap = isReflexive ? `sich ${strongTrap}` : strongTrap;
        if (fullStrongTrap !== correctPartizipII) {
          part2Distractors.add(fullStrongTrap);
        }
      }

      // Heuristic B: Prefix / ge- placement trap
      if (isSeparable && prefix && corePart2.includes(prefix)) {
        const afterPrefix = corePart2.slice(prefix.length).replace(/^ge/, '');
        const wrongGeTrap = `ge${prefix}${afterPrefix}`;
        const fullWrongGe = isReflexive ? `sich ${wrongGeTrap}` : wrongGeTrap;
        if (fullWrongGe !== correctPartizipII) {
          part2Distractors.add(fullWrongGe);
        }
      } else if (
        corePart2.startsWith('ver') ||
        corePart2.startsWith('be') ||
        corePart2.startsWith('er')
      ) {
        const redundantGeTrap = `ge${corePart2}`;
        const fullRedundantGe = isReflexive ? `sich ${redundantGeTrap}` : redundantGeTrap;
        if (fullRedundantGe !== correctPartizipII) {
          part2Distractors.add(fullRedundantGe);
        }
      } else if (corePart2.startsWith('ge')) {
        const noGeTrap = corePart2.slice(2);
        if (noGeTrap.length > 2) {
          const fullNoGe = isReflexive ? `sich ${noGeTrap}` : noGeTrap;
          if (fullNoGe !== correctPartizipII) {
            part2Distractors.add(fullNoGe);
          }
        }
      }

      // Heuristic C: Other verbs from the list
      for (const other of verbs) {
        if (part2Distractors.size >= 3) break;
        if (other.infinitive.toLowerCase() === card.infinitive.toLowerCase()) continue;
        let otherPart2 = (other.principal_parts?.partizip_2 || '').trim();
        if (isReflexive && !otherPart2.startsWith('sich ')) {
          otherPart2 = `sich ${otherPart2}`;
        } else if (!isReflexive && otherPart2.startsWith('sich ')) {
          otherPart2 = otherPart2.replace(/^sich\s+/, '').trim();
        }
        if (otherPart2 && otherPart2 !== correctPartizipII) {
          part2Distractors.add(otherPart2);
        }
      }

      // Fallback
      const fallbackPart2 = [
        'gesagt',
        'genommen',
        'gegeben',
        'geblieben',
        'gemacht',
        'gefahren',
        'gekommen',
        'gesehen',
      ];
      for (const fallback of fallbackPart2) {
        if (part2Distractors.size >= 3) break;
        const item = isReflexive ? `sich ${fallback}` : fallback;
        if (item !== correctPartizipII) {
          part2Distractors.add(item);
        }
      }

      const partizipIIOptions = shuffleArray([
        correctPartizipII,
        ...Array.from(part2Distractors).slice(0, 3),
      ]);

      // Vowel pattern derivation
      const extractVowel = (word: string): string | null => {
        const clean = word
          .toLowerCase()
          .replace(/^(ge|be|ver|er|zer|ent|emp|miss|an|auf|aus|ein|mit|ab|zu)/, '');
        const match = clean.match(/(ei|ie|au|eu|äu|[aeiouäöü])/);
        return match ? match[1] : null;
      };

      const v1 = extractVowel(card.infinitive);
      const v2 = extractVowel(correctPraeteritum);
      const v3 = extractVowel(correctPartizipII);
      const rootVowelPattern =
        v1 && v2 && v3 && (v1 !== v2 || v2 !== v3) ? `${v1} → ${v2} → ${v3}` : undefined;

      let ruleExplanationKey = 'verbFormsGrammarHint.weakVerbRule';
      if (auxiliary === 'sein') {
        ruleExplanationKey = 'verbFormsGrammarHint.seinRule';
      } else if (verbClass === 'strong') {
        ruleExplanationKey = 'verbFormsGrammarHint.strongVerbRule';
      } else if (verbClass === 'mixed') {
        ruleExplanationKey = 'verbFormsGrammarHint.mixedVerbRule';
      }

      const translation = card.translation || { ru: '', en: '' };
      const fullChain = `${card.infinitive} — ${correctPraeteritum} — ${correctAuxiliary} ${correctPartizipII}`;

      const dummySentence: VerbSentence = {
        id: `verb_forms_${card.id || card.infinitive}_${index}`,
        tense: 'Perfekt',
        german: fullChain,
        translation,
      };

      const gaps: QuizGap[] = [
        {
          id: `gap_praeteritum`,
          correctValue: correctPraeteritum,
          options: praeteritumOptions,
        },
        {
          id: `gap_auxiliary`,
          correctValue: correctAuxiliary,
          options: ['hat', 'ist'],
        },
        {
          id: `gap_partizip_2`,
          correctValue: correctPartizipII,
          options: partizipIIOptions,
        },
      ];

      const segments: SentenceSegment[] = [
        { gapIndex: 0 },
        { text: ' — ' },
        { gapIndex: 1 },
        { text: ' ' },
        { gapIndex: 2 },
      ];

      exercises.push({
        id: `verb_forms_exercise_${card.id || card.infinitive}_${index}`,
        type: 'verb_forms_fill',
        label: `${card.level} · ${card.infinitive.toUpperCase()} · 3 VERB FORMS`,
        tense: 'Perfekt',
        verbCard: card,
        sentence: dummySentence,
        segments,
        gaps,
        translation,
        verbFormsData: {
          infinitive: card.infinitive,
          correctPraeteritum,
          correctAuxiliary,
          correctPartizipII,
          praeteritumOptions,
          partizipIIOptions,
        },
        verbFormsGrammarHint: {
          infinitive: card.infinitive,
          fullChain,
          verbClass,
          rootVowelPattern,
          auxiliary,
          ruleExplanationKey,
        },
      });
    });

    return exercises;
  },

  generatePrepositionExercises(cards: VerbCard[]): QuizExercise[] {
    const exercises: QuizExercise[] = [];

    cards.forEach((card, cardIndex) => {
      const prep = card.rektion?.preposition;
      const prepositionCase: 'Akkusativ' | 'Dativ' =
        card.rektion?.preposition_case === 'Akkusativ' ? 'Akkusativ' : 'Dativ';
      if (!prep) return;

      const matchingSentences: Array<{
        sentence: VerbSentence;
        matchResult: PrepositionMatchResult;
      }> = [];

      for (const sentenceItem of card.sentences || []) {
        const matchResult = findPrepositionMatch(sentenceItem.german, prep);
        if (matchResult) {
          matchingSentences.push({ sentence: sentenceItem, matchResult });
        }
      }

      if (matchingSentences.length === 0) return;

      const randomIdx = Math.floor(Math.random() * matchingSentences.length);
      const { sentence, matchResult } = matchingSentences[randomIdx];

      const distractors = generatePrepositionDistractors(
        matchResult.matchedText,
        prep,
        prepositionCase,
        matchResult.isFused,
        matchResult.hasArticle,
        matchResult.article,
      );

      const options = shuffleArray([matchResult.matchedText, ...distractors]);

      const beforeText = sentence.german.slice(0, matchResult.index);
      const afterText = sentence.german.slice(matchResult.index + matchResult.matchedText.length);

      const segments: SentenceSegment[] = [];
      if (beforeText.trim().length > 0) {
        segments.push(...splitTextIntoWordSegments(beforeText));
      }
      segments.push({ gapIndex: 0 });
      if (afterText.trim().length > 0) {
        segments.push(...splitTextIntoWordSegments(afterText));
      }

      const gaps: QuizGap[] = [
        {
          id: `gap_preposition_${cardIndex}`,
          correctValue: matchResult.matchedText,
          options,
        },
      ];

      const questions = getPrepositionQuestions(prep, prepositionCase, card.infinitive);

      exercises.push({
        id: `preposition_exercise_${card.id || card.infinitive}_${cardIndex}`,
        type: 'preposition_fill',
        label: `${card.level} · ${card.infinitive.toUpperCase()} · PREPOSITION`,
        tense: sentence.tense,
        verbCard: card,
        sentence,
        segments,
        gaps,
        translation: sentence.translation || card.translation || {},
        prepositionGrammarHint: {
          infinitive: card.infinitive,
          preposition: prep,
          prepositionCase,
          questions,
        },
      });
    });

    return exercises;
  },
};

const PREP_FUSIONS: Record<
  string,
  Record<string, { article: string; case: 'Akkusativ' | 'Dativ' }>
> = {
  an: { am: { article: 'dem', case: 'Dativ' }, ans: { article: 'das', case: 'Akkusativ' } },
  in: { im: { article: 'dem', case: 'Dativ' }, ins: { article: 'das', case: 'Akkusativ' } },
  von: { vom: { article: 'dem', case: 'Dativ' } },
  zu: { zum: { article: 'dem', case: 'Dativ' }, zur: { article: 'der', case: 'Dativ' } },
  bei: { beim: { article: 'dem', case: 'Dativ' } },
  auf: { aufs: { article: 'das', case: 'Akkusativ' } },
  für: { fürs: { article: 'das', case: 'Akkusativ' } },
  um: { ums: { article: 'das', case: 'Akkusativ' } },
  über: { übers: { article: 'das', case: 'Akkusativ' } },
  unter: {
    unterm: { article: 'dem', case: 'Dativ' },
    unters: { article: 'das', case: 'Akkusativ' },
  },
  vor: { vorm: { article: 'dem', case: 'Dativ' }, vors: { article: 'das', case: 'Akkusativ' } },
  hinter: {
    hinterm: { article: 'dem', case: 'Dativ' },
    hinters: { article: 'das', case: 'Akkusativ' },
  },
  durch: { durchs: { article: 'das', case: 'Akkusativ' } },
};

const ARTICLE_DETERMINERS = new Set([
  'der',
  'die',
  'das',
  'den',
  'dem',
  'des',
  'ein',
  'eine',
  'einen',
  'einem',
  'einer',
  'eines',
  'kein',
  'keine',
  'keinen',
  'keinem',
  'keiner',
  'keines',
  'mein',
  'meine',
  'meinen',
  'meinem',
  'meiner',
  'dein',
  'deine',
  'deinen',
  'deinem',
  'deiner',
  'sein',
  'seine',
  'seinen',
  'seinem',
  'seiner',
  'ihr',
  'ihre',
  'ihren',
  'ihrem',
  'ihrer',
  'unser',
  'unsere',
  'unseren',
  'unserem',
  'unserer',
  'euer',
  'eure',
  'euren',
  'eurem',
  'eurer',
  'dieser',
  'diese',
  'dieses',
  'diesen',
  'diesem',
]);

const ARTICLE_CASE_MAP: Record<string, string> = {
  // Masc: Akk <-> Dat
  den: 'dem',
  dem: 'den',
  einen: 'einem',
  einem: 'einen',
  keinen: 'keinem',
  keinem: 'keinen',
  meinen: 'meinem',
  meinem: 'meinen',
  deinen: 'deinem',
  deinem: 'deinen',
  seinen: 'seinem',
  seinem: 'seinen',
  ihren: 'ihrem',
  ihrem: 'ihren',
  unseren: 'unserem',
  unserem: 'unseren',
  euren: 'eurem',
  eurem: 'euren',
  diesen: 'diesem',
  diesem: 'diesen',

  // Fem: Akk <-> Dat
  die: 'der',
  der: 'die',
  eine: 'einer',
  einer: 'eine',
  keine: 'keiner',
  keiner: 'keine',
  meine: 'meiner',
  meiner: 'meine',
  deine: 'deiner',
  deiner: 'deine',
  seine: 'seiner',
  seiner: 'seine',
  ihre: 'ihrer',
  ihrer: 'ihre',
  unsere: 'unserer',
  unserer: 'unsere',
  eure: 'eurer',
  eurer: 'eure',
  diese: 'dieser',
  dieser: 'diese',

  // Neuter: Akk <-> Dat
  das: 'dem',
  ein: 'einem',
  kein: 'keinem',
  mein: 'meinem',
  dein: 'deinem',
  sein: 'seinem',
  ihr: 'ihrem',
  unser: 'unserem',
  euer: 'eurem',
  dieses: 'diesem',
};

const FUSED_DAT = ['am', 'im', 'vom', 'beim', 'zum', 'zur'];
const FUSED_AKK = ['ans', 'ins', 'aufs', 'fürs', 'ums'];

const DIRECTIONAL_VERBS = new Set([
  'gehen',
  'kommen',
  'fahren',
  'fliegen',
  'laufen',
  'reisen',
  'ziehen',
  'steigen',
  'einsteigen',
  'umsteigen',
  'aussteigen',
  'treten',
  'geraten',
  'bringen',
  'stellen',
  'legen',
  'setzen',
]);

const LOCATION_VERBS = new Set([
  'wohnen',
  'leben',
  'bleiben',
  'sein',
  'arbeiten',
  'liegen',
  'stehen',
  'sitzen',
  'stecken',
  'befinden sich',
  'sich befinden',
]);

const ORIGIN_VERBS = new Set(['kommen', 'stammen', 'abstammen']);

function getPrepositionQuestions(
  prep: string,
  prepositionCase: 'Akkusativ' | 'Dativ',
  infinitive?: string,
): string {
  const p = prep.toLowerCase();
  const inf = infinitive ? infinitive.toLowerCase().replace(/^sich\s+|\s+sich$/g, '') : '';
  const isDirectional = DIRECTIONAL_VERBS.has(inf);
  const isLocation = LOCATION_VERBS.has(inf);
  const isOrigin = ORIGIN_VERBS.has(inf);
  const capitalizedPrep = prep.charAt(0).toUpperCase() + prep.slice(1);
  const personQ =
    prepositionCase === 'Akkusativ' ? `${capitalizedPrep} wen?` : `${capitalizedPrep} wem?`;

  if (p === 'in') {
    if (prepositionCase === 'Akkusativ') {
      return `Wohin? / ${personQ}`;
    }
    return `Wo? / ${personQ}`;
  }

  if (p === 'nach') {
    if (isDirectional) {
      return 'Wohin?';
    }
    return `Wonach? / ${personQ}`;
  }

  if (p === 'aus') {
    if (isOrigin || isDirectional) {
      return `Woher? / ${personQ}`;
    }
    return `Woraus? / ${personQ}`;
  }

  if (p === 'zu') {
    if (isDirectional) {
      return `Wohin? / ${personQ}`;
    }
    return `Wozu? / ${personQ}`;
  }

  if (p === 'von') {
    if (isOrigin) {
      return `Woher? / ${personQ}`;
    }
    return `Wovon? / ${personQ}`;
  }

  if (p === 'an') {
    if (prepositionCase === 'Akkusativ') {
      return isDirectional ? `Wohin? / ${personQ}` : `Woran? / ${personQ}`;
    }
    return isLocation ? `Wo? / ${personQ}` : `Woran? / ${personQ}`;
  }

  if (p === 'auf') {
    if (prepositionCase === 'Akkusativ') {
      return isDirectional ? `Wohin? / ${personQ}` : `Worauf? / ${personQ}`;
    }
    return isLocation ? `Wo? / ${personQ}` : `Worauf? / ${personQ}`;
  }

  if (p === 'bei') {
    return `Wo? / ${personQ}`;
  }

  const woPrefix = /^[aeiouäöü]/i.test(p) ? 'wor' : 'wo';
  const thingQ = `${woPrefix}${p}?`;
  const capitalizedThing = thingQ.charAt(0).toUpperCase() + thingQ.slice(1);
  return `${capitalizedThing} / ${personQ}`;
}

interface PrepositionMatchResult {
  matchedText: string;
  index: number;
  isFused: boolean;
  hasArticle: boolean;
  article?: string;
  prep: string;
}

function findPrepositionMatch(sentence: string, prep: string): PrepositionMatchResult | null {
  const prepFusions = PREP_FUSIONS[prep.toLowerCase()] || {};
  for (const fused of Object.keys(prepFusions)) {
    const fusedRegex = new RegExp(`(?<=^|[\\s"«»(,\\[])${fused}(?=$|[\\s"«»),.\\]!?])`, 'iu');
    const match = fusedRegex.exec(sentence);
    if (match) {
      return {
        matchedText: match[0],
        index: match.index,
        isFused: true,
        hasArticle: false,
        prep,
      };
    }
  }

  const directRegex = new RegExp(`(?<=^|[\\s"«»(,\\[])${prep}(?=$|[\\s"«»),.\\]!?])`, 'iu');
  const match = directRegex.exec(sentence);
  if (match) {
    const afterIndex = match.index + match[0].length;
    const remaining = sentence.slice(afterIndex);
    const nextWordMatch = /^\s+([a-zA-ZäöüÄÖÜß]+)/u.exec(remaining);
    if (nextWordMatch) {
      const nextWord = nextWordMatch[1];
      if (ARTICLE_DETERMINERS.has(nextWord.toLowerCase())) {
        return {
          matchedText: `${match[0]} ${nextWord}`,
          index: match.index,
          isFused: false,
          hasArticle: true,
          article: nextWord,
          prep: match[0],
        };
      }
    }
    return {
      matchedText: match[0],
      index: match.index,
      isFused: false,
      hasArticle: false,
      prep: match[0],
    };
  }

  return null;
}

function generatePrepositionDistractors(
  targetText: string,
  prep: string,
  prepositionCase: 'Akkusativ' | 'Dativ',
  isFused: boolean,
  hasArticle: boolean,
  article?: string,
): string[] {
  const distractors = new Set<string>();
  const lowerPrep = prep.toLowerCase();
  const isAkk = prepositionCase === 'Akkusativ';

  if (isFused) {
    const targetLower = targetText.toLowerCase();
    const isTargetDat = FUSED_DAT.includes(targetLower);
    const oppositeList = isTargetDat ? FUSED_AKK : FUSED_DAT;
    const sameList = isTargetDat ? FUSED_DAT : FUSED_AKK;

    for (const opp of oppositeList) {
      if (opp !== targetLower) {
        distractors.add(opp);
        break;
      }
    }
    for (const s of sameList) {
      if (s !== targetLower && !distractors.has(s)) {
        distractors.add(s);
        if (distractors.size >= 2) break;
      }
    }
    for (const opp of oppositeList) {
      if (opp !== targetLower && !distractors.has(opp)) {
        distractors.add(opp);
        if (distractors.size >= 3) break;
      }
    }
  } else if (hasArticle && article) {
    const artLower = article.toLowerCase();
    const defaultFallback = isAkk ? 'dem' : 'den';
    const swappedArticle = ARTICLE_CASE_MAP[artLower] || defaultFallback;

    // Trap 1: same prep, wrong case
    const trap1 = `${prep} ${swappedArticle}`;
    if (trap1.toLowerCase() !== targetText.toLowerCase()) {
      distractors.add(trap1);
    }

    // Trap 2: alt prep, same case
    const sameCasePool = isAkk
      ? ['an', 'auf', 'über', 'für', 'in', 'um'].filter(p => p !== lowerPrep)
      : ['von', 'mit', 'zu', 'bei', 'an', 'in', 'nach'].filter(p => p !== lowerPrep);

    for (const altPrep of sameCasePool) {
      const candidate = `${altPrep} ${article}`;
      if (candidate.toLowerCase() !== targetText.toLowerCase() && !distractors.has(candidate)) {
        distractors.add(candidate);
        break;
      }
    }

    // Trap 3: alt prep, wrong case
    const wrongCasePool = isAkk
      ? ['mit', 'von', 'zu', 'bei', 'an', 'in'].filter(p => p !== lowerPrep)
      : ['für', 'über', 'um', 'auf', 'an'].filter(p => p !== lowerPrep);

    for (const altPrep of wrongCasePool) {
      const candidate = `${altPrep} ${swappedArticle}`;
      if (candidate.toLowerCase() !== targetText.toLowerCase() && !distractors.has(candidate)) {
        distractors.add(candidate);
        break;
      }
    }

    // Fallback if needed to reach 3
    const allPool = ['auf', 'an', 'für', 'mit', 'über', 'von', 'in', 'zu', 'bei'];
    for (const p of allPool) {
      if (distractors.size >= 3) break;
      const c1 = `${p} ${article}`;
      if (c1.toLowerCase() !== targetText.toLowerCase() && !distractors.has(c1)) {
        distractors.add(c1);
      }
      if (distractors.size >= 3) break;
      const c2 = `${p} ${swappedArticle}`;
      if (c2.toLowerCase() !== targetText.toLowerCase() && !distractors.has(c2)) {
        distractors.add(c2);
      }
    }
  } else {
    // Preposition only
    const pool = isAkk
      ? ['über', 'für', 'an', 'auf', 'in', 'mit', 'von', 'zu', 'nach', 'um']
      : ['mit', 'von', 'zu', 'bei', 'nach', 'auf', 'an', 'für', 'über', 'in'];
    for (const p of pool) {
      if (p !== lowerPrep && !distractors.has(p)) {
        distractors.add(p);
        if (distractors.size >= 3) break;
      }
    }
  }

  return Array.from(distractors).slice(0, 3);
}
