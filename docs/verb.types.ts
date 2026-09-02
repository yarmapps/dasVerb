/**
 * types/verb.ts
 * Полные TypeScript-типы для карточки немецкого глагола в приложении dasVerb
 */

export type TranslationMap = Record<string, string>;

/**
 * Уровни владения языком по CEFR
 */
export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

/**
 * Вспомогательный глагол для образования времени Perfekt
 * (haben | sein | both - редкие глаголы, допускающие оба варианта в зависимости от контекста/региона)
 */
export type AuxiliaryVerb = 'haben' | 'sein' | 'both';

/**
 * Морфологический класс глагола
 */
export type VerbClass = 'weak' | 'strong' | 'mixed' | 'modal' | 'auxiliary';

/**
 * Тип приставки глагола
 */
export type PrefixType = 'none' | 'separable' | 'inseparable' | 'dual';

/**
 * Немецкие падежи
 */
export type GermanCase = 'Nominativ' | 'Akkusativ' | 'Dativ' | 'Genitiv';

/**
 * Времена глаголов для примеров
 */
export type Tense =
  | 'Präsens'
  | 'Perfekt'
  | 'Präteritum'
  | 'Plusquamperfekt'
  | 'Futur I'
  | 'Futur II'
  | 'Imperativ';

/**
 * Морфологические свойства глагола
 */
export interface VerbMorphology {
  verb_class: VerbClass;
  prefix_type: PrefixType;
  prefix: string | null;
  is_reflexive: boolean;
  reflexive_case: Extract<GermanCase, 'Akkusativ' | 'Dativ'> | null;
}

/**
 * 3 основные формы глагола (Stammformen) для тестов и карточек
 */
export interface PrincipalParts {
  infinitive: string;
  present_3sg: string;       // e.g. "ruft an", "liest", "fährt"
  praeteritum_3sg: string;   // e.g. "rief an", "las", "fuhr"
  partizip_2: string;        // e.g. "angerufen", "gelesen", "gefahren"
}

/**
 * Спряжение глагола по лицам в настоящем времени (Präsens)
 */
export interface PresentConjugation {
  ich: string;
  du: string;
  er_sie_es: string;
  wir: string;
  ihr: string;
  sie_Sie: string;
  root_vowel_change?: 'e -> i' | 'e -> ie' | 'a -> ä' | 'au -> äu' | null;
}

/**
 * Спряжение по лицам в Präteritum (опционально, актуально для B1+)
 */
export interface PraeteritumConjugation {
  ich: string;
  du: string;
  er_sie_es: string;
  wir: string;
  ihr: string;
  sie_Sie: string;
}

/**
 * Формы повелительного наклонения (Imperativ)
 */
export interface ImperativeConjugation {
  du: string;     // e.g. "ruf an!"
  ihr: string;    // e.g. "ruft an!"
  Sie: string;    // e.g. "rufen Sie an!"
}

/**
 * Полный блок спряжений
 */
export interface VerbConjugation {
  present: PresentConjugation;
  praeteritum?: PraeteritumConjugation;
  imperative?: ImperativeConjugation;
}

/**
 * Управление глагола (Rektion & Kasus)
 * ПРАВИЛО: В поле preposition указываются только чистые базовые предлоги (напр. "in", "auf", "an", "mit", "zu").
 * Слитные формы предлогов с артиклями ("im", "am", "zum", "zur", "beim", "ins") СТРОГО ЗАПРЕЩЕНЫ.
 */
export interface VerbRektion {
  requires_object: boolean;
  direct_case: GermanCase | 'Dativ + Akkusativ' | null; // e.g. "Akkusativ", "Dativ", "Dativ + Akkusativ" (для geben, schenken)
  preposition: string | null; // e.g. "auf", "für", "an", "in" (только базовые предлоги)
  preposition_case:
    | Extract<GermanCase, 'Akkusativ' | 'Dativ' | 'Genitiv'>
    | 'Akkusativ + Dativ'
    | null;
}

/**
 * Пример предложения с разметкой для подсветки глагольной рамки (Satzklammer)
 */
export interface VerbSentence {
  id: string;
  tense: Tense;
  german: string;
  translation: TranslationMap;
  bracket_parts?: string[]; // e.g. ["rufe", "an"] или ["hat", "angerufen"]
  dativ_parts?: string[]; // e.g. ["mir", "ihm", "mit dem Arzt"] (фиолетовая подсветка)
  akkusativ_parts?: string[]; // e.g. ["das Buch", "dich", "über das Problem"] (синяя подсветка)
}

/**
 * Главный интерфейс карточки глагола
 */
export interface VerbCard {
  id: string;                         // Уникальный slug (e.g. "anrufen", "sich_freuen")
  infinitive: string;                 // "anrufen"
  translation: TranslationMap;        // { ru: "звонить", en: "to call" }
  level: CEFRLevel;                   // "A1" | "A2" | "B1" | "B2"
  frequency_rank: number;             // Позиция по частотности употребления (1 = sein, 2 = haben...)
  auxiliary: AuxiliaryVerb;           // "haben" | "sein" | "both"
  
  morphology: VerbMorphology;
  principal_parts: PrincipalParts;
  conjugation: VerbConjugation;
  rektion: VerbRektion;
  
  chunk?: string;                     // e.g. "jemanden (Akk) anrufen"
  sentences: VerbSentence[];
}
