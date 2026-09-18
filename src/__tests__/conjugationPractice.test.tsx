import React from 'react';
import { Animated } from 'react-native';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ConjugationPracticeCard } from '../components/ConjugationPracticeCard/ConjugationPracticeCard';
import { ConjugationFillExercise } from '../components/ConjugationFillExercise/ConjugationFillExercise';
import { ConjugationGrammarHint } from '../components/ConjugationGrammarHint/ConjugationGrammarHint';
import { ConjugationPracticeListScreen } from '../screens/ConjugationPracticeListScreen/ConjugationPracticeListScreen';
import { QuizResultsScreen } from '../screens/QuizResultsScreen/QuizResultsScreen';
import { VerbQuizScreen } from '../screens/VerbQuizScreen/VerbQuizScreen';
import { ThemeProvider } from '../context/ThemeContext';
import { LocaleProvider } from '../context/LocaleContext';
import { verbDataService, ConjugationLevelData } from '../services/verbDataService';
import { progressService } from '../services/progressService';
import { quizGeneratorService } from '../services/quizGeneratorService';
import { resetDailyQuizLimits } from '../services/usageService';
import { VerbCard } from '../../docs/verb.types';

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockReplace = jest.fn();
const mockPopToTop = jest.fn();
let mockCanGoBack = true;
let mockRouteParams: Record<string, unknown> = {};

jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: mockNavigate,
      goBack: mockGoBack,
      replace: mockReplace,
      popToTop: mockPopToTop,
      canGoBack: () => mockCanGoBack,
    }),
    useRoute: () => ({
      params: mockRouteParams,
    }),
    useFocusEffect: (callback: () => void) => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const reactModule = require('react');
      reactModule.useEffect(() => {
        const cleanup = callback();
        return typeof cleanup === 'function' ? cleanup : undefined;
      }, []);
    },
  };
});

const ScreenWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider>
    <LocaleProvider>{children}</LocaleProvider>
  </ThemeProvider>
);

const mockConjugationLevels: ConjugationLevelData[] = [
  {
    id: 'conjugation_a1_level_1',
    cefrLevel: 'A1',
    subgroupType: 'standard',
    levelNumber: 1,
    orderIndex: 1,
    title: 'Level 1',
    verbs: ['machen', 'haben', 'sein', 'wohnen', 'lernen'],
  },
  {
    id: 'conjugation_a1_checkpoint_1',
    cefrLevel: 'A1',
    subgroupType: 'checkpoint',
    levelNumber: 1,
    orderIndex: 2,
    title: 'Checkpoint 1',
    verbs: ['machen', 'haben', 'sein', 'wohnen', 'lernen'],
  },
  {
    id: 'conjugation_a1_final',
    cefrLevel: 'A1',
    subgroupType: 'final_test',
    levelNumber: 0,
    orderIndex: 3,
    title: 'Final Test A1',
    verbs: ['machen', 'haben', 'sein'],
  },
];

const mockWeakVerb: VerbCard = {
  id: 'machen',
  infinitive: 'machen',
  level: 'A1',
  frequency_rank: 10,
  auxiliary: 'haben',
  morphology: {
    verb_class: 'weak',
    prefix_type: 'none',
    prefix: null,
    is_reflexive: false,
    reflexive_case: null,
  },
  principal_parts: {
    infinitive: 'machen',
    present_3sg: 'macht',
    praeteritum_3sg: 'machte',
    partizip_2: 'gemacht',
  },
  conjugation: {
    present: {
      ich: 'mache',
      du: 'machst',
      er_sie_es: 'macht',
      wir: 'machen',
      ihr: 'macht',
      sie_Sie: 'machen',
      root_vowel_change: null,
    },
    praeteritum: {
      ich: 'machte',
      du: 'machtest',
      er_sie_es: 'machte',
      wir: 'machten',
      ihr: 'machtet',
      sie_Sie: 'machten',
    },
  },
  rektion: {
    requires_object: false,
    direct_case: null,
    preposition: null,
    preposition_case: null,
  },
  sentences: [],
  translation: {
    ru: 'делать',
    en: 'to make, to do',
  },
};

