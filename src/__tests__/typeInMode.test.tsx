import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { SettingsScreen } from '../screens/SettingsScreen/SettingsScreen';
import { VerbQuizScreen } from '../screens/VerbQuizScreen/VerbQuizScreen';
import { SentenceFillExercise } from '../components/SentenceFillExercise/SentenceFillExercise';
import { PrefixDualSlotExercise } from '../components/PrefixDualSlotExercise/PrefixDualSlotExercise';
import { VerbFormsFillExercise } from '../components/VerbFormsFillExercise/VerbFormsFillExercise';
import { ConjugationFillExercise } from '../components/ConjugationFillExercise/ConjugationFillExercise';
import { ThemeProvider } from '../context/ThemeContext';
import { LocaleProvider } from '../context/LocaleContext';
import { setPremiumEnabled } from '../services/premiumAccessService';
import { getSettings, updateSettings } from '../services/settingsService';
import { quizGeneratorService, QuizExercise } from '../services/quizGeneratorService';
import { verbDataService } from '../services/verbDataService';
import { speechService } from '../services/speechService';
import { Animated } from 'react-native';

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
let mockRouteParams: Record<string, unknown> = {};

jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: mockNavigate,
      goBack: mockGoBack,
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

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <ThemeProvider>
      <LocaleProvider>{ui}</LocaleProvider>
    </ThemeProvider>,
  );
}

const mockExercise: QuizExercise = {
  id: 'ex_1',
  label: 'A1 · ANRUFEN · PRÄSENS',
  type: 'sentence_fill',
  tense: 'Präsens',
  sentence: {
    id: 's1',
    tense: 'Präsens',
    german: 'Ich rufe dich an.',
    translation: { en: 'I call you.', ru: 'Я звоню тебе.' },
  },
  verbCard: {
    id: 'anrufen',
    infinitive: 'anrufen',
    level: 'A1',
    frequency_rank: 100,
    translation: { en: 'to call', ru: 'звонить' },
    rektion: {
      requires_object: false,
      direct_case: null,
      preposition: null,
      preposition_case: null,
    },
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
      },
    },
    sentences: [],
  },
  translation: { en: 'I call you.', ru: 'Я звоню тебе.' },
  segments: [{ text: 'Ich' }, { gapIndex: 0 }, { text: 'dich an.' }],
  gaps: [
    {
      id: 'g0',
      correctValue: 'rufe',
      options: ['rufe', 'rufst', 'ruft', 'rufen'],
    },
  ],
};

