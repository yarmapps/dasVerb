import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { PrepositionPracticeCard } from '../components/PrepositionPracticeCard/PrepositionPracticeCard';
import { PrepositionGrammarHint } from '../components/PrepositionGrammarHint/PrepositionGrammarHint';
import { PrepositionsPracticeListScreen } from '../screens/PrepositionsPracticeListScreen/PrepositionsPracticeListScreen';
import { QuizResultsScreen } from '../screens/QuizResultsScreen/QuizResultsScreen';
import { ThemeProvider } from '../context/ThemeContext';
import { LocaleProvider } from '../context/LocaleContext';
import { verbDataService, PrepositionLevelData } from '../services/verbDataService';
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

const mockPrepositionLevels: PrepositionLevelData[] = [
  {
    id: 'prep_a1_level_1',
    cefrLevel: 'A1',
    subgroupType: 'standard',
    levelNumber: 1,
    orderIndex: 1,
    title: 'Level 1',
    verbs: [
      { id: 'warten_auf_akk', infinitive: 'warten', prep: 'auf', case: 'Akkusativ' },
      { id: 'denken_an_akk', infinitive: 'denken', prep: 'an', case: 'Akkusativ' },
      { id: 'sprechen_ueber_akk', infinitive: 'sprechen', prep: 'über', case: 'Akkusativ' },
      { id: 'sprechen_mit_dat', infinitive: 'sprechen', prep: 'mit', case: 'Dativ' },
    ],
  },
  {
    id: 'prep_a1_checkpoint_1',
    cefrLevel: 'A1',
    subgroupType: 'checkpoint',
    levelNumber: 1,
    orderIndex: 2,
    title: 'Checkpoint 1',
    verbs: [
      { id: 'warten_auf_akk', infinitive: 'warten', prep: 'auf', case: 'Akkusativ' },
      { id: 'denken_an_akk', infinitive: 'denken', prep: 'an', case: 'Akkusativ' },
    ],
  },
  {
    id: 'prep_a1_final',
    cefrLevel: 'A1',
    subgroupType: 'final_test',
    levelNumber: 0,
    orderIndex: 3,
    title: 'Final Test A1',
    verbs: [{ id: 'warten_auf_akk', infinitive: 'warten', prep: 'auf', case: 'Akkusativ' }],
  },
  {
    id: 'prep_a2_level_1',
    cefrLevel: 'A2',
    subgroupType: 'standard',
    levelNumber: 1,
    orderIndex: 4,
    title: 'Level 1',
    verbs: [{ id: 'abhoengen_von_dat', infinitive: 'abhängen', prep: 'von', case: 'Dativ' }],
  },
];

const mockWartenCard: VerbCard = {
  id: 'warten_auf_akk',
  infinitive: 'warten',
  level: 'A1',
  auxiliary: 'haben',
  frequency_rank: 25,
  principal_parts: {
    infinitive: 'warten',
    present_3sg: 'wartet',
    praeteritum_3sg: 'wartete',
    partizip_2: 'gewartet',
  },
  morphology: {
    is_reflexive: false,
    prefix_type: 'none',
    prefix: null,
    reflexive_case: null,
    verb_class: 'weak',
  },
  conjugation: {
    present: {
      ich: 'warte',
      du: 'wartest',
      er_sie_es: 'wartet',
      wir: 'warten',
      ihr: 'wartet',
      sie_Sie: 'warten',
    },
  },
  rektion: {
    requires_object: true,
    direct_case: null,
    preposition: 'auf',
    preposition_case: 'Akkusativ',
  },
  translation: {
    ru: 'ждать кого-то/что-то',
    en: 'to wait for',
  },
  sentences: [
    {
      id: 's1',
      tense: 'Präsens',
      german: 'Ich warte auf den Bus.',
      translation: {
        ru: 'Я жду автобус.',
        en: 'I am waiting for the bus.',
      },
      bracket_parts: ['warte'],
    },
  ],
};

