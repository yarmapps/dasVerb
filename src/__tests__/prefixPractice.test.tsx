import React from 'react';
import { Alert, Animated } from 'react-native';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { PrefixPracticeCard } from '../components/PrefixPracticeCard/PrefixPracticeCard';
import { PrefixGrammarHint } from '../components/PrefixGrammarHint/PrefixGrammarHint';
import { PrefixDualSlotExercise } from '../components/PrefixDualSlotExercise/PrefixDualSlotExercise';
import { SentenceFillExercise } from '../components/SentenceFillExercise/SentenceFillExercise';
import { PrefixPracticeListScreen } from '../screens/PrefixPracticeListScreen/PrefixPracticeListScreen';
import { SettingsScreen } from '../screens/SettingsScreen/SettingsScreen';
import { ThemeProvider } from '../context/ThemeContext';
import { LocaleProvider } from '../context/LocaleContext';
import { verbDataService, PrefixLevelData } from '../services/verbDataService';
import { progressService } from '../services/progressService';
import * as settingsService from '../services/settingsService';
import { VerbCard, VerbSentence } from '../../docs/verb.types';

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockReset = jest.fn();
const mockReplace = jest.fn();
const mockPopToTop = jest.fn();

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
      params: {},
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

const mockPrefixLevels: PrefixLevelData[] = [
  {
    id: 'prefix_a1_sep_1',
    cefrLevel: 'A1',
    subgroupType: 'separable',
    levelNumber: 1,
    title: 'Separable 1',
    verbs: ['anrufen', 'aufstehen'],
    exerciseSentenceIds: Array.from({ length: 10 }, (_, i) => ({
      verbId: 'anrufen',
      sentenceId: `s_${i + 1}`,
    })),
  },
  {
    id: 'prefix_a1_insep_1',
    cefrLevel: 'A1',
    subgroupType: 'inseparable',
    levelNumber: 2,
    title: 'Inseparable 1',
    verbs: ['verstehen', 'bekommen'],
    exerciseSentenceIds: Array.from({ length: 10 }, (_, i) => ({
      verbId: 'verstehen',
      sentenceId: `s_${i + 11}`,
    })),
  },
  {
    id: 'prefix_checkpoint_a1',
    cefrLevel: 'A1',
    subgroupType: 'checkpoint',
    levelNumber: 3,
    title: 'Checkpoint A1',
    verbs: ['anrufen', 'verstehen'],
    exerciseSentenceIds: Array.from({ length: 20 }, (_, i) => ({
      verbId: 'anrufen',
      sentenceId: `cp_${i}`,
    })),
  },
];

