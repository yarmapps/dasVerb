import { NavigatorScreenParams } from '@react-navigation/native';

export type PracticeStackParamList = {
  PracticeHome: undefined;
  VerbsPracticeList: undefined;
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
  results: VerbQuizQuestionResult[];
}

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  LanguageSelector: { isSettingsMode?: boolean } | undefined;
  Settings: undefined;
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
  };
  QuizResults: QuizResultsParams;
};
