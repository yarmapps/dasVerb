import React from 'react';
import { FlatList } from 'react-native';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { PracticeScreen } from '../screens/PracticeScreen/PracticeScreen';
import { VerbsPracticeListScreen } from '../screens/VerbsPracticeListScreen/VerbsPracticeListScreen';
import { DictionaryScreen } from '../screens/DictionaryScreen/DictionaryScreen';
import { VerbQuizScreen } from '../screens/VerbQuizScreen/VerbQuizScreen';
import { QuizResultsScreen } from '../screens/QuizResultsScreen/QuizResultsScreen';
import { SettingsScreen } from '../screens/SettingsScreen/SettingsScreen';
import { LanguageSelectorScreen } from '../screens/LanguageSelectorScreen/LanguageSelectorScreen';
import { ThemeProvider } from '../context/ThemeContext';
import { LocaleProvider } from '../context/LocaleContext';
import { verbDataService } from '../services/verbDataService';
import { progressService } from '../services/progressService';
import { resetDailyQuizLimits } from '../services/usageService';
import { setPremiumEnabled } from '../services/premiumAccessService';
import { quizGeneratorService, QuizExercise } from '../services/quizGeneratorService';
import { VerbCard } from '../../docs/verb.types';

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockReset = jest.fn();
const mockReplace = jest.fn();
const mockPopToTop = jest.fn();
let mockRouteParams: Record<string, unknown> = {};

jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: mockNavigate,
      goBack: mockGoBack,
      reset: mockReset,
      replace: mockReplace,
      popToTop: mockPopToTop,
      canGoBack: () => true,
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

