import React from 'react';
import { Animated } from 'react-native';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { VerbFormsPracticeCard } from '../components/VerbFormsPracticeCard/VerbFormsPracticeCard';
import { VerbFormsFillExercise } from '../components/VerbFormsFillExercise/VerbFormsFillExercise';
import { VerbFormsGrammarHint } from '../components/VerbFormsGrammarHint/VerbFormsGrammarHint';
import { VerbFormsPracticeListScreen } from '../screens/VerbFormsPracticeListScreen/VerbFormsPracticeListScreen';
import { QuizResultsScreen } from '../screens/QuizResultsScreen/QuizResultsScreen';
import { ThemeProvider } from '../context/ThemeContext';
import { LocaleProvider } from '../context/LocaleContext';
import { verbDataService, VerbFormsLevelData } from '../services/verbDataService';
import { progressService } from '../services/progressService';
import { quizGeneratorService } from '../services/quizGeneratorService';
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

const mockVerbFormsLevels: VerbFormsLevelData[] = [
  {
    id: 'verb_forms_a1_level_1',
    cefrLevel: 'A1',
    subgroupType: 'standard',
    levelNumber: 1,
    orderIndex: 1,
    title: 'Level 1',
    verbs: ['gehen', 'haben', 'sein', 'wohnen', 'lernen'],
  },
  {
    id: 'verb_forms_a1_checkpoint_1',
    cefrLevel: 'A1',
    subgroupType: 'checkpoint',
    levelNumber: 1,
    orderIndex: 2,
    title: 'Checkpoint 1',
    verbs: [
      'gehen',
      'haben',
      'sein',
      'wohnen',
      'lernen',
      'sehen',
      'kommen',
      'machen',
      'sagen',
      'arbeiten',
    ],
  },
  {
    id: 'verb_forms_a1_final',
    cefrLevel: 'A1',
    subgroupType: 'final_test',
    levelNumber: 0,
    orderIndex: 3,
    title: 'Final Test A1',
    verbs: ['gehen', 'haben', 'sein', 'wohnen', 'lernen'],
  },
  {
    id: 'verb_forms_a2_level_1',
    cefrLevel: 'A2',
    subgroupType: 'standard',
    levelNumber: 1,
    orderIndex: 4,
    title: 'Level 1',
    verbs: ['fahren', 'helfen', 'treffen', 'schlafen', 'lesen'],
  },
];

const mockGehenCard: VerbCard = {
  id: 'gehen',
  infinitive: 'gehen',
  level: 'A1',
  auxiliary: 'sein',
  frequency_rank: 10,
  principal_parts: {
    infinitive: 'gehen',
    present_3sg: 'geht',
    praeteritum_3sg: 'ging',
    partizip_2: 'gegangen',
  },
  morphology: {
    is_reflexive: false,
    prefix_type: 'none',
    prefix: null,
    reflexive_case: null,
    verb_class: 'strong',
  },
  conjugation: {
    present: {
      ich: 'gehe',
      du: 'gehst',
      er_sie_es: 'geht',
      wir: 'gehen',
      ihr: 'geht',
      sie_Sie: 'gehen',
    },
  },
  rektion: {
    requires_object: false,
    direct_case: null,
    preposition: null,
    preposition_case: null,
  },
  translation: {
    ru: 'идти',
    en: 'to go',
  },
  sentences: [],
};

const mockFreuenSichCard: VerbCard = {
  id: 'freuen_sich',
  infinitive: 'sich freuen',
  level: 'A1',
  auxiliary: 'haben',
  frequency_rank: 55,
  principal_parts: {
    infinitive: 'sich freuen',
    present_3sg: 'freut sich',
    praeteritum_3sg: 'freute sich',
    partizip_2: 'gefreut',
  },
  morphology: {
    is_reflexive: true,
    prefix_type: 'none',
    prefix: null,
    reflexive_case: 'Akkusativ',
    verb_class: 'weak',
  },
  conjugation: {
    present: {
      ich: 'freue mich',
      du: 'freust dich',
      er_sie_es: 'freut sich',
      wir: 'freuen uns',
      ihr: 'freut euch',
      sie_Sie: 'freuen sich',
    },
  },
  rektion: {
    requires_object: false,
    direct_case: null,
    preposition: null,
    preposition_case: null,
  },
  translation: {
    ru: 'радоваться',
    en: 'to be pleased',
  },
  sentences: [],
};