describe('Type-In Mode', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setPremiumEnabled(false);
    updateSettings({ quizInputMode: 'choice' });
    mockRouteParams = { infinitive: 'anrufen', level: 'A1' };
    jest.spyOn(verbDataService, 'getVerbsByInfinitive').mockResolvedValue([mockExercise.verbCard]);
    jest.spyOn(quizGeneratorService, 'generateExercisesForVerb').mockReturnValue([mockExercise]);
    jest.spyOn(speechService, 'speakSentence').mockImplementation(async () => {});
  });

  describe('SettingsScreen', () => {
    it('allows toggling between Multiple Choice and Type In and updates settings', () => {
      setPremiumEnabled(false);
      const { getByTestId } = renderWithProviders(<SettingsScreen />);

      const typeInBtn = getByTestId('settings-input-mode-type-in-btn');
      fireEvent.press(typeInBtn);

      expect(getSettings().quizInputMode).toBe('type_in');

      const choiceBtn = getByTestId('settings-input-mode-choice-btn');
      fireEvent.press(choiceBtn);
      expect(getSettings().quizInputMode).toBe('choice');
    });
  });

  describe('VerbQuizScreen typing flow', () => {
    it('presents Check button in Type-In mode and validates correctly', async () => {
      setPremiumEnabled(false);
      updateSettings({ quizInputMode: 'type_in' });

      const { getByTestId, queryByTestId } = renderWithProviders(<VerbQuizScreen />);

      // In type-in mode: Check button should appear, options grid should not appear
      await waitFor(() => {
        expect(getByTestId('quiz-check-button')).toBeTruthy();
      });
      expect(queryByTestId('option-button-rufe')).toBeNull();

      // Check button should be disabled when nothing is typed yet
      const checkBtn = getByTestId('quiz-check-button');
      expect(checkBtn.props.accessibilityState?.disabled).toBe(true);

      // Type the correct answer into gap input
      const input = getByTestId('gap-slot-input-0');
      fireEvent.changeText(input, 'rufe');

      // Check button should now be enabled
      await waitFor(() => {
        expect(getByTestId('quiz-check-button').props.accessibilityState?.disabled).toBe(false);
      });

      // Press Check button
      fireEvent.press(getByTestId('quiz-check-button'));

      // Status should become correct (sentence card present)
      await waitFor(() => {
        expect(getByTestId('quiz-sentence-card')).toBeTruthy();
      });
    });

    it('validates tolerant spelling (umlauts/case) correctly in type-in mode', async () => {
      setPremiumEnabled(true);
      updateSettings({ quizInputMode: 'type_in' });

      const { getByTestId } = renderWithProviders(<VerbQuizScreen />);

      const input = getByTestId('gap-slot-input-0');
      // Case insensitivity & spaces
      fireEvent.changeText(input, '  RUFE  ');

      const checkBtn = getByTestId('quiz-check-button');
      fireEvent.press(checkBtn);

      // Should accept and succeed
      await waitFor(() => {
        expect(getByTestId('quiz-sentence-card')).toBeTruthy();
      });
    });

    it('shows incorrect feedback card when typed answer is wrong', async () => {
      setPremiumEnabled(true);
      updateSettings({ quizInputMode: 'type_in' });

      const { getByTestId } = renderWithProviders(<VerbQuizScreen />);

      const input = getByTestId('gap-slot-input-0');
      fireEvent.changeText(input, 'falsch');

      const checkBtn = getByTestId('quiz-check-button');
      fireEvent.press(checkBtn);

      await waitFor(() => {
        expect(getByTestId('quiz-correct-answer-card')).toBeTruthy();
      });
    });
  });

  describe('Slot Exercise Components in Type-In Mode', () => {
    it('SentenceFillExercise renders TextInput when active and inputMode="type_in"', () => {
      const handleTextChange = jest.fn();
      const handleSubmitSlot = jest.fn();

      const { getByTestId } = renderWithProviders(
        <SentenceFillExercise
          exercise={mockExercise}
          activeGapIndex={0}
          userAnswers={['']}
          status="idle"
          pulseAnim={new Animated.Value(1)}
          inputMode="type_in"
          onTextChange={handleTextChange}
          onSubmitSlot={handleSubmitSlot}
        />,
      );

      const input = getByTestId('gap-slot-input-0');
      expect(input).toBeTruthy();

      fireEvent.changeText(input, 'rufe');
      expect(handleTextChange).toHaveBeenCalledWith(0, 'rufe');

      fireEvent(input, 'submitEditing');
      expect(handleSubmitSlot).toHaveBeenCalledWith(0);
    });

    it('PrefixDualSlotExercise renders TextInput and handles inseparable placeholder', () => {
      const inseparableExercise: QuizExercise = {
        ...mockExercise,
        type: 'prefix_dual_slot',
        segments: [{ text: 'Er' }, { gapIndex: 0 }, { text: 'ein Geschenk' }, { gapIndex: 1 }],
        gaps: [
          { id: 'g0', correctValue: 'bekommt', options: ['bekommt'] },
          { id: 'g1', correctValue: '—', options: ['—'] },
        ],
      };

      const handleTextChange = jest.fn();

      const { getByTestId } = renderWithProviders(
        <PrefixDualSlotExercise
          exercise={inseparableExercise}
          activeGapIndex={1}
          userAnswers={['bekommt', '']}
          status="idle"
          pulseAnim={new Animated.Value(1)}
          inputMode="type_in"
          onTextChange={handleTextChange}
        />,
      );

      const input = getByTestId('prefix-gap-slot-input-1');
      expect(input.props.placeholder).toBe('—');
    });

    it('VerbFormsFillExercise renders TextInput for active slot', () => {
      const verbFormsExercise: QuizExercise = {
        ...mockExercise,
        type: 'verb_forms_fill',
        verbFormsData: {
          infinitive: 'gehen',
          correctPraeteritum: 'ging',
          correctAuxiliary: 'ist',
          correctPartizipII: 'gegangen',
          praeteritumOptions: ['ging'],
          partizipIIOptions: ['gegangen'],
        },
        gaps: [
          { id: 'g0', correctValue: 'ging', options: ['ging'] },
          { id: 'g1', correctValue: 'ist', options: ['ist'] },
          { id: 'g2', correctValue: 'gegangen', options: ['gegangen'] },
        ],
      };

      const handleTextChange = jest.fn();

      const { getByTestId } = renderWithProviders(
        <VerbFormsFillExercise
          exercise={verbFormsExercise}
          activeSlotIndex={0}
          userAnswers={['', '', '']}
          status="idle"
          pulseAnim={new Animated.Value(1)}
          inputMode="type_in"
          onTextChange={handleTextChange}
        />,
      );

      const input = getByTestId('praeteritum-slot-input');
      expect(input).toBeTruthy();
      fireEvent.changeText(input, 'ging');
      expect(handleTextChange).toHaveBeenCalledWith(0, 'ging');
    });

    it('ConjugationFillExercise renders TextInput for active row', () => {
      const conjugationExercise: QuizExercise = {
        ...mockExercise,
        type: 'conjugation_fill',
        conjugationRows: [
          { pronoun: 'ich', gapIndex: 0, correctValue: 'gehe' },
          { pronoun: 'du', gapIndex: 1, correctValue: 'gehst' },
        ],
        gaps: [
          { id: 'g0', correctValue: 'gehe', options: ['gehe'] },
          { id: 'g1', correctValue: 'gehst', options: ['gehst'] },
        ],
      };

      const handleTextChange = jest.fn();

      const { getByTestId } = renderWithProviders(
        <ConjugationFillExercise
          exercise={conjugationExercise}
          activeGapIndex={0}
          userAnswers={['', '']}
          status="idle"
          pulseAnim={new Animated.Value(1)}
          inputMode="type_in"
          onTextChange={handleTextChange}
        />,
      );

      const input = getByTestId('conjugation-slot-input-0');
      expect(input).toBeTruthy();
      fireEvent.changeText(input, 'gehe');
      expect(handleTextChange).toHaveBeenCalledWith(0, 'gehe');
    });
  });
});