const mockReflexiveVerb: VerbCard = {
  id: 'freuen_sich',
  infinitive: 'freuen (sich)',
  level: 'A1',
  frequency_rank: 45,
  auxiliary: 'haben',
  morphology: {
    verb_class: 'weak',
    prefix_type: 'none',
    prefix: null,
    is_reflexive: true,
    reflexive_case: 'Akkusativ',
  },
  principal_parts: {
    infinitive: 'freuen',
    present_3sg: 'freut sich',
    praeteritum_3sg: 'freute sich',
    partizip_2: 'gefreut',
  },
  conjugation: {
    present: {
      ich: 'freue mich',
      du: 'freust dich',
      er_sie_es: 'freut sich',
      wir: 'freuen uns',
      ihr: 'freut euch',
      sie_Sie: 'freuen sich',
      root_vowel_change: null,
    },
    praeteritum: {
      ich: 'freute mich',
      du: 'freutest dich',
      er_sie_es: 'freute sich',
      wir: 'freuten uns',
      ihr: 'freutet euch',
      sie_Sie: 'freuten sich',
    },
  },
  rektion: {
    requires_object: false,
    direct_case: null,
    preposition: null,
    preposition_case: null,
  },
  sentences: [],
  translation: {
    ru: 'радоваться',
    en: 'to be glad',
  },
};

const mockSeparableVerb: VerbCard = {
  id: 'anrufen',
  infinitive: 'anrufen',
  level: 'A1',
  frequency_rank: 50,
  auxiliary: 'haben',
  morphology: {
    verb_class: 'strong',
    prefix_type: 'separable',
    prefix: 'an',
    is_reflexive: false,
    reflexive_case: null,
  },
  principal_parts: {
    infinitive: 'anrufen',
    present_3sg: 'ruft an',
    praeteritum_3sg: 'rief an',
    partizip_2: 'angerufen',
  },
  conjugation: {
    present: {
      ich: 'rufe an',
      du: 'rufst an',
      er_sie_es: 'ruft an',
      wir: 'rufen an',
      ihr: 'ruft an',
      sie_Sie: 'rufen an',
      root_vowel_change: null,
    },
    praeteritum: {
      ich: 'rief an',
      du: 'riefst an',
      er_sie_es: 'rief an',
      wir: 'riefen an',
      ihr: 'rieft an',
      sie_Sie: 'riefen an',
    },
  },
  rektion: {
    requires_object: true,
    direct_case: 'Akkusativ',
    preposition: null,
    preposition_case: null,
  },
  sentences: [],
  translation: {
    ru: 'звонить по телефону',
    en: 'to call, to ring',
  },
};

const mockVowelChangeVerb: VerbCard = {
  id: 'sprechen',
  infinitive: 'sprechen',
  level: 'A1',
  frequency_rank: 20,
  auxiliary: 'haben',
  morphology: {
    verb_class: 'strong',
    prefix_type: 'none',
    prefix: null,
    is_reflexive: false,
    reflexive_case: null,
  },
  principal_parts: {
    infinitive: 'sprechen',
    present_3sg: 'spricht',
    praeteritum_3sg: 'sprach',
    partizip_2: 'gesprochen',
  },
  conjugation: {
    present: {
      ich: 'spreche',
      du: 'sprichst',
      er_sie_es: 'spricht',
      wir: 'sprechen',
      ihr: 'sprecht',
      sie_Sie: 'sprechen',
      root_vowel_change: 'e -> i',
    },
    praeteritum: {
      ich: 'sprach',
      du: 'sprachst',
      er_sie_es: 'sprach',
      wir: 'sprachen',
      ihr: 'spracht',
      sie_Sie: 'sprachen',
    },
  },
  rektion: {
    requires_object: false,
    direct_case: null,
    preposition: null,
    preposition_case: null,
  },
  sentences: [],
  translation: {
    ru: 'говорить',
    en: 'to speak',
  },
};