const mockVerbs: VerbCard[] = [
  {
    id: 'anrufen',
    infinitive: 'anrufen',
    level: 'A1',
    frequency_rank: 120,
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
      imperative: {
        du: 'ruf an!',
        ihr: 'ruft an!',
        Sie: 'rufen Sie an!',
      },
    },
    rektion: {
      requires_object: true,
      direct_case: 'Akkusativ',
      preposition: null,
      preposition_case: null,
    },
    sentences: [
      {
        id: 's1',
        tense: 'Präsens',
        german: 'Ich rufe dich heute Abend an',
        translation: {
          ru: 'Я позвоню тебе сегодня вечером',
          en: 'I will call you this evening',
        },
        bracket_parts: ['rufe', 'an'],
        akkusativ_parts: ['dich'],
      },
      {
        id: 's2',
        tense: 'Präsens',
        german: 'Rufst du morgen den Arzt an?',
        translation: {
          ru: 'Ты позвонишь завтра врачу?',
          en: 'Will you call the doctor tomorrow?',
        },
        bracket_parts: ['Rufst', 'an'],
        akkusativ_parts: ['den Arzt'],
      },
      {
        id: 's3',
        tense: 'Präsens',
        german: 'Er ruft seine Schwester an',
        translation: {
          ru: 'Он звонит своей сестре',
          en: 'He is calling his sister',
        },
        bracket_parts: ['ruft', 'an'],
        akkusativ_parts: ['seine Schwester'],
      },
      {
        id: 's4',
        tense: 'Präsens',
        german: 'Wir rufen später unsere Kollegen an',
        translation: {
          ru: 'Мы позже позвоним нашим коллегам',
          en: 'We will call our colleagues later',
        },
        bracket_parts: ['rufen', 'an'],
        akkusativ_parts: ['unsere Kollegen'],
      },
      {
        id: 's5',
        tense: 'Präsens',
        german: 'Ruft ihr heute eure Eltern an?',
        translation: {
          ru: 'Вы позвоните сегодня вашим родителям?',
          en: 'Are you calling your parents today?',
        },
        bracket_parts: ['Ruft', 'an'],
        akkusativ_parts: ['eure Eltern'],
      },
      {
        id: 's6',
        tense: 'Präteritum',
        german: 'Gestern rief sie mich überraschend an',
        translation: {
          ru: 'Вчера она неожиданно позвонила мне',
          en: 'Yesterday she called me unexpectedly',
        },
        bracket_parts: ['rief', 'an'],
        akkusativ_parts: ['mich'],
      },
      {
        id: 's7',
        tense: 'Perfekt',
        german: 'Sie haben uns gestern nicht angerufen',
        translation: {
          ru: 'Они вчера нам не позвонили',
          en: 'They did not call us yesterday',
        },
        bracket_parts: ['haben', 'angerufen'],
        akkusativ_parts: ['uns'],
      },
      {
        id: 's8',
        tense: 'Imperativ',
        german: 'Ruf mich bitte morgen an!',
        translation: {
          ru: 'Позвони мне, пожалуйста, завтра!',
          en: 'Please call me tomorrow!',
        },
        bracket_parts: ['Ruf', 'an'],
        akkusativ_parts: ['mich'],
      },
    ],
    translation: { ru: 'звонить', en: 'to call' },
  },
  {
    id: 'fahren_dat_mit',
    infinitive: 'fahren',
    level: 'A1',
    frequency_rank: 33,
    auxiliary: 'sein',
    morphology: {
      verb_class: 'strong',
      prefix_type: 'none',
      prefix: null,
      is_reflexive: false,
      reflexive_case: null,
    },
    principal_parts: {
      infinitive: 'fahren',
      present_3sg: 'fährt',
      praeteritum_3sg: 'fuhr',
      partizip_2: 'gefahren',
    },
    conjugation: {
      present: {
        ich: 'fahre',
        du: 'fährst',
        er_sie_es: 'fährt',
        wir: 'fahren',
        ihr: 'fahrt',
        sie_Sie: 'fahren',
        root_vowel_change: 'a -> ä',
      },
    },
    rektion: {
      requires_object: false,
      direct_case: null,
      preposition: 'mit',
      preposition_case: 'Dativ',
    },
    sentences: [],
    translation: { ru: 'ехать, передвигаться (на транспорте)', en: 'to drive' },
  },
  {
    id: 'fahren_akk_in',
    infinitive: 'fahren',
    level: 'A1',
    frequency_rank: 33,
    auxiliary: 'sein',
    morphology: {
      verb_class: 'strong',
      prefix_type: 'none',
      prefix: null,
      is_reflexive: false,
      reflexive_case: null,
    },
    principal_parts: {
      infinitive: 'fahren',
      present_3sg: 'fährt',
      praeteritum_3sg: 'fuhr',
      partizip_2: 'gefahren',
    },
    conjugation: {
      present: {
        ich: 'fahre',
        du: 'fährst',
        er_sie_es: 'fährt',
        wir: 'fahren',
        ihr: 'fahrt',
        sie_Sie: 'fahren',
        root_vowel_change: 'a -> ä',
      },
    },
    rektion: {
      requires_object: false,
      direct_case: null,
      preposition: 'in',
      preposition_case: 'Akkusativ',
    },
    sentences: [],
    translation: { ru: 'ехать (в страну/город)', en: 'to drive into' },
  },
  {
    id: 'haengen_akk',
    infinitive: 'hängen',
    level: 'A2',
    frequency_rank: 98,
    auxiliary: 'haben',
    morphology: {
      verb_class: 'weak',
      prefix_type: 'none',
      prefix: null,
      is_reflexive: false,
      reflexive_case: null,
    },
    principal_parts: {
      infinitive: 'hängen',
      present_3sg: 'hängt',
      praeteritum_3sg: 'hängte',
      partizip_2: 'gehängt',
    },
    conjugation: {
      present: {
        ich: 'hänge',
        du: 'hängst',
        er_sie_es: 'hängt',
        wir: 'hängen',
        ihr: 'hängt',
        sie_Sie: 'hängen',
        root_vowel_change: null,
      },
    },
    rektion: {
      requires_object: false,
      direct_case: null,
      preposition: 'an',
      preposition_case: 'Akkusativ',
    },
    sentences: [],
    translation: { ru: 'вешать (действие)', en: 'to hang' },
  },
];

const ScreenWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider>
    <LocaleProvider>{children}</LocaleProvider>
  </ThemeProvider>
);