const mockAbhaengenCard: VerbCard = {
  id: 'abhoengen_von_dat',
  infinitive: 'abhängen',
  level: 'A2',
  auxiliary: 'haben',
  frequency_rank: 120,
  principal_parts: {
    infinitive: 'abhängen',
    present_3sg: 'hängt ab',
    praeteritum_3sg: 'hing ab',
    partizip_2: 'abgehangen',
  },
  morphology: {
    is_reflexive: false,
    prefix_type: 'separable',
    prefix: 'ab',
    reflexive_case: null,
    verb_class: 'strong',
  },
  conjugation: {
    present: {
      ich: 'hänge ab',
      du: 'hängst ab',
      er_sie_es: 'hängt ab',
      wir: 'hängen ab',
      ihr: 'hängt ab',
      sie_Sie: 'hängen ab',
    },
  },
  rektion: {
    requires_object: true,
    direct_case: null,
    preposition: 'von',
    preposition_case: 'Dativ',
  },
  translation: {
    ru: 'зависеть от',
    en: 'to depend on',
  },
  sentences: [
    {
      id: 's2',
      tense: 'Präsens',
      german: 'Das hängt vom Wetter ab.',
      translation: {
        ru: 'Это зависит от погоды.',
        en: 'That depends on the weather.',
      },
      bracket_parts: ['hängt', 'ab'],
    },
  ],
};