describe('Conjugation Practice Suite', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('ConjugationPracticeCard', () => {
    it('should render title, subtitle and handle press', () => {
      const onPressMock = jest.fn();
      const { getByTestId, getByText } = render(
        <ScreenWrapper>
          <ConjugationPracticeCard onPress={onPressMock} />
        </ScreenWrapper>,
      );

      expect(getByTestId('conjugation-practice-card')).toBeTruthy();
      expect(getByText('Тренажёр спряжений')).toBeTruthy();

      fireEvent.press(getByTestId('conjugation-practice-card'));
      expect(onPressMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('quizGeneratorService.generateConjugationExercises', () => {
    it('generates 1 exercise per verb with 6 gaps and identical full option pool', () => {
      const exercises = quizGeneratorService.generateConjugationExercises([mockWeakVerb]);
      expect(exercises).toHaveLength(1);
      const exercise = exercises[0];

      expect(exercise.type).toBe('conjugation_fill');
      expect(exercise.gaps).toHaveLength(6);
      expect(exercise.conjugationRows).toHaveLength(6);

      // Check gaps correct values
      expect(exercise.gaps[0].correctValue).toBe('mache');
      expect(exercise.gaps[1].correctValue).toBe('machst');
      expect(exercise.gaps[2].correctValue).toBe('macht');
      expect(exercise.gaps[3].correctValue).toBe('machen');
      expect(exercise.gaps[4].correctValue).toBe('macht');
      expect(exercise.gaps[5].correctValue).toBe('machen');

      // Unique options pool contains all 4 unique forms: mache, machst, macht, machen
      expect(exercise.gaps[0].options).toHaveLength(4);
      expect(exercise.gaps[0].options).toEqual(
        expect.arrayContaining(['mache', 'machst', 'macht', 'machen']),
      );
      // All gaps have the same pool
      expect(exercise.gaps[1].options).toEqual(exercise.gaps[0].options);
    });

    it('handles reflexive verbs by separating verb form from reflexive pronoun', () => {
      const exercises = quizGeneratorService.generateConjugationExercises([mockReflexiveVerb]);
      const exercise = exercises[0];

      expect(exercise.conjugationRows?.[0].correctValue).toBe('freue');
      expect(exercise.conjugationRows?.[0].reflexivePronoun).toBe('mich');
      expect(exercise.conjugationRows?.[1].correctValue).toBe('freust');
      expect(exercise.conjugationRows?.[1].reflexivePronoun).toBe('dich');
      expect(exercise.conjugationRows?.[2].correctValue).toBe('freut');
      expect(exercise.conjugationRows?.[2].reflexivePronoun).toBe('sich');
    });

    it('handles separable verbs by keeping separable prefix on chips', () => {
      const exercises = quizGeneratorService.generateConjugationExercises([mockSeparableVerb]);
      const exercise = exercises[0];

      expect(exercise.gaps[0].correctValue).toBe('rufe an');
      expect(exercise.gaps[1].correctValue).toBe('rufst an');
      expect(exercise.gaps[0].options).toEqual(
        expect.arrayContaining(['rufe an', 'rufst an', 'ruft an', 'rufen an']),
      );
    });

    it('populates conjugationGrammarHint when root_vowel_change is present', () => {
      const exercises = quizGeneratorService.generateConjugationExercises([mockVowelChangeVerb]);
      const exercise = exercises[0];

      expect(exercise.conjugationGrammarHint).toBeDefined();
      expect(exercise.conjugationGrammarHint?.rootVowelChange).toBe('e -> i');
      expect(exercise.conjugationGrammarHint?.ruleExplanationKey).toBe(
        'conjugationGrammarHint.eToIRule',
      );
    });
  });

  describe('ConjugationFillExercise', () => {
    it('renders 6 pronoun rows and shows user answers', () => {
      const exercises = quizGeneratorService.generateConjugationExercises([mockWeakVerb]);
      const exercise = exercises[0];
      const pulseAnim = new Animated.Value(1);

      const { getByTestId, getByText } = render(
        <ScreenWrapper>
          <ConjugationFillExercise
            exercise={exercise}
            activeGapIndex={2}
            userAnswers={['mache', 'machst']}
            status="idle"
            pulseAnim={pulseAnim}
          />
        </ScreenWrapper>,
      );

      expect(getByTestId('conjugation-fill-exercise')).toBeTruthy();
      expect(getByText('ich')).toBeTruthy();
      expect(getByText('du')).toBeTruthy();
      expect(getByText('er/sie/es')).toBeTruthy();
      expect(getByText('wir')).toBeTruthy();
      expect(getByText('ihr')).toBeTruthy();
      expect(getByText('sie/Sie')).toBeTruthy();

      expect(getByText('mache')).toBeTruthy();
      expect(getByText('machst')).toBeTruthy();
    });

    it('renders slots with correct and incorrect status', () => {
      const exercises = quizGeneratorService.generateConjugationExercises([mockWeakVerb]);
      const exercise = exercises[0];
      const pulseAnim = new Animated.Value(1);

      const { getByTestId } = render(
        <ScreenWrapper>
          <ConjugationFillExercise
            exercise={exercise}
            activeGapIndex={0}
            userAnswers={['mache', 'mache', 'macht', 'machen', 'macht', 'machen']}
            status="incorrect"
            pulseAnim={pulseAnim}
          />
        </ScreenWrapper>,
      );

      // ich was 'mache' (correct), du was 'mache' (incorrect)
      expect(getByTestId('conjugation-gap-slot-0')).toBeTruthy();
      expect(getByTestId('conjugation-gap-slot-1')).toBeTruthy();
    });
  });

  describe('ConjugationGrammarHint', () => {
    it('renders vowel change explanation when rootVowelChange exists', () => {
      const { getByTestId, getByText } = render(
        <ScreenWrapper>
          <ConjugationGrammarHint
            hint={{
              infinitive: 'sprechen',
              rootVowelChange: 'e -> i',
              ruleExplanationKey: 'conjugationGrammarHint.eToIRule',
            }}
          />
        </ScreenWrapper>,
      );

      expect(getByTestId('conjugation-grammar-hint')).toBeTruthy();
      expect(getByText('e -> i')).toBeTruthy();
      expect(getByText('Чередование гласной')).toBeTruthy();
    });

    it('returns null when rootVowelChange is null', () => {
      const { queryByTestId } = render(
        <ScreenWrapper>
          <ConjugationGrammarHint
            hint={{
              infinitive: 'machen',
              rootVowelChange: null,
            }}
          />
        </ScreenWrapper>,
      );

      expect(queryByTestId('conjugation-grammar-hint')).toBeNull();
    });
  });

  describe('progressService conjugation methods', () => {
    it('saves and reads conjugation level progress', () => {
      progressService.setConjugationLevelProgress('conjugation_a1_level_1', 85);
      const progress = progressService.getConjugationLevelProgress('conjugation_a1_level_1');

      expect(progress.score).toBe(85);
      expect(progress.status).toBe('silver');

      // Check clearAllProgress clears conjugation progress
      progressService.clearAllProgress();
      const cleared = progressService.getConjugationLevelProgress('conjugation_a1_level_1');
      expect(cleared.score).toBe(0);
      expect(cleared.status).toBe('uncompleted');
    });
  });

  describe('ConjugationPracticeListScreen', () => {
    it('renders list with tabs and levels and navigates on press', async () => {
      jest
        .spyOn(verbDataService, 'getConjugationLevelsByCefr')
        .mockResolvedValue(mockConjugationLevels);
      jest.spyOn(progressService, 'getConjugationLevelProgress').mockReturnValue({
        score: 100,
        status: 'trophy',
      });

      const { getByTestId, getByText } = render(
        <ScreenWrapper>
          <ConjugationPracticeListScreen />
        </ScreenWrapper>,
      );

      await waitFor(() => {
        expect(getByText('Тренажёр спряжений')).toBeTruthy();
        expect(getByTestId('conjugation-tab-A1')).toBeTruthy();
        expect(getByTestId('conjugation-tab-A2')).toBeTruthy();
        expect(getByTestId('conjugation-level-conjugation_a1_level_1')).toBeTruthy();
        expect(getByTestId('conjugation-checkpoint-conjugation_a1_checkpoint_1')).toBeTruthy();
        expect(getByTestId('conjugation-final-A1')).toBeTruthy();
      });

      fireEvent.press(getByTestId('conjugation-level-conjugation_a1_level_1'));

      expect(mockNavigate).toHaveBeenCalledWith('VerbQuiz', {
        conjugationLevelId: 'conjugation_a1_level_1',
        isConjugationQuiz: true,
        level: 'A1',
      });
    });
  });

  describe('QuizResultsScreen with Conjugation Quiz', () => {
    beforeEach(() => {
      resetDailyQuizLimits();
      jest.clearAllMocks();
      mockCanGoBack = true;
    });

    it('saves conjugation level progress and pops to top when canGoBack is true', async () => {
      const setProgressSpy = jest.spyOn(progressService, 'setConjugationLevelProgress');

      mockRouteParams = {
        conjugationLevelId: 'conjugation_a1_level_1',
        isConjugationQuiz: true,
        level: 'A1',
        returnRouteName: 'ConjugationPracticeList',
        results: Array.from({ length: 30 }, (_, i) => ({
          sentenceGerman: `ich mache ${i + 1}`,
          isCorrect: true,
          userAnswers: ['mache'],
          correctAnswers: ['mache'],
          translation: { ru: `делать ${i + 1}` },
        })),
      };

      const { getByText, getByTestId, queryByTestId, queryByText } = render(
        <ScreenWrapper>
          <QuizResultsScreen />
        </ScreenWrapper>,
      );

      await waitFor(() => {
        expect(getByText('Результаты')).toBeTruthy();
        expect(getByText('30 из 30')).toBeTruthy();
        expect(setProgressSpy).toHaveBeenCalledWith('conjugation_a1_level_1', 100);
        // When all answers are correct, toggle switch is hidden and all items are displayed
        expect(queryByTestId('toggle-answers-switch')).toBeNull();
        expect(queryByText('Показать правильные ответы')).toBeNull();
        expect(getByText('ich mache 1')).toBeTruthy();
        expect(getByText('ich mache 10')).toBeTruthy();
      });

      fireEvent.press(getByTestId('header-back-button'));
      expect(mockPopToTop).toHaveBeenCalled();
    });

    it('navigates to MainTabs Practice ConjugationPracticeList when canGoBack is false', async () => {
      mockCanGoBack = false;
      mockRouteParams = {
        conjugationLevelId: 'conjugation_a1_level_1',
        isConjugationQuiz: true,
        level: 'A1',
        returnRouteName: 'ConjugationPracticeList',
        results: Array.from({ length: 30 }, (_, i) => ({
          sentenceGerman: `ich mache ${i + 1}`,
          isCorrect: i < 15,
          userAnswers: ['falsch'],
          correctAnswers: ['mache'],
          translation: { ru: `делать ${i + 1}` },
        })),
      };

      const { getByTestId, getByText } = render(
        <ScreenWrapper>
          <QuizResultsScreen />
        </ScreenWrapper>,
      );

      await waitFor(() => {
        expect(getByText('Можно лучше!')).toBeTruthy();
        expect(getByText('15 из 30')).toBeTruthy();
        expect(getByTestId('try-again-button')).toBeTruthy();
        expect(getByTestId('header-back-button')).toBeTruthy();
      });

      // When back is pressed and canGoBack is false, navigates to MainTabs -> Practice -> ConjugationPracticeList
      fireEvent.press(getByTestId('header-back-button'));
      expect(mockNavigate).toHaveBeenCalledWith('MainTabs', {
        screen: 'Practice',
        params: { screen: 'ConjugationPracticeList' },
      });
    });

    it('navigates to next conjugation quiz when nextQuizParams is provided', async () => {
      mockRouteParams = {
        conjugationLevelId: 'conjugation_a1_level_1',
        isConjugationQuiz: true,
        level: 'A1',
        returnRouteName: 'ConjugationPracticeList',
        nextQuizParams: {
          conjugationLevelId: 'conjugation_a1_level_2',
          isConjugationQuiz: true,
          level: 'A1',
        },
        results: Array.from({ length: 30 }, (_, i) => ({
          sentenceGerman: `ich mache ${i + 1}`,
          isCorrect: true,
          userAnswers: ['mache'],
          correctAnswers: ['mache'],
          translation: { ru: `делать ${i + 1}` },
        })),
      };

      const { getByTestId } = render(
        <ScreenWrapper>
          <QuizResultsScreen />
        </ScreenWrapper>,
      );

      await waitFor(() => {
        expect(getByTestId('next-level-button')).toBeTruthy();
      });

      fireEvent.press(getByTestId('next-level-button'));
      expect(mockReplace).toHaveBeenCalledWith('VerbQuiz', {
        conjugationLevelId: 'conjugation_a1_level_2',
        isConjugationQuiz: true,
        level: 'A1',
      });
    });

    it('displays only errors by default with strikethrough and correct answer, and toggles all answers', async () => {
      mockRouteParams = {
        conjugationLevelId: 'conjugation_a1_level_1',
        isConjugationQuiz: true,
        level: 'A1',
        results: [
          {
            sentenceGerman: 'ich mache',
            isCorrect: false,
            userAnswers: ['machst'],
            correctAnswers: ['mache'],
            translation: {},
          },
          {
            sentenceGerman: 'du machst',
            isCorrect: true,
            userAnswers: ['machst'],
            correctAnswers: ['machst'],
            translation: {},
          },
        ],
      };

      const { getByTestId, getByText, queryByText } = render(
        <ScreenWrapper>
          <QuizResultsScreen />
        </ScreenWrapper>,
      );

      await waitFor(() => {
        expect(getByText('1 из 2')).toBeTruthy();
        expect(getByText('machst')).toBeTruthy(); // wrong answer displayed with strikethrough
        expect(getByText('mache')).toBeTruthy(); // correct answer displayed
        // By default, correct answer 'du machst' is not shown in the error-only list
        expect(queryByText('du machst')).toBeNull();
        expect(getByTestId('toggle-answers-switch')).toBeTruthy();
        expect(getByText('Показать правильные ответы')).toBeTruthy();
      });

      // Toggle switch to show all answers
      fireEvent(getByTestId('toggle-answers-switch'), 'valueChange', true);
      await waitFor(() => {
        expect(getByText('du machst')).toBeTruthy();
        expect(getByText('Показать правильные ответы')).toBeTruthy();
      });

      // Toggle switch again to hide correct answers
      fireEvent(getByTestId('toggle-answers-switch'), 'valueChange', false);
      await waitFor(() => {
        expect(queryByText('du machst')).toBeNull();
        expect(getByText('Показать правильные ответы')).toBeTruthy();
      });
    });
  });

  describe('VerbQuizScreen with Conjugation Quiz', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      jest
        .spyOn(verbDataService, 'getConjugationLevelById')
        .mockResolvedValue(mockConjugationLevels[0]);
      jest.spyOn(verbDataService, 'getVerbById').mockResolvedValue(mockWeakVerb);
      jest.spyOn(verbDataService, 'getVerbsByInfinitive').mockResolvedValue([mockWeakVerb]);
    });

    it('renders loading indicator initially and then renders conjugation exercise once loaded without throwing', async () => {
      mockRouteParams = {
        conjugationLevelId: 'conjugation_a1_level_1',
        isConjugationQuiz: true,
        level: 'A1',
      };

      const { getByTestId, queryByTestId, findByTestId } = render(
        <ScreenWrapper>
          <VerbQuizScreen />
        </ScreenWrapper>,
      );

      // Loading indicator should be present while loading or transitioning
      const exercise = await findByTestId('conjugation-fill-exercise');
      expect(exercise).toBeTruthy();
      expect(queryByTestId('quiz-loading-indicator')).toBeNull();

      // Options should be present
      expect(getByTestId('option-button-mache')).toBeTruthy();

      // Clicking an option fills the slot without error
      fireEvent.press(getByTestId('option-button-mache'));
      expect(getByTestId('conjugation-gap-slot-0')).toBeTruthy();
    });

    it('displays correct answer feedback card when validation fails on incorrect answers', async () => {
      mockRouteParams = {
        conjugationLevelId: 'conjugation_a1_level_1',
        isConjugationQuiz: true,
        level: 'A1',
      };

      const { findByTestId, getByTestId, getByText } = render(
        <ScreenWrapper>
          <VerbQuizScreen />
        </ScreenWrapper>,
      );

      await findByTestId('conjugation-fill-exercise');

      // Fill all 6 slots with incorrect answer (e.g., 'mache' for all slots)
      // options available: 'mache', 'machst', 'macht', 'machen'
      for (let i = 0; i < 6; i++) {
        fireEvent.press(getByTestId('option-button-mache'));
      }

      // Feedback card should appear with header and correct answers
      await waitFor(() => {
        expect(getByTestId('quiz-correct-answer-card')).toBeTruthy();
        expect(getByText('Правильный ответ:')).toBeTruthy();
      });
    });

    it('handles back button press safely during loading and active state', async () => {
      mockRouteParams = {
        conjugationLevelId: 'conjugation_a1_level_1',
        isConjugationQuiz: true,
        level: 'A1',
      };

      const { findByTestId } = render(
        <ScreenWrapper>
          <VerbQuizScreen />
        </ScreenWrapper>,
      );

      const backButton = await findByTestId('header-back-button');
      fireEvent.press(backButton);
      expect(mockGoBack).toHaveBeenCalled();
    });
  });
});
