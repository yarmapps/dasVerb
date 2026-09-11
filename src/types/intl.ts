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
    prefixBannerBadge?: string;
    prefixBannerTitle?: string;
    prefixBannerSubtitle?: string;
  };
  categories?: {
    sectionTitle: string;
    sectionSubtitle: string;
    verbsCount: string;
    movement: {
      title: string;
      subtitle: string;
    };
    communication: {
      title: string;
      subtitle: string;
    };
    homeDaily: {
      title: string;
      subtitle: string;
    };
    foodDrink: {
      title: string;
      subtitle: string;
    };
    workStudy: {
      title: string;
      subtitle: string;
    };
    shoppingMoney: {
      title: string;
      subtitle: string;
    };
    thoughtsFeelings: {
      title: string;
      subtitle: string;
    };
    leisureHobbies: {
      title: string;
      subtitle: string;
    };
    health: {
      title: string;
      subtitle: string;
    };
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
    checkpointTitle?: string;
    finalTestTitle?: string;
    finalTestTitleWithLevel?: string;
    finalTestSubtitle?: string;
    categoryFinalTestSubtitle?: string;
    checkpointSubtitle?: string;
  };
  prefixPracticeListScreen?: {
    title: string;
    levelNumber: string;
    checkpointTitle: string;
    checkpointSubtitle: string;
    subgroupSeparable: string;
    subgroupInseparable: string;
    subgroupOpposites: string;
    subgroupDual: string;
  };
  prefixPractice?: {
    title: string;
    levelTitle: string;
    checkpointTitle: string;
  };
  prefixGrammarHint?: {
    separableTitle: string;
    inseparableTitle: string;
    dualTitle: string;
    separableRule: string;
    inseparableRule: string;
    dualRule: string;
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
    notificationsPermissionRequiredTitle?: string;
    notificationsPermissionRequiredMessage?: string;
    openSettings?: string;
    cancel?: string;
    dataSection?: string;
    resetProgress?: string;
    resetProgressTitle?: string;
    resetProgressMessage?: string;
    resetProgressConfirm?: string;
    resetProgressSuccess?: string;
    resetSettings?: string;
    resetSettingsTitle?: string;
    resetSettingsMessage?: string;
    resetSettingsConfirm?: string;
    resetSettingsSuccess?: string;
    resetSuccessTitle?: string;
  };
  notifications?: {
    reminderTitle: string;
    reminderBody: string;
    trialReminderTitle: string;
    trialReminderBody: string;
    streakReminderTitle: string;
    streakReminderBody: string;
  };
  firstOpenPaywall?: {
    trialBadge: string;
    title: string;
    subtitle: string;
    cta: string;
    restore: string;
    proceedLimited: string;
    priceYearlyWithCoffee: string;
    disclaimer: string;
    disclaimerFallback: string;
    priceWithTrial: string;
    priceYearly: string;
    timeline: {
      today: {
        day: string;
        headline: string;
        benefits: {
          noAds: {
            title: string;
            text: string;
          };
          unlimitedQuizzes: {
            title: string;
            text: string;
          };
          allLevels: {
            title: string;
            text: string;
          };
          smartQuizMode: {
            title: string;
            text: string;
          };
        };
      };
      day2: {
        day: string;
        headline: string;
        description: string;
      };
      day3: {
        day: string;
        headline: string;
        description: string;
      };
    };
  };
  quizSettingsModal: {
    title: string;
  };
  premiumSheets?: {
    subscribeTitle: string;
    subscribeSubtitle: string;
    subscribeNow: string;
    buyNow: string;
    viewPlans: string;
    premiumFeaturesLabel: string;
    disclaimerAutoRenew: string;
    disclaimerAutoRenewTrial: string;
    disclaimerOneTime: string;
    freeTrialDays: string;
    freeTrialWeeks: string;
    freeTrialMonths: string;
    freeTrialYears: string;
    trialUnit: {
      day: string;
      week: string;
      month: string;
      year: string;
    };
    periodMonth: string;
    periodYear: string;
    restorePurchases: string;
    errorTitle: string;
    errorUnavailable: string;
    errorPurchase: string;
    errorRestore: string;
    restoreSuccessTitle: string;
    restoreSuccessMessage: string;
    restoreNothingTitle: string;
    restoreNothingMessage: string;
    termsOfService: string;
    privacyPolicy: string;
    plans: {
      monthlyLabel: string;
      monthlyPer: string;
      yearlyLabel: string;
      yearlyBadge: string;
      perMonth: string;
      lifetimeLabel: string;
      lifetimePer: string;
      lifetimeBadge: string;
    };
    features: {
      noAdsTitle: string;
      noAdsShort: string;
      noAdsDescription: string;
      unlimitedQuizzesTitle: string;
      unlimitedQuizzesShort: string;
      unlimitedQuizzesDescription: string;
      allLevelsTitle: string;
      allLevelsShort: string;
      allLevelsDescription: string;
      smartQuizModeTitle: string;
      smartQuizModeShort: string;
      smartQuizModeDescription: string;
      naturalVoiceTitle: string;
      naturalVoiceShort: string;
      naturalVoiceDescription: string;
    };
  };
  appUpdate?: {
    title: string;
    softMessage: string;
    forceMessage: string;
    button: string;
    close: string;
  };
  debugScreen?: {
    title: string;
    sectionState: string;
    sectionDailyLimit: string;
    sectionStreak: string;
    sectionSettings: string;
    sectionAppUpdate: string;
    sectionReview: string;
    dailyQuizzes: string;
    totalQuizzes: string;
    extraQuizzes: string;
    adGrants: string;
    streakSummary: string;
    resetDailyLimit: string;
    grantExtraQuiz: string;
    consumeQuiz: string;
    resetStreak: string;
    incrementStreak: string;
    resetAllSettings: string;
    triggerSoftUpdate: string;
    triggerForceUpdate: string;
    resetUpdateState: string;
    triggerReview: string;
    resetReviewCooldown: string;
    addCompletedQuizzes: string;
    alertSuccess: string;
    dailyLimitResetSuccess: string;
    streakResetSuccess: string;
    settingsResetSuccess: string;
    reviewTriggerSuccess: string;
    reviewCooldownResetSuccess: string;
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