describe('Prefix Practice Suite', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('PrefixPracticeCard', () => {
    it('should render title, subtitle and handle press', () => {
      const onPressMock = jest.fn();
      const { getByTestId, getByText } = render(
        <ScreenWrapper>
          <PrefixPracticeCard onPress={onPressMock} />
        </ScreenWrapper>,
      );

      expect(getByText('Глаголы с приставками')).toBeTruthy();
      expect(getByText('Отделяемые, неотделяемые и двойные приставки')).toBeTruthy();

      const card = getByTestId('prefix-practice-card');
      fireEvent.press(card);
      expect(onPressMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('PrefixGrammarHint', () => {
    it('should render separable prefix rule explanation', () => {
      const { getByTestId, getByText } = render(
        <ScreenWrapper>
          <PrefixGrammarHint
            hint={{
              prefixType: 'separable',
              prefix: 'an',
              infinitive: 'anrufen',
              ruleExplanationKey: 'prefixGrammarHint.separableRule',
            }}
          />
        </ScreenWrapper>,
      );

      expect(getByTestId('prefix-grammar-hint')).toBeTruthy();
      expect(getByTestId('prefix-grammar-hint')).toHaveStyle({ marginHorizontal: 20 });
      expect(getByText('an-')).toBeTruthy();
      expect(getByText('Отделяемая приставка')).toBeTruthy();
      expect(
        getByText('В Präsens и Präteritum отделяемая приставка уходит в самый конец предложения.'),
      ).toBeTruthy();
    });

    it('should render inseparable prefix rule explanation', () => {
      const { getByText } = render(
        <ScreenWrapper>
          <PrefixGrammarHint
            hint={{
              prefixType: 'inseparable',
              prefix: 'ver',
              infinitive: 'verstehen',
              ruleExplanationKey: 'prefixGrammarHint.inseparableRule',
            }}
          />
        </ScreenWrapper>,
      );

      expect(getByText('ver-')).toBeTruthy();
      expect(getByText('Неотделяемая приставка')).toBeTruthy();
      expect(
        getByText(
          'Неотделяемые приставки (be-, ge-, er-, ver-, zer-, ent-, emp-, miss-) никогда не отделяются от корня.',
        ),
      ).toBeTruthy();
    });

    it('should render dual prefix rule explanation', () => {
      const { getByText } = render(
        <ScreenWrapper>
          <PrefixGrammarHint
            hint={{
              prefixType: 'dual',
              prefix: 'über',
              infinitive: 'überholen',
              ruleExplanationKey: 'prefixGrammarHint.dualRule',
            }}
          />
        </ScreenWrapper>,
      );

      expect(getByText('über-')).toBeTruthy();
      expect(getByText('Двойная приставка')).toBeTruthy();
      expect(
        getByText(
          'Приставки über-, um-, unter-, durch- могут быть отделяемыми или неотделяемыми в зависимости от значения.',
        ),
      ).toBeTruthy();
    });
  });

  describe('PrefixDualSlotExercise & SentenceFillExercise', () => {
    const mockDualSlotExercise = {
      id: 'ex_1',
      type: 'prefix_dual_slot' as const,
      label: 'A1 · ANRUFEN · PRÄSENS',
      tense: 'Präsens' as const,
      verbCard: {} as unknown as VerbCard,
      sentence: {} as unknown as VerbSentence,
      sentenceGerman: 'Ich rufe dich morgen an.',
      translation: { ru: 'Я позвоню тебе завтра.' },
      segments: [
        { text: 'Ich ' },
        { gapIndex: 0 },
        { text: ' dich morgen ' },
        { gapIndex: 1 },
        { text: '.' },
      ],
      gaps: [
        {
          id: 'gap_0',
          correctValue: 'rufe',
          options: ['rufe', 'ruft', 'rufen', 'rief'],
        },
        {
          id: 'gap_1',
          correctValue: 'an',
          options: ['an', 'auf', 'aus', '—'],
        },
      ],
    };

    it('should render dual slot exercise with slots, segments and active gap', () => {
      const pulseAnim = new Animated.Value(1);
      const { getByTestId, getByText } = render(
        <ScreenWrapper>
          <PrefixDualSlotExercise
            exercise={mockDualSlotExercise}
            activeGapIndex={0}
            userAnswers={[]}
            status="idle"
            pulseAnim={pulseAnim}
          />
        </ScreenWrapper>,
      );

      expect(getByTestId('prefix-gap-slot-0')).toBeTruthy();
      expect(getByTestId('prefix-gap-slot-1')).toBeTruthy();
      expect(getByText('Ich')).toBeTruthy();
      expect(getByText('.')).toBeTruthy();
    });

    it('should display filled answers and handle dash — properly', () => {
      const pulseAnim = new Animated.Value(1);
      const { getByTestId, getByText } = render(
        <ScreenWrapper>
          <PrefixDualSlotExercise
            exercise={mockDualSlotExercise}
            activeGapIndex={1}
            userAnswers={['rufe', '—']}
            status="correct"
            pulseAnim={pulseAnim}
          />
        </ScreenWrapper>,
      );

      expect(getByTestId('prefix-gap-slot-0')).toBeTruthy();
      expect(getByTestId('prefix-gap-slot-1')).toBeTruthy();
      expect(getByText('rufe')).toBeTruthy();
      expect(getByText('—')).toBeTruthy();
    });

    it('should render standard sentence fill exercise with slots and segments', () => {
      const pulseAnim = new Animated.Value(1);
      const { getByTestId, getByText } = render(
        <ScreenWrapper>
          <SentenceFillExercise
            exercise={mockDualSlotExercise}
            activeGapIndex={0}
            userAnswers={['rufe']}
            status="idle"
            pulseAnim={pulseAnim}
          />
        </ScreenWrapper>,
      );

      expect(getByTestId('gap-slot-0')).toBeTruthy();
      expect(getByTestId('gap-slot-1')).toBeTruthy();
      expect(getByText('rufe')).toBeTruthy();
      expect(getByText('Ich')).toBeTruthy();
      expect(getByText('.')).toBeTruthy();
    });
  });

  describe('PrefixPracticeListScreen', () => {
    it('should render CEFR tabs, list levels and navigate on card press', async () => {
      jest.spyOn(verbDataService, 'getPrefixLevelsByCefr').mockResolvedValue(mockPrefixLevels);
      jest.spyOn(progressService, 'getPrefixLevelProgress').mockReturnValue({
        score: 90,
        status: 'silver',
      });

      const { getByTestId, getByText } = render(
        <ScreenWrapper>
          <PrefixPracticeListScreen />
        </ScreenWrapper>,
      );

      await waitFor(() => {
        expect(getByText('Глаголы с приставками')).toBeTruthy();
        expect(getByText('Отделяемые приставки')).toBeTruthy();
        expect(getByText('Неотделяемые приставки')).toBeTruthy();
        expect(getByTestId('prefix-level-prefix_a1_sep_1')).toBeTruthy();
        expect(getByTestId('prefix-checkpoint-A1')).toBeTruthy();
      });

      // Press standard level
      fireEvent.press(getByTestId('prefix-level-prefix_a1_sep_1'));
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('VerbQuiz', {
          prefixLevelId: 'prefix_a1_sep_1',
          prefixCefrLevel: 'A1',
        });
      });

      // Press checkpoint
      fireEvent.press(getByTestId('prefix-checkpoint-A1'));
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('VerbQuiz', {
          prefixLevelId: 'prefix_checkpoint_a1',
          isPrefixCheckpoint: true,
          prefixCefrLevel: 'A1',
        });
      });

      // Switch tab to A2
      fireEvent.press(getByTestId('prefix-tab-A2'));
      await waitFor(() => {
        expect(verbDataService.getPrefixLevelsByCefr).toHaveBeenCalledWith('A2');
      });
    });
  });

  describe('SettingsScreen Data Management Resets', () => {
    it('should handle Reset Learning Progress with confirmation alert', () => {
      const clearAllProgressSpy = jest.spyOn(progressService, 'clearAllProgress');
      const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});

      const { getByText } = render(
        <ScreenWrapper>
          <SettingsScreen />
        </ScreenWrapper>,
      );

      expect(getByText('УПРАВЛЕНИЕ ДАННЫМИ')).toBeTruthy();
      const resetProgressBtn = getByText('Сбросить прогресс обучения');
      fireEvent.press(resetProgressBtn);

      expect(alertSpy).toHaveBeenCalledWith(
        'Сбросить прогресс обучения?',
        expect.stringContaining('безвозвратно удален'),
        expect.any(Array),
      );

      // Trigger confirm action
      const buttons = alertSpy.mock.calls[0][2];
      const confirmButton = buttons?.find(btn => btn.style === 'destructive');
      expect(confirmButton).toBeDefined();

      confirmButton?.onPress?.();
      expect(clearAllProgressSpy).toHaveBeenCalledTimes(1);
      expect(alertSpy).toHaveBeenCalledWith('Готово', 'Прогресс обучения успешно сброшен.');
    });

    it('should handle Reset App Settings with confirmation alert', () => {
      const resetAllSettingsSpy = jest.spyOn(settingsService, 'resetAllSettings');
      const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});

      const { getByText } = render(
        <ScreenWrapper>
          <SettingsScreen />
        </ScreenWrapper>,
      );

      const resetSettingsBtn = getByText('Сбросить настройки');
      fireEvent.press(resetSettingsBtn);

      expect(alertSpy).toHaveBeenCalledWith(
        'Сбросить настройки?',
        expect.stringContaining('значениям по умолчанию'),
        expect.any(Array),
      );

      // Trigger confirm action
      const buttons = alertSpy.mock.calls[0][2];
      const confirmButton = buttons?.find(btn => btn.style === 'destructive');
      expect(confirmButton).toBeDefined();

      confirmButton?.onPress?.();
      expect(resetAllSettingsSpy).toHaveBeenCalledTimes(1);
      expect(alertSpy).toHaveBeenCalledWith(
        'Готово',
        'Настройки успешно возвращены к значениям по умолчанию.',
      );
    });
  });
});
