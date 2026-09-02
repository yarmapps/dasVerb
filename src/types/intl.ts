export type SupportedLocales =
  | 'en'
  | 'es'
  | 'fr'
  | 'it'
  | 'pl'
  | 'pt'
  | 'ru'
  | 'tr'
  | 'uk'
  | 'ar'
  | 'fa';

export interface Translation {
  navigation: {
    practice: string;
    dictionary: string;
  };
  languageSelectorScreen: {
    title: string;
    continue: string;
  };
  practiceScreen: {
    title: string;
    subtitle: string;
    featuredBadge: string;
    levelsButtonTitle: string;
    levelsButtonSubtitle: string;
    startNow: string;
    smartQuizBadge?: string;
    smartQuizTitle?: string;
    smartQuizSubtitle?: string;
  };
  verbsPracticeListScreen: {
    title: string;
    levelHeader: string;
    verbCount: string;
    uncompleted: string;
    bronze: string;
    silver: string;
    trophy: string;
    empty: string;
  };
  verbQuizScreen: {
    title: string;
    checkpointQuizTitle?: string;
    smartQuizTitle?: string;
    level: string;
    fillCard: string;
    check: string;
    continue: string;
    exercise: string;
    correct: string;
    tryAgain: string;
    tapToContinue: string;
  };
  quizResultsScreen?: {
    title: string;
    checkpointResultsTitle?: string;
    smartQuizResultsTitle?: string;
    canDoBetter?: string;
    almostThere?: string;
    closeToPerfection?: string;
    youDidIt?: string;
    nextLevel?: string;
    tryAgain?: string;
    verbsList?: string;
    backToPractice?: string;
    scoreSummary?: string;
  };
  dailyQuizLimitModal?: {
    title: string;
    message: string;
    instructions: string;
    videoButton: string;
    or: string;
    premiumButtonWithTrial: string;
    premiumButtonNoTrial: string;
    premiumButtonSubtitleWithTrial: string;
    premiumButtonSubtitleNoTrial: string;
    waitUntilTomorrow: string;
    cancelAnytime: string;
  };
  dictionaryScreen: {
    title: string;
    searchPlaceholder: string;
    emptySearch: string;
    stammformen: string;
    infinitive: string;
    present3sg: string;
    praeteritum3sg: string;
    perfekt: string;
    conjugation: string;
    person: string;
    present: string;
    praeteritum: string;
    rektion: string;
    imperative: string;
    examples: string;
  };
  settingsScreen: {
    title: string;
    generalSection: string;
    audioSection: string;
    supportSection: string;
    appLanguage: string;
    theme: string;
    themeLight: string;
    themeDark: string;
    themeSystem: string;
    notifications: string;
    soundEffects: string;
    speakOnCorrectAnswer: string;
    voiceGender: string;
    voiceFemale: string;
    voiceMale: string;
    maleVoiceHint: string;
    contactUs: string;
    version: string;
  };
  quizSettingsModal: {
    title: string;
  };
}

export interface LanguageOption {
  code: SupportedLocales;
  name: string;
  flag: string;
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pl', name: 'Polski', flag: '🇵🇱' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'uk', name: 'Українська', flag: '🇺🇦' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'fa', name: 'فارسی', flag: '🇮🇷' },
];
