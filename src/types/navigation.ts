import { NavigatorScreenParams } from '@react-navigation/native';

export type PracticeStackParamList = {
  PracticeHome: undefined;
  VerbsPracticeList:
    | {
        categoryId?: string;
        categoryTitle?: string;
        infinitives?: string[];
        initialLevel?: 'A1' | 'A2' | 'B1' | 'B2';
      }
    | undefined;
  PrefixPracticeList: undefined;
};

export type MainTabParamList = {
  Practice: NavigatorScreenParams<PracticeStackParamList>;
  Dictionary: undefined;
};

export interface VerbQuizQuestionResult {
  sentenceGerman: string;
  isCorrect: boolean;
  userAnswers: string[];
  correctAnswers: string[];
  translation: Record<string, string>;
}

export interface QuizResultsParams {
  infinitive?: string;
  level?: string;
  isCheckpoint?: boolean;
  checkpointId?: string;
  checkpointNumber?: number;
  fromIndex?: number;
  toIndex?: number;
  isSmartQuiz?: boolean;
  isCategoryQuiz?: boolean;
  categoryId?: string;
  categoryTitle?: string;
  prefixLevelId?: string;
  isPrefixCheckpoint?: boolean;
  prefixCefrLevel?: string;
  nextQuizParams?: RootStackParamList['VerbQuiz'] | null;
  returnRouteName?: 'PrefixPracticeList' | 'VerbsPracticeList' | 'PracticeHome';
  results: VerbQuizQuestionResult[];
}

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  LanguageSelector: { isSettingsMode?: boolean } | undefined;
  FirstOpenPaywall: { isDebugPreview?: boolean } | undefined;
  Settings: undefined;
  Debug: undefined;
  VerbQuiz: {
    infinitive?: string;
    level?: string;
    isCheckpoint?: boolean;
    checkpointId?: string;
    checkpointNumber?: number;
    fromIndex?: number;
    toIndex?: number;
    infinitives?: string[];
    isSmartQuiz?: boolean;
    isCategoryQuiz?: boolean;
    categoryId?: string;
    categoryTitle?: string;
    prefixLevelId?: string;
    isPrefixCheckpoint?: boolean;
    prefixCefrLevel?: string;
  };
  QuizResults: QuizResultsParams;
};