describe('Verb Forms Practice Suite', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRouteParams = {};
    mockCanGoBack = true;
  });

  describe('VerbFormsPracticeCard Component', () => {
    it('renders title, subtitle, and badges properly', () => {
      const onPressMock = jest.fn();
      const { getByText } = render(
        <ScreenWrapper>
          <VerbFormsPracticeCard onPress={onPressMock} />
        </ScreenWrapper>,
      );

      expect(getByText(/Irregular Verbs|Неправильные глаголы/i)).toBeTruthy();
      fireEvent.press(getByText(/Irregular Verbs|Неправильные глаголы/i));
      expect(onPressMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('VerbFormsGrammarHint Component', () => {
    it('renders rule explanation and vowel pattern badge correctly', () => {
      const { getByText } = render(
        <ScreenWrapper>
          <VerbFormsGrammarHint
            hint={{
              infinitive: 'gehen',
              fullChain: 'gehen — ging — ist gegangen',
              verbClass: 'strong',
              rootVowelPattern: 'e → i → a',
              auxiliary: 'sein',
              ruleExplanationKey: 'verbFormsGrammarHint.seinRule',
            }}
          />
        </ScreenWrapper>,
      );

      expect(getByText('e → i → a')).toBeTruthy();
      expect(getByText(/sein/i)).toBeTruthy();
    });
  });

  describe('VerbFormsFillExercise Component', () => {
    it('renders 3 slots and handles slot activation', () => {
      const pulseAnim = new Animated.Value(1);
      const onSlotPress = jest.fn();
      const exercises = quizGeneratorService.generateVerbFormsExercises([mockGehenCard], true);

      const { getByTestId, getByText, queryByText } = render(
        <ScreenWrapper>
          <VerbFormsFillExercise
            exercise={exercises[0]}
            userAnswers={['ging', '', '']}
            activeSlotIndex={1}
            status="idle"
            pulseAnim={pulseAnim}
            onSlotPress={onSlotPress}
          />
        </ScreenWrapper>,
      );

      expect(getByText('gehen')).toBeTruthy();
      expect(queryByText('to go')).toBeNull();

      const praetSlot = getByTestId('praeteritum-slot-touch');
      fireEvent.press(praetSlot);
      expect(onSlotPress).toHaveBeenCalledWith(0);
    });
  });

  describe('quizGeneratorService.generateVerbFormsExercises', () => {
    it('generates 10 exercises for standard level (2 rounds of 5)', () => {
      const cards: VerbCard[] = [
        mockGehenCard,
        mockFreuenSichCard,
        {
          ...mockGehenCard,
          id: 'lernen',
          infinitive: 'lernen',
          principal_parts: {
            ...mockGehenCard.principal_parts,
            infinitive: 'lernen',
            praeteritum_3sg: 'lernte',
            partizip_2: 'gelernt',
          },
        },
        {
          ...mockGehenCard,
          id: 'sehen',
          infinitive: 'sehen',
          principal_parts: {
            ...mockGehenCard.principal_parts,
            infinitive: 'sehen',
            praeteritum_3sg: 'sah',
            partizip_2: 'gesehen',
          },
        },
        {
          ...mockGehenCard,
          id: 'machen',
          infinitive: 'machen',
          principal_parts: {
            ...mockGehenCard.principal_parts,
            infinitive: 'machen',
            praeteritum_3sg: 'machte',
            partizip_2: 'gemacht',
          },
        },
      ];

      const exercises = quizGeneratorService.generateVerbFormsExercises(cards, false);
      expect(exercises).toHaveLength(5);
      expect(exercises[0].type).toBe('verb_forms_fill');
      expect(exercises[0].gaps).toHaveLength(3);

      // Präteritum slot options has 4 items
      expect(exercises[0].gaps[0].options).toHaveLength(4);
      // Auxiliary slot has hat and ist
      expect(exercises[0].gaps[1].options).toEqual(['hat', 'ist']);
      // Partizip II slot has 4 items
      expect(exercises[0].gaps[2].options).toHaveLength(4);
    });

    it('generates 10 exercises for checkpoint (1 round of 10)', () => {
      const cards = Array.from({ length: 10 }, (_, i) => ({
        ...mockGehenCard,
        id: `verb_${i}`,
        infinitive: `verb_${i}`,
      }));

      const exercises = quizGeneratorService.generateVerbFormsExercises(cards, true);
      expect(exercises).toHaveLength(10);
    });

    it('handles reflexive verbs correctly with sich', () => {
      const exercises = quizGeneratorService.generateVerbFormsExercises([mockFreuenSichCard], true);
      expect(exercises).toHaveLength(1);
      const ex = exercises[0];

      expect(ex.verbFormsData?.correctPraeteritum).toBe('freute sich');
      expect(ex.verbFormsData?.correctPartizipII).toBe('sich gefreut');
      expect(ex.gaps[0].correctValue).toBe('freute sich');
      expect(ex.gaps[2].correctValue).toBe('sich gefreut');
    });
  });

  describe('progressService verb forms progress', () => {
    it('saves, retrieves, and clears verb forms level progress', () => {
      progressService.setVerbFormsLevelProgress('verb_forms_a1_level_1', 95);
      const progress = progressService.getVerbFormsLevelProgress('verb_forms_a1_level_1');
      expect(progress.score).toBe(95);
      expect(progress.status).toBe('silver');

      progressService.clearAllProgress();
      const cleared = progressService.getVerbFormsLevelProgress('verb_forms_a1_level_1');
      expect(cleared.score).toBe(0);
      expect(cleared.status).toBe('uncompleted');
    });
  });

  describe('verbDataService verb forms queries', () => {
    beforeEach(() => {
      verbDataService.clearCache();
    });

    it('retrieves verb forms levels and next level', async () => {
      jest.spyOn(verbDataService, 'getAllVerbFormsLevels').mockResolvedValue(mockVerbFormsLevels);
      jest.spyOn(verbDataService, 'getVerbFormsLevelsByCefr').mockImplementation(async cefr => {
        return mockVerbFormsLevels.filter(l => l.cefrLevel === cefr);
      });
      jest.spyOn(verbDataService, 'getVerbFormsLevelById').mockImplementation(async id => {
        return mockVerbFormsLevels.find(l => l.id === id) || null;
      });
      jest.spyOn(verbDataService, 'getNextVerbFormsLevel').mockImplementation(async id => {
        const idx = mockVerbFormsLevels.findIndex(l => l.id === id);
        return idx !== -1 && idx + 1 < mockVerbFormsLevels.length
          ? mockVerbFormsLevels[idx + 1]
          : null;
      });

      const a1Levels = await verbDataService.getVerbFormsLevelsByCefr('A1');
      expect(a1Levels).toHaveLength(3);

      const level1 = await verbDataService.getVerbFormsLevelById('verb_forms_a1_level_1');
      expect(level1?.title).toBe('Level 1');

      const nextLevel = await verbDataService.getNextVerbFormsLevel('verb_forms_a1_level_1');
      expect(nextLevel?.id).toBe('verb_forms_a1_checkpoint_1');
    });
  });

  describe('VerbFormsPracticeListScreen', () => {
    beforeEach(() => {
      jest
        .spyOn(verbDataService, 'getVerbFormsLevelsByCefr')
        .mockResolvedValue([
          mockVerbFormsLevels[0],
          mockVerbFormsLevels[1],
          mockVerbFormsLevels[2],
        ]);
    });

    it('renders tabs and level cards', async () => {
      const { getByText } = render(
        <ScreenWrapper>
          <VerbFormsPracticeListScreen />
        </ScreenWrapper>,
      );

      await waitFor(() => {
        expect(getByText('A1')).toBeTruthy();
        expect(getByText('A2')).toBeTruthy();
      });
    });
  });

  describe('QuizResultsScreen with verb forms quiz', () => {
    it('displays error review item with strikethrough for wrong auxiliary and shows correct form', () => {
      mockRouteParams = {
        verbFormsLevelId: 'verb_forms_a1_level_1',
        isVerbFormsQuiz: true,
        results: [
          {
            sentenceGerman: 'gehen',
            isCorrect: false,
            userAnswers: ['ging', 'hat', 'gegangen'],
            correctAnswers: ['ging', 'ist', 'gegangen'],
            translation: { ru: 'идти', en: 'to go' },
          },
        ],
      };

      const { getByText } = render(
        <ScreenWrapper>
          <QuizResultsScreen />
        </ScreenWrapper>,
      );

      // Infinitiv + correct Präteritum
      expect(getByText(/gehen/)).toBeTruthy();
      expect(getByText(/ging/)).toBeTruthy();
      // User's wrong Perfekt 'hat gegangen'
      expect(getByText('hat gegangen')).toBeTruthy();
      // Correct Perfekt 'ist gegangen' without parentheses
      expect(getByText('ist gegangen')).toBeTruthy();
    });

    it('displays correct checkmark when all 3 forms are right', () => {
      mockRouteParams = {
        verbFormsLevelId: 'verb_forms_a1_level_1',
        isVerbFormsQuiz: true,
        results: [
          {
            sentenceGerman: 'gehen',
            isCorrect: true,
            userAnswers: ['ging', 'ist', 'gegangen'],
            correctAnswers: ['ging', 'ist', 'gegangen'],
            translation: { ru: 'идти', en: 'to go' },
          },
        ],
      };

      const { getByText } = render(
        <ScreenWrapper>
          <QuizResultsScreen />
        </ScreenWrapper>,
      );

      expect(getByText('gehen — ging — ist gegangen')).toBeTruthy();
    });
  });
});