describe('Screens Integration Suite', () => {
  beforeEach(() => {
    mockRouteParams = {};
    jest.clearAllMocks();
    jest.spyOn(verbDataService, 'getAllVerbs').mockResolvedValue(mockVerbs);
    jest.spyOn(verbDataService, 'getVerbsOrderedByDifficulty').mockResolvedValue(mockVerbs);
    jest
      .spyOn(verbDataService, 'getVerbsByInfinitive')
      .mockImplementation(async (infinitive: string) =>
        mockVerbs.filter(v => v.infinitive.toLowerCase() === infinitive.toLowerCase()),
      );
  });

  describe('PracticeScreen', () => {
    it('should render header, settings button and navigate to VerbsPracticeList on featured card press', async () => {
      const { getByTestId, getByText } = render(
        <ScreenWrapper>
          <PracticeScreen />
        </ScreenWrapper>,
      );

      expect(getByText('Практика')).toBeTruthy();
      expect(getByText('Тренируй глаголы')).toBeTruthy();
      expect(getByText('Умный алгоритм')).toBeTruthy();
      expect(getByText('По режимам')).toBeTruthy();
      expect(getByText('По темам')).toBeTruthy();

      const settingsBtn = getByTestId('settings-button');
      fireEvent.press(settingsBtn);
      expect(mockNavigate).toHaveBeenCalledWith('Settings');

      const featuredCard = getByTestId('featured-practice-card');
      fireEvent.press(featuredCard);
      expect(mockNavigate).toHaveBeenCalledWith('VerbsPracticeList');

      // Free user: diamond icon is visible and clicking shows bottom sheet paywall
      expect(getByTestId('smart-quiz-premium-badge')).toBeTruthy();
      const smartCard = getByTestId('smart-quiz-card');
      fireEvent.press(smartCard);
      expect(mockNavigate).not.toHaveBeenCalledWith('VerbQuiz', { isSmartQuiz: true });
    });

    it('should navigate directly to Smart Quiz when user is premium', async () => {
      setPremiumEnabled(true);

      const { getByTestId, queryByTestId } = render(
        <ScreenWrapper>
          <PracticeScreen />
        </ScreenWrapper>,
      );

      expect(queryByTestId('smart-quiz-premium-badge')).toBeNull();
      const smartCard = getByTestId('smart-quiz-card');
      fireEvent.press(smartCard);
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('VerbQuiz', { isSmartQuiz: true });
      });
      setPremiumEnabled(false);
    });
  });

  describe('VerbsPracticeListScreen', () => {
    it('should group verbs by level, deduplicate infinitives and render clean cards', async () => {
      jest.spyOn(progressService, 'getVerbProgress').mockReturnValue({
        score: 100,
        status: 'trophy',
      });

      const { getByText, getByTestId } = render(
        <ScreenWrapper>
          <VerbsPracticeListScreen />
        </ScreenWrapper>,
      );

      await waitFor(() => {
        expect(getByText('Практика глаголов')).toBeTruthy();
        expect(getByTestId('verbs-tab-A1')).toBeTruthy();
        expect(getByTestId('verbs-tab-A2')).toBeTruthy();
        expect(getByText('fahren')).toBeTruthy();
        expect(getByText('to drive')).toBeTruthy();
        expect(getByTestId('verb-practice-level-fahren')).toBeTruthy();
      });

      const fahrenCard = getByTestId('verb-practice-level-fahren');
      fireEvent.press(fahrenCard);
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('VerbQuiz', {
          infinitive: 'fahren',
          level: 'A1',
        });
      });

      // Switch to A2 tab to verify A2 verbs
      fireEvent.press(getByTestId('verbs-tab-A2'));
      await waitFor(() => {
        expect(getByText('hängen')).toBeTruthy();
        expect(getByText('to hang')).toBeTruthy();
      });

      const backButton = getByTestId('header-back-button');
      fireEvent.press(backButton);
      expect(mockGoBack).toHaveBeenCalled();
    });

    it('should render checkpoint card after 10 verbs and navigate to checkpoint quiz', async () => {
      const tenVerbs: VerbCard[] = Array.from({ length: 10 }, (_, i) => ({
        ...mockVerbs[0],
        id: `verb_${i + 1}`,
        infinitive: `verb${i + 1}`,
        level: 'A1',
      }));

      jest.spyOn(verbDataService, 'getVerbsOrderedByDifficulty').mockResolvedValue(tenVerbs);

      const { getByTestId, getByText } = render(
        <ScreenWrapper>
          <VerbsPracticeListScreen />
        </ScreenWrapper>,
      );

      await waitFor(() => {
        expect(getByTestId('checkpoint-card-1')).toBeTruthy();
        expect(getByText('Промежуточный тест')).toBeTruthy();
        expect(getByTestId('level-final-test-A1')).toBeTruthy();
        expect(getByText('Итоговый тест A1')).toBeTruthy();
      });

      const checkpointCard = getByTestId('checkpoint-card-1');
      fireEvent.press(checkpointCard);
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('VerbQuiz', {
          isCheckpoint: true,
          checkpointId: 'checkpoint-a1-1',
          checkpointNumber: 1,
          fromIndex: 1,
          toIndex: 10,
          infinitives: tenVerbs.map(v => v.infinitive),
          level: 'A1',
        });
      });
    });

    it('should render unified list without level headers and with final test card at the end', async () => {
      setPremiumEnabled(true);
      mockRouteParams = {
        categoryId: 'movement',
        categoryTitle: 'Движение и транспорт',
        infinitives: ['fahren'],
      };

      const { getByText, queryByText, getByTestId } = render(
        <ScreenWrapper>
          <VerbsPracticeListScreen />
        </ScreenWrapper>,
      );

      await waitFor(() => {
        expect(getByText('Движение и транспорт')).toBeTruthy();
        expect(getByText('fahren')).toBeTruthy();
        expect(queryByText('hängen')).toBeNull();
        // Level header should NOT be rendered in category mode
        expect(queryByText(/УРОВЕНЬ/i)).toBeNull();
        // Final test card should be rendered at the end
        expect(getByTestId('category-final-test-movement')).toBeTruthy();
        expect(getByText('Финальный тест')).toBeTruthy();
      });

      const finalTestCard = getByTestId('category-final-test-movement');
      fireEvent.press(finalTestCard);
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('VerbQuiz', {
          isCheckpoint: true,
          checkpointId: 'category-movement-final',
          checkpointNumber: 1,
          fromIndex: 1,
          toIndex: 1,
          infinitives: ['fahren'],
          level: 'A1',
          categoryId: 'movement',
        });
      });

      setPremiumEnabled(false);
      mockRouteParams = {};
    });

    it('should auto-scroll to furthest completed verb when entering the screen at index around 50', async () => {
      const sixtyVerbs: VerbCard[] = Array.from({ length: 60 }, (_, i) => ({
        ...mockVerbs[0],
        id: `verb_${i + 1}`,
        infinitive: `verb${i + 1}`,
        level: 'A1',
      }));

      jest.spyOn(verbDataService, 'getVerbsOrderedByDifficulty').mockResolvedValue(sixtyVerbs);
      jest.spyOn(progressService, 'getVerbProgress').mockImplementation((id: string) => {
        const num = Number(id.replace('verb_', ''));
        if (num <= 50) {
          return { score: 100, status: 'trophy' };
        }
        return { score: 0, status: 'uncompleted' };
      });
      jest.spyOn(progressService, 'getCheckpointProgress').mockReturnValue({
        score: 100,
        status: 'trophy',
      });

      const scrollToIndexSpy = jest.spyOn(FlatList.prototype, 'scrollToIndex');

      render(
        <ScreenWrapper>
          <VerbsPracticeListScreen />
        </ScreenWrapper>,
      );

      await waitFor(() => {
        expect(scrollToIndexSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            index: expect.any(Number),
            viewPosition: 0.5,
            animated: true,
          }),
        );
      });

      const calledWith = scrollToIndexSpy.mock.calls[0]?.[0];
      expect(calledWith?.index).toBeGreaterThanOrEqual(50);

      scrollToIndexSpy.mockRestore();
    });

    it('should scroll to offset 0 when switching to a level with no completed verbs', async () => {
      const a1AndB1Verbs: VerbCard[] = [
        { ...mockVerbs[0], id: 'a1_verb', level: 'A1' },
        { ...mockVerbs[0], id: 'b1_verb', level: 'B1' },
      ];
      jest.spyOn(verbDataService, 'getVerbsOrderedByDifficulty').mockResolvedValue(a1AndB1Verbs);
      jest
        .spyOn(progressService, 'getVerbProgress')
        .mockReturnValue({ score: 0, status: 'uncompleted' });
      jest
        .spyOn(progressService, 'getCheckpointProgress')
        .mockReturnValue({ score: 0, status: 'uncompleted' });

      const scrollToOffsetSpy = jest.spyOn(FlatList.prototype, 'scrollToOffset');

      const { getByTestId } = render(
        <ScreenWrapper>
          <VerbsPracticeListScreen />
        </ScreenWrapper>,
      );

      const b1Tab = getByTestId('verbs-tab-B1');
      fireEvent.press(b1Tab);

      await waitFor(() => {
        expect(scrollToOffsetSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            offset: 0,
            animated: true,
          }),
        );
      });

      scrollToOffsetSpy.mockRestore();
    });
  });

  describe('VerbQuizScreen', () => {
    const testExercises: QuizExercise[] = [
      {
        id: 'ex1',
        label: 'A1 · ANRUFEN · PRÄSENS',
        tense: 'Präsens',
        verbCard: mockVerbs[0],
        sentence: mockVerbs[0].sentences[0],
        segments: [
          { text: 'Ich' },
          { gapIndex: 0 },
          { text: 'dich' },
          { text: 'heute' },
          { text: 'Abend' },
          { gapIndex: 1 },
        ],
        gaps: [
          {
            id: 'gap_0',
            correctValue: 'rufe',
            options: ['rufe', 'rufst', 'ruft', 'anrufen'],
          },
          {
            id: 'gap_1',
            correctValue: 'an',
            options: ['an', 'auf', 'aus', 'ein'],
          },
        ],
        translation: {
          ru: 'Я позвоню тебе сегодня вечером',
          en: 'I will call you this evening',
        },
      },
      {
        id: 'ex2',
        label: 'A1 · ANRUFEN · PERFEKT',
        tense: 'Perfekt',
        verbCard: mockVerbs[0],
        sentence: mockVerbs[0].sentences[6],
        segments: [
          { text: 'Sie' },
          { gapIndex: 0 },
          { text: 'uns' },
          { text: 'gestern' },
          { text: 'nicht' },
          { gapIndex: 1 },
        ],
        gaps: [
          {
            id: 'gap_0',
            correctValue: 'haben',
            options: ['haben', 'sind', 'hat', 'seid'],
          },
          {
            id: 'gap_1',
            correctValue: 'angerufen',
            options: ['angerufen', 'angeruft', 'gerufen', 'geruft'],
          },
        ],
        translation: {
          ru: 'Они вчера нам не позвонили',
          en: 'They did not call us yesterday',
        },
      },
    ];

    beforeEach(() => {
      jest.spyOn(quizGeneratorService, 'generateExercisesForVerb').mockReturnValue(testExercises);
    });

    it('should render quiz header, counter, sentence with gap and option buttons', async () => {
      const { getByTestId, getByText } = render(
        <ScreenWrapper>
          <VerbQuizScreen />
        </ScreenWrapper>,
      );

      await waitFor(() => {
        expect(getByText('Тренировка')).toBeTruthy();
        expect(getByText('Заполните карточку')).toBeTruthy();
        expect(getByTestId('quiz-progress-counter')).toBeTruthy();
        expect(getByTestId('quiz-sentence-card')).toBeTruthy();
        expect(getByTestId('gap-slot-0')).toBeTruthy();
        expect(getByTestId('option-button-rufe')).toBeTruthy();
      });
    });

    it('should fill first gap on option click and advance to second gap', async () => {
      const { getByTestId, getByText } = render(
        <ScreenWrapper>
          <VerbQuizScreen />
        </ScreenWrapper>,
      );

      await waitFor(() => {
        expect(getByTestId('option-button-rufe')).toBeTruthy();
      });

      // Select 1st gap option
      const rufeOption = getByTestId('option-button-rufe');
      fireEvent.press(rufeOption);

      await waitFor(() => {
        expect(getByText('rufe')).toBeTruthy();
        expect(getByTestId('option-button-an')).toBeTruthy();
      });

      // Select 2nd gap option (correct)
      const anOption = getByTestId('option-button-an');
      fireEvent.press(anOption);

      // Buttons are hidden after answering
      await waitFor(() => {
        expect(getByText('Нажмите в любом месте, чтобы продолжить')).toBeTruthy();
      });

      // Tapping anywhere advances immediately
      const pressable = getByTestId('quiz-content-pressable');
      fireEvent.press(pressable);

      await waitFor(() => {
        expect(getByText(/2\/\d+/)).toBeTruthy();
      });
    });

    it('should show incorrect state and advance to next question on screen tap without repeating', async () => {
      const { getByTestId, getByText, getAllByTestId } = render(
        <ScreenWrapper>
          <VerbQuizScreen />
        </ScreenWrapper>,
      );

      await waitFor(() => {
        expect(getByTestId('option-button-rufe')).toBeTruthy();
      });

      // Select 1st gap option (correct: rufe)
      fireEvent.press(getByTestId('option-button-rufe'));

      // Wait for 2nd gap options
      await waitFor(() => {
        expect(getByTestId('option-button-an')).toBeTruthy();
      });

      // Select 2nd gap wrong option (any option that is not 'an')
      const optionButtons = getAllByTestId(/^option-button-/);
      const wrongOptionButton = optionButtons.find(btn => !btn.props.testID?.endsWith('-an'));
      if (wrongOptionButton) {
        fireEvent.press(wrongOptionButton);
      }

      // Shows tap to continue, correct answer block, and conjugation hint table
      await waitFor(() => {
        expect(getByTestId('quiz-correct-answer-card')).toBeTruthy();
        expect(getByText('Правильный ответ:')).toBeTruthy();
        expect(getByTestId('conjugation-hint-table')).toBeTruthy();
        expect(getByText('Спряжение в Präsens')).toBeTruthy();
        expect(getByText('Нажмите в любом месте, чтобы продолжить')).toBeTruthy();
      });

      // Tap anywhere on screen to advance to next question
      fireEvent.press(getByTestId('quiz-content-pressable'));

      await waitFor(() => {
        expect(getByText(/2\/\d+/)).toBeTruthy();
      });
    });

    it('should show both auxiliary hint and principal parts hint when both Perfekt gaps are failed', async () => {
      mockRouteParams = { infinitive: 'anrufen', level: 'A1' };

      const { getByText, getByTestId } = render(
        <ScreenWrapper>
          <VerbQuizScreen />
        </ScreenWrapper>,
      );

      await waitFor(() => {
        expect(getByTestId('option-button-rufe')).toBeTruthy();
      });

      // Question 1: rufe + an
      fireEvent.press(getByTestId('option-button-rufe'));
      await waitFor(() => {
        expect(getByTestId('option-button-an')).toBeTruthy();
      });
      fireEvent.press(getByTestId('option-button-an'));

      await waitFor(() => {
        expect(getByTestId('quiz-content-pressable')).toBeTruthy();
      });
      fireEvent.press(getByTestId('quiz-content-pressable'));

      // Question 2 (Perfekt): Fail gap 0 (auxiliary) and gap 1 (participle)
      await waitFor(() => {
        expect(getByTestId('option-button-sind')).toBeTruthy();
      });
      fireEvent.press(getByTestId('option-button-sind'));

      await waitFor(() => {
        expect(getByTestId('option-button-gerufen')).toBeTruthy();
      });
      fireEvent.press(getByTestId('option-button-gerufen'));

      // Both hints should be displayed simultaneously
      await waitFor(() => {
        expect(getByTestId('perfekt-hints-container')).toBeTruthy();
        expect(getByTestId('auxiliary-hint-card')).toBeTruthy();
        expect(getByText('Perfekt · haben')).toBeTruthy();
        expect(getByTestId('principal-parts-hint-table')).toBeTruthy();
        expect(getByText('Основные формы')).toBeTruthy();
      });
    });

    it('should open QuizSettingsModal when tapping the gear icon on the sentence card', async () => {
      const { getByTestId, getByText } = render(
        <ScreenWrapper>
          <VerbQuizScreen />
        </ScreenWrapper>,
      );

      await waitFor(() => {
        expect(getByTestId('quiz-settings-button')).toBeTruthy();
      });

      fireEvent.press(getByTestId('quiz-settings-button'));

      await waitFor(() => {
        expect(getByText('Настройки теста')).toBeTruthy();
        expect(getByText('Произношение правильного ответа')).toBeTruthy();
      });
    });
  });

  describe('SettingsScreen', () => {
    it('should render sections and navigate to language selector', () => {
      const { getByText } = render(
        <ScreenWrapper>
          <SettingsScreen />
        </ScreenWrapper>,
      );

      expect(getByText('Настройки')).toBeTruthy();
      expect(getByText('Уведомления')).toBeTruthy();
      expect(getByText('Звуковые эффекты')).toBeTruthy();
      expect(getByText('Связаться с нами')).toBeTruthy();

      const langRow = getByText('Язык приложения');
      fireEvent.press(langRow);
      expect(mockNavigate).toHaveBeenCalledWith('LanguageSelector', { isSettingsMode: true });
    });
  });

  describe('LanguageSelectorScreen', () => {
    it('should render language options and handle selection', () => {
      const { getByTestId, getByText } = render(
        <ScreenWrapper>
          <LanguageSelectorScreen />
        </ScreenWrapper>,
      );

      expect(getByTestId('language-selector-screen')).toBeTruthy();
      expect(getByText('English')).toBeTruthy();

      const englishCard = getByTestId('language-card-en');
      fireEvent.press(englishCard);

      const continueBtn = getByTestId('continue-button');
      fireEvent.press(continueBtn);
      expect(mockReset).toHaveBeenCalledWith({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
    });
  });

  describe('DictionaryScreen', () => {
    it('should render dictionary list, handle search input and toggle card expansion', async () => {
      jest.spyOn(verbDataService, 'getAllVerbs').mockResolvedValue(mockVerbs);
      jest.spyOn(verbDataService, 'searchVerbs').mockResolvedValue(mockVerbs);

      const { getByPlaceholderText, getByText, getAllByText, getByTestId } = render(
        <ScreenWrapper>
          <DictionaryScreen />
        </ScreenWrapper>,
      );

      expect(getByText('Словарь')).toBeTruthy();
      const searchInput = getByPlaceholderText(/Поиск/i);
      expect(searchInput).toBeTruthy();

      await waitFor(() => {
        expect(getByTestId('verb-item-anrufen')).toBeTruthy();
      });

      // Toggle expand on first card
      const cardHeader = getByTestId('verb-item-anrufen');
      fireEvent.press(cardHeader);

      await waitFor(() => {
        expect(getByText('Спряжение глагола')).toBeTruthy();
      });

      // Search
      fireEvent.changeText(searchInput, 'fahren');
      await waitFor(() => {
        expect(getAllByText('fahren').length).toBeGreaterThan(0);
      });
    });
  });

  describe('QuizResultsScreen', () => {
    beforeEach(() => {
      resetDailyQuizLimits();
      jest.clearAllMocks();
    });

    it('should render trophy and victory message for 6/6 correct answers', async () => {
      mockRouteParams = {
        infinitive: 'anrufen',
        level: 'A1',
        results: Array.from({ length: 6 }, (_, i) => ({
          sentenceGerman: `Satz ${i + 1}`,
          isCorrect: true,
          userAnswers: ['anrufen'],
          correctAnswers: ['anrufen'],
          translation: { ru: `Предложение ${i + 1}` },
        })),
      };

      const { getByText, getByTestId } = render(
        <ScreenWrapper>
          <QuizResultsScreen />
        </ScreenWrapper>,
      );

      await waitFor(() => {
        expect(getByText('Результаты')).toBeTruthy();
        expect(getByText('Вы сделали это!')).toBeTruthy();
        expect(getByText('6 из 6')).toBeTruthy();
        expect(getByTestId('next-level-button')).toBeTruthy();
        expect(getByTestId('try-again-button')).toBeTruthy();
        expect(getByTestId('header-back-button')).toBeTruthy();
      });

      fireEvent.press(getByTestId('header-back-button'));
      expect(mockPopToTop).toHaveBeenCalled();
    });

    it('should render silver medal and next level as primary button for 5/6 correct answers', async () => {
      mockRouteParams = {
        infinitive: 'anrufen',
        level: 'A1',
        results: [
          ...Array.from({ length: 5 }, (_, i) => ({
            sentenceGerman: `Satz ${i + 1}`,
            isCorrect: true,
            userAnswers: ['anrufen'],
            correctAnswers: ['anrufen'],
            translation: { ru: `Предложение ${i + 1}` },
          })),
          {
            sentenceGerman: 'Satz 6',
            isCorrect: false,
            userAnswers: ['angerufen'],
            correctAnswers: ['anrufen'],
            translation: { ru: 'Предложение 6' },
          },
        ],
      };

      const { getByText, getByTestId } = render(
        <ScreenWrapper>
          <QuizResultsScreen />
        </ScreenWrapper>,
      );

      await waitFor(() => {
        expect(getByText('Близко к совершенству!')).toBeTruthy();
        expect(getByText('5 из 6')).toBeTruthy();
        expect(getByTestId('next-level-button')).toBeTruthy();
        expect(getByTestId('try-again-button')).toBeTruthy();
      });

      fireEvent.press(getByTestId('try-again-button'));
      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith('VerbQuiz', {
          infinitive: 'anrufen',
          level: 'A1',
        });
      });
    });

    it('should render uncompleted state with try again as primary and next level as secondary for low score (<4/6)', async () => {
      mockRouteParams = {
        infinitive: 'anrufen',
        level: 'A1',
        results: [
          {
            sentenceGerman: 'Satz 1',
            isCorrect: true,
            userAnswers: ['anrufen'],
            correctAnswers: ['anrufen'],
            translation: { ru: 'Предложение 1' },
          },
          ...Array.from({ length: 5 }, (_, i) => ({
            sentenceGerman: `Satz ${i + 2}`,
            isCorrect: false,
            userAnswers: ['falsch'],
            correctAnswers: ['richtig'],
            translation: { ru: `Предложение ${i + 2}` },
          })),
        ],
      };

      const { getByText, getByTestId } = render(
        <ScreenWrapper>
          <QuizResultsScreen />
        </ScreenWrapper>,
      );

      await waitFor(() => {
        expect(getByText('Можно лучше!')).toBeTruthy();
        expect(getByText('1 из 6')).toBeTruthy();
        expect(getByTestId('try-again-button')).toBeTruthy();
        expect(getByTestId('next-level-button')).toBeTruthy();
      });
    });

    it('should handle checkpoint quiz results and save checkpoint progress', async () => {
      const setCheckpointProgressSpy = jest.spyOn(progressService, 'setCheckpointProgress');

      mockRouteParams = {
        isCheckpoint: true,
        checkpointId: 'checkpoint-1',
        checkpointNumber: 1,
        fromIndex: 1,
        toIndex: 10,
        results: Array.from({ length: 20 }, (_, i) => ({
          sentenceGerman: `Checkpoint Satz ${i + 1}`,
          isCorrect: i < 16,
          userAnswers: ['anrufen'],
          correctAnswers: ['anrufen'],
          translation: { ru: `Предложение ${i + 1}` },
        })),
      };

      const { getByText } = render(
        <ScreenWrapper>
          <QuizResultsScreen />
        </ScreenWrapper>,
      );

      await waitFor(() => {
        expect(getByText('Результаты теста')).toBeTruthy();
        expect(getByText('16 из 20')).toBeTruthy();
        expect(setCheckpointProgressSpy).toHaveBeenCalledWith('checkpoint-1', 80);
      });
    });

    it('should handle smart quiz results and navigate back to practice', async () => {
      mockRouteParams = {
        isSmartQuiz: true,
        results: Array.from({ length: 50 }, (_, i) => ({
          sentenceGerman: `Smart Satz ${i + 1}`,
          isCorrect: i < 45,
          userAnswers: ['lernen'],
          correctAnswers: ['lernen'],
          translation: { ru: `Предложение ${i + 1}` },
        })),
      };

      const { getByText, getByTestId } = render(
        <ScreenWrapper>
          <QuizResultsScreen />
        </ScreenWrapper>,
      );

      expect(getByText('Результаты умного квиза')).toBeTruthy();
      expect(getByText('45 из 50')).toBeTruthy();
      expect(getByTestId('try-again-button')).toBeTruthy();
      expect(getByTestId('header-back-button')).toBeTruthy();

      fireEvent.press(getByTestId('try-again-button'));
      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith('VerbQuiz', { isSmartQuiz: true });
      });

      fireEvent.press(getByTestId('header-back-button'));
      expect(mockPopToTop).toHaveBeenCalled();
    });
  });
});