describe('Preposition Practice Suite', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRouteParams = {};
    mockCanGoBack = true;
  });

  describe('PrepositionPracticeCard Component', () => {
    it('renders title, subtitle, and badges properly', () => {
      const onPressMock = jest.fn();
      const { getByText } = render(
        <ScreenWrapper>
          <PrepositionPracticeCard onPress={onPressMock} />
        </ScreenWrapper>,
      );

      expect(getByText(/Verbs with Prepositions|Глаголы с предлогами/i)).toBeTruthy();
      fireEvent.press(getByText(/Verbs with Prepositions|Глаголы с предлогами/i));
      expect(onPressMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('PrepositionGrammarHint Component', () => {
    it('renders rule badge and question label with questions correctly', () => {
      const { getByText } = render(
        <ScreenWrapper>
          <PrepositionGrammarHint
            hint={{
              infinitive: 'warten',
              preposition: 'auf',
              prepositionCase: 'Akkusativ',
              questions: 'Worauf? / Auf wen?',
            }}
          />
        </ScreenWrapper>,
      );

      expect(getByText('auf + Akkusativ')).toBeTruthy();
      expect(getByText('warten auf + Akkusativ')).toBeTruthy();
      expect(getByText(/Worauf\? \/ Auf wen\?/)).toBeTruthy();
    });
  });

  describe('quizGeneratorService.generatePrepositionExercises', () => {
    it('creates preposition_fill exercises with correct target and distractors for prep + article', () => {
      const exercises = quizGeneratorService.generatePrepositionExercises([mockWartenCard]);
      expect(exercises.length).toBeGreaterThan(0);
      const ex = exercises[0];

      expect(ex.type).toBe('preposition_fill');
      expect(ex.gaps).toHaveLength(1);
      expect(ex.gaps[0].correctValue).toBe('auf den');
      // Should include case trap 'auf dem'
      expect(ex.gaps[0].options).toContain('auf dem');
      expect(ex.gaps[0].options).toContain('auf den');
      expect(ex.gaps[0].options.length).toBe(4);
      expect(ex.prepositionGrammarHint?.infinitive).toBe('warten');
      expect(ex.prepositionGrammarHint?.preposition).toBe('auf');
      expect(ex.prepositionGrammarHint?.prepositionCase).toBe('Akkusativ');
      expect(ex.prepositionGrammarHint?.questions).toBe('Worauf? / Auf wen?');
    });

    it('creates preposition_fill exercises with fused form (vom)', () => {
      const exercises = quizGeneratorService.generatePrepositionExercises([mockAbhaengenCard]);
      expect(exercises.length).toBe(1);
      const ex = exercises[0];

      expect(ex.type).toBe('preposition_fill');
      expect(ex.gaps[0].correctValue).toBe('vom');
      expect(ex.gaps[0].options).toContain('vom');
      expect(ex.gaps[0].options.length).toBe(4);
      expect(ex.prepositionGrammarHint?.infinitive).toBe('abhängen');
      expect(ex.prepositionGrammarHint?.preposition).toBe('von');
      expect(ex.prepositionGrammarHint?.prepositionCase).toBe('Dativ');
      expect(ex.prepositionGrammarHint?.questions).toBe('Wovon? / Von wem?');
    });
  });

  describe('progressService preposition progress', () => {
    it('saves, retrieves, and clears preposition level progress', () => {
      progressService.setPrepositionLevelProgress('prep_a1_level_1', 90);
      const progress = progressService.getPrepositionLevelProgress('prep_a1_level_1');
      expect(progress.score).toBe(90);
      expect(progress.status).toBe('silver');

      progressService.clearAllProgress();
      const cleared = progressService.getPrepositionLevelProgress('prep_a1_level_1');
      expect(cleared.score).toBe(0);
      expect(cleared.status).toBe('uncompleted');
    });
  });

  describe('verbDataService preposition queries', () => {
    beforeEach(() => {
      verbDataService.clearCache();
    });

    it('retrieves preposition levels and next level', async () => {
      jest
        .spyOn(verbDataService, 'getAllPrepositionLevels')
        .mockResolvedValue(mockPrepositionLevels);
      jest.spyOn(verbDataService, 'getPrepositionLevelsByCefr').mockImplementation(async cefr => {
        return mockPrepositionLevels.filter(l => l.cefrLevel === cefr);
      });
      jest.spyOn(verbDataService, 'getPrepositionLevelById').mockImplementation(async id => {
        return mockPrepositionLevels.find(l => l.id === id) || null;
      });
      jest.spyOn(verbDataService, 'getNextPrepositionLevel').mockImplementation(async id => {
        const idx = mockPrepositionLevels.findIndex(l => l.id === id);
        return idx !== -1 && idx + 1 < mockPrepositionLevels.length
          ? mockPrepositionLevels[idx + 1]
          : null;
      });

      const a1Levels = await verbDataService.getPrepositionLevelsByCefr('A1');
      expect(a1Levels).toHaveLength(3);

      const level1 = await verbDataService.getPrepositionLevelById('prep_a1_level_1');
      expect(level1?.title).toBe('Level 1');

      const nextLevel = await verbDataService.getNextPrepositionLevel('prep_a1_level_1');
      expect(nextLevel?.id).toBe('prep_a1_checkpoint_1');
    });
  });

  describe('PrepositionsPracticeListScreen', () => {
    beforeEach(() => {
      jest
        .spyOn(verbDataService, 'getPrepositionLevelsByCefr')
        .mockResolvedValue([
          mockPrepositionLevels[0],
          mockPrepositionLevels[1],
          mockPrepositionLevels[2],
        ]);
    });

    it('renders tabs and level cards', async () => {
      const { getByText } = render(
        <ScreenWrapper>
          <PrepositionsPracticeListScreen />
        </ScreenWrapper>,
      );

      await waitFor(() => {
        expect(getByText('A1')).toBeTruthy();
        expect(getByText('A2')).toBeTruthy();
      });
    });
  });

  describe('QuizResultsScreen with preposition quiz', () => {
    it('displays error review item with strikethrough and rule badge', () => {
      mockRouteParams = {
        prepositionLevelId: 'prep_a1_level_1',
        isPrepositionQuiz: true,
        results: [
          {
            sentenceGerman: 'Ich warte auf den Bus.',
            isCorrect: false,
            userAnswers: ['auf dem'],
            correctAnswers: ['auf den'],
            prepositionRuleBadge: 'auf + Akkusativ',
            translation: { ru: 'Я жду автобус.', en: 'I am waiting for the bus.' },
          },
        ],
      };

      const { getByText } = render(
        <ScreenWrapper>
          <QuizResultsScreen />
        </ScreenWrapper>,
      );

      expect(getByText('auf + Akkusativ')).toBeTruthy();
      expect(getByText('auf dem')).toBeTruthy();
      expect(getByText('auf den')).toBeTruthy();
    });

    it('displays correct answer item with rule badge', () => {
      mockRouteParams = {
        prepositionLevelId: 'prep_a1_level_1',
        isPrepositionQuiz: true,
        results: [
          {
            sentenceGerman: 'Ich warte auf den Bus.',
            isCorrect: true,
            userAnswers: ['auf den'],
            correctAnswers: ['auf den'],
            prepositionRuleBadge: 'auf + Akkusativ',
            translation: { ru: 'Я жду автобус.', en: 'I am waiting for the bus.' },
          },
        ],
      };

      const { getByText } = render(
        <ScreenWrapper>
          <QuizResultsScreen />
        </ScreenWrapper>,
      );

      expect(getByText('auf + Akkusativ')).toBeTruthy();
      expect(getByText('auf den')).toBeTruthy();
      expect(getByText('Ich warte auf den Bus.')).toBeTruthy();
    });
  });
});
