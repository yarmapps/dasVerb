/**
 * Answer validation utilities for German quiz exercises.
 * Implements tolerant comparison rules:
 * - Trimming and case insensitivity
 * - Collapsing multiple spaces
 * - Umlaut and sharp S tolerance (ä <-> ae, ö <-> oe, ü <-> ue, ß <-> ss)
 * - Contraction / preposition + article equivalence (e.g., 'im' <-> 'in dem')
 * - Inseparable prefix slot tolerance (empty string, '-', '—' for inseparable verbs)
 */

export const PREPOSITION_EQUIVALENTS: Record<string, string> = {
  im: 'in dem',
  am: 'an dem',
  vom: 'von dem',
  beim: 'bei dem',
  zum: 'zu dem',
  zur: 'zu der',
  ins: 'in das',
  ans: 'an das',
  aufs: 'auf das',
  fürs: 'für das',
  durchs: 'durch das',
  hinters: 'hinter das',
  unters: 'unter das',
  übers: 'über das',
  vors: 'vor das',
};

// Build two-way lookup map for canonical resolution
const PREPOSITION_CANONICAL_MAP: Map<string, string> = new Map();

Object.entries(PREPOSITION_EQUIVALENTS).forEach(([contracted, expanded]) => {
  const normContracted = normalizeBase(contracted);
  const normExpanded = normalizeBase(expanded);
  PREPOSITION_CANONICAL_MAP.set(normContracted, normContracted);
  PREPOSITION_CANONICAL_MAP.set(normExpanded, normContracted);
});

function normalizeBase(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss');
}

/**
 * Normalizes user input and target answer to canonical form.
 */
export function normalizeGermanAnswer(text: string): string {
  const base = normalizeBase(text);
  const prepositionCanonical = PREPOSITION_CANONICAL_MAP.get(base);
  if (prepositionCanonical !== undefined) {
    return prepositionCanonical;
  }
  return base;
}

/**
 * Checks if user input matches target answer according to tolerant German rules.
 */
export function isAnswerCorrect(
  userInput: string | undefined | null,
  targetAnswer: string | undefined | null,
  _exerciseType?: string,
): boolean {
  const rawInput = (userInput || '').trim();
  const rawTarget = (targetAnswer || '').trim();

  // Special case: Prefix quiz inseparable slot (represented as '—')
  if (rawTarget === '—' || rawTarget === '-') {
    return rawInput === '' || rawInput === '-' || rawInput === '—';
  }

  const normalizedInput = normalizeGermanAnswer(rawInput);
  const normalizedTarget = normalizeGermanAnswer(rawTarget);

  return normalizedInput === normalizedTarget;
}
