/**
 * types/verb.ts
 * Полные TypeScript-типы для карточки немецкого глагола в приложении dasVerb
 */

/**
 * Поддерживаемые языки перевода
 */
export type SupportedLanguage = 'ru' | 'en';
export type TranslationMap = Record<SupportedLanguage, string>;

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
export type Tense = 'Präsens' | 'Perfekt' | 'Präteritum' | 'Plusquamperfekt' | 'Futur I' | 'Futur II';

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
 */
export interface VerbRektion {
  requires_object: boolean;
  direct_case: GermanCase | null; // e.g. "Akkusativ" для anrufen, "Dativ" для helfen
  preposition: string | null;     // e.g. "auf", "für", "an"
  preposition_case: Extract<GermanCase, 'Akkusativ' | 'Dativ' | 'Genitiv'> | null;
}

/**
 * Пример предложения с разметкой для подсветки глагольной рамки (Satzklammer)
 */
export interface VerbSentence {
  id: string;
  tense: Tense;
  german: string;
  translation: TranslationMap;
  bracket_parts?: [string, string] | [string]; // e.g. ["rufe", "an"] или ["hat", "angerufen"]
}

/**
 * Главный интерфейс карточки глагола
 */
export interface VerbCard {
  id: string;                         // Уникальный slug (e.g. "anrufen", "sich_freuen")
  infinitive: string;                 // "anrufen"
  translation: TranslationMap;        // { ru: "звонить", en: "to call" }
  level: CEFRLevel;                   // "A1" | "A2" | "B1" | "B2"
  auxiliary: AuxiliaryVerb;           // "haben" | "sein" | "both"
  
  morphology: VerbMorphology;
  principal_parts: PrincipalParts;
  conjugation: VerbConjugation;
  rektion: VerbRektion;
  
  chunk?: string;                     // e.g. "jemanden (Akk) anrufen"
  sentences: VerbSentence[];
}
