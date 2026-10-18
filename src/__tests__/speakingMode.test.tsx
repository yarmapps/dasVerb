import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ThemeProvider } from '../context/ThemeContext';
import { LocaleProvider } from '../context/LocaleContext';
import { setPremiumEnabled } from '../services/premiumAccessService';
import { getEffectiveQuizInputMode, updateSettings } from '../services/settingsService';
import { QuizInputModeModal } from '../components/QuizInputModeModal/QuizInputModeModal';
import { SpeakingBottomBar } from '../components/SpeakingBottomBar/SpeakingBottomBar';
import { VerbQuizScreen } from '../screens/VerbQuizScreen/VerbQuizScreen';
import { quizGeneratorService, QuizExercise } from '../services/quizGeneratorService';
import { verbDataService } from '../services/verbDataService';
import { Linking } from 'react-native';

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

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
      params: { verbId: 'anrufen' },
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
  id: 'ex_speaking_1',
  label: 'A1 · ANRUFEN · PRÄSENS',
  type: 'sentence_fill',
  tense: 'Präsens',
  sentence: {
    id: 's1',
    tense: 'Präsens',
    german: 'Ich rufe dich morgen an.',
    translation: { en: 'I will call you tomorrow.', ru: 'Я позвоню тебе завтра.' },
  },
  verbCard: {
    id: 'anrufen',
    infinitive: 'anrufen',
    level: 'A1',
    frequency_rank: 100,
    auxiliary: 'haben',
    translation: { en: 'to call', ru: 'звонить' },
    rektion: {
      requires_object: true,
      direct_case: 'Akkusativ',
      preposition: null,
      preposition_case: null,
    },
    principal_parts: {
      infinitive: 'anrufen',
      present_3sg: 'ruft an',
      praeteritum_3sg: 'rief an',
      partizip_2: 'angerufen',
    },
    morphology: {
      verb_class: 'strong',
      prefix_type: 'separable',
      prefix: 'an',
      is_reflexive: false,
      reflexive_case: null,
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
  segments: [
    { text: 'Ich ' },
    { gapIndex: 0 },
    { text: ' dich morgen ' },
    { gapIndex: 1 },
    { text: '.' },
  ],
  gaps: [
    { id: 'g0', correctValue: 'rufe', options: ['rufe', 'rufst'] },
    { id: 'g1', correctValue: 'an', options: ['an', 'ab'] },
  ],
  translation: { en: 'I will call you tomorrow.', ru: 'Я позвоню тебе завтра.' },
};

describe('Speaking Mode (Чтение вслух)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setPremiumEnabled(false);
    updateSettings({ quizInputMode: 'choice' });
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const speechRecognitionService = require('../services/speechRecognitionService');
    jest.spyOn(speechRecognitionService, 'isSpeechRecognitionSupported').mockReturnValue(true);
    jest.spyOn(verbDataService, 'getVerbById').mockResolvedValue(mockExercise.verbCard);
    jest.spyOn(quizGeneratorService, 'generateExercisesForVerb').mockReturnValue([mockExercise]);
  });

  describe('settingsService & effective input mode', () => {
    it('returns speaking when premium is active and quizInputMode is speaking', () => {
      setPremiumEnabled(true);
      updateSettings({ quizInputMode: 'speaking' });
      expect(getEffectiveQuizInputMode()).toBe('speaking');
    });

    it('falls back to choice when user lacks premium despite speaking setting', () => {
      setPremiumEnabled(false);
      updateSettings({ quizInputMode: 'speaking' });
      expect(getEffectiveQuizInputMode()).toBe('choice');
    });
  });

  describe('QuizInputModeModal', () => {
    it('renders speaking option with microphone icon and diamond for free user', () => {
      const handleSelect = jest.fn();
      const handleClose = jest.fn();

      const { getByTestId, getByText } = renderWithProviders(
        <QuizInputModeModal
          visible={true}
          currentMode="choice"
          onClose={handleClose}
          onSelectMode={handleSelect}
          isPremium={false}
        />,
      );

      expect(getByText('Чтение вслух')).toBeTruthy();
      expect(getByText('Проговаривайте предложения или формы целиком в микрофон')).toBeTruthy();

      const speakingBtn = getByTestId('settings-input-mode-speaking-btn');
      fireEvent.press(speakingBtn);
      expect(handleSelect).toHaveBeenCalledWith('speaking');
    });

    it('does not render speaking option when speech recognition is not supported', () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const speechRecognitionService = require('../services/speechRecognitionService');
      const spy = jest
        .spyOn(speechRecognitionService, 'isSpeechRecognitionSupported')
        .mockReturnValue(false);

      const { queryByTestId, queryByText } = renderWithProviders(
        <QuizInputModeModal
          visible={true}
          currentMode="choice"
          onClose={jest.fn()}
          onSelectMode={jest.fn()}
          isPremium={true}
        />,
      );

      expect(queryByTestId('settings-input-mode-speaking-btn')).toBeNull();
      expect(queryByText('Чтение вслух')).toBeNull();

      spy.mockReturnValue(true);
    });
  });

  describe('SpeakingBottomBar', () => {
    it('renders idle prompt for sentence exercises and triggers start/stop recording on pressIn/pressOut and press', () => {
      const handleStart = jest.fn();
      const handleStop = jest.fn();

      const { getByTestId, getByText } = renderWithProviders(
        <SpeakingBottomBar
          state="idle"
          exerciseType="sentence_fill"
          onStartRecording={handleStart}
          onStopRecording={handleStop}
        />,
      );

      expect(getByText('Удерживайте и прочитайте предложение')).toBeTruthy();

      const micBtn = getByTestId('speaking-mic-btn');
      fireEvent(micBtn, 'pressIn');
      expect(handleStart).toHaveBeenCalled();

      // Switch to recording state to verify stop on pressOut
      const { getByTestId: getByTestIdRec } = renderWithProviders(
        <SpeakingBottomBar
          state="recording"
          exerciseType="sentence_fill"
          onStartRecording={handleStart}
          onStopRecording={handleStop}
        />,
      );
      fireEvent(getByTestIdRec('speaking-mic-btn'), 'pressOut');
      expect(handleStop).toHaveBeenCalled();
    });

    it('renders Check button and triggers onCheck when canCheck is true', () => {
      const handleCheck = jest.fn();
      const { getByTestId, rerender } = renderWithProviders(
        <SpeakingBottomBar
          state="idle"
          exerciseType="sentence_fill"
          onStartRecording={jest.fn()}
          onStopRecording={jest.fn()}
          canCheck={false}
          onCheck={handleCheck}
        />,
      );

      const checkBtn = getByTestId('speaking-check-button');
      fireEvent.press(checkBtn);
      expect(handleCheck).not.toHaveBeenCalled();

      rerender(
        <ThemeProvider>
          <LocaleProvider>
            <SpeakingBottomBar
              state="idle"
              exerciseType="sentence_fill"
              onStartRecording={jest.fn()}
              onStopRecording={jest.fn()}
              canCheck={true}
              onCheck={handleCheck}
            />
          </LocaleProvider>
        </ThemeProvider>,
      );

      fireEvent.press(getByTestId('speaking-check-button'));
      expect(handleCheck).toHaveBeenCalled();
    });

    it('renders verb forms idle prompt when exerciseType is verb_forms_fill', () => {
      const { getByText } = renderWithProviders(
        <SpeakingBottomBar
          state="idle"
          exerciseType="verb_forms_fill"
          onStartRecording={jest.fn()}
          onStopRecording={jest.fn()}
        />,
      );

      expect(getByText('Удерживайте и назовите 3 формы')).toBeTruthy();
    });

    it('renders conjugation idle prompt when exerciseType is conjugation_fill', () => {
      const { getByText } = renderWithProviders(
        <SpeakingBottomBar
          state="idle"
          exerciseType="conjugation_fill"
          onStartRecording={jest.fn()}
          onStopRecording={jest.fn()}
        />,
      );

      expect(getByText('Удерживайте и назовите спряжения')).toBeTruthy();
    });

    it('renders recording state with hint pill', () => {
      const { getByText } = renderWithProviders(
        <SpeakingBottomBar
          state="recording"
          exerciseType="sentence_fill"
          onStartRecording={jest.fn()}
          onStopRecording={jest.fn()}
        />,
      );

      expect(getByText('Слушаю... Отпустите, когда закончите')).toBeTruthy();
    });

    it('renders evaluating state message', () => {
      const { getByText } = renderWithProviders(
        <SpeakingBottomBar
          state="evaluating"
          exerciseType="sentence_fill"
          onStartRecording={jest.fn()}
          onStopRecording={jest.fn()}
        />,
      );

      expect(getByText('Распознаю речь...')).toBeTruthy();
    });

    it('renders error state message on failure', () => {
      const { getByText } = renderWithProviders(
        <SpeakingBottomBar
          state="error"
          exerciseType="sentence_fill"
          onStartRecording={jest.fn()}
          onStopRecording={jest.fn()}
        />,
      );

      expect(getByText('Не удалось расслышать. Удерживайте и повторите')).toBeTruthy();
    });

    it('renders permission denied message with Open Settings action', () => {
      const handleRequestPermission = jest.fn();
      jest.spyOn(Linking, 'openSettings').mockResolvedValue(undefined as never);

      const { getByText, getByTestId } = renderWithProviders(
        <SpeakingBottomBar
          state="permission_denied"
          exerciseType="sentence_fill"
          onStartRecording={jest.fn()}
          onStopRecording={jest.fn()}
          onRequestPermission={handleRequestPermission}
        />,
      );

      expect(
        getByText('Требуется разрешение на использование микрофона и распознавание речи'),
      ).toBeTruthy();
      expect(getByText('Открыть настройки')).toBeTruthy();

      const permissionBtn = getByTestId('speaking-permission-btn');
      fireEvent.press(permissionBtn);
      expect(handleRequestPermission).toHaveBeenCalled();
    });
  });

  describe('VerbQuizScreen integration', () => {
    it('renders SpeakingBottomBar when user is premium and effectiveInputMode is speaking', async () => {
      setPremiumEnabled(true);
      updateSettings({ quizInputMode: 'speaking' });

      const { getByTestId, queryByTestId } = renderWithProviders(<VerbQuizScreen />);

      await waitFor(() => {
        expect(getByTestId('speaking-bottom-bar')).toBeTruthy();
        expect(getByTestId('speaking-mic-btn')).toBeTruthy();
        expect(queryByTestId('quiz-check-button')).toBeNull();
      });
    });

    it('shows premium paywall sheet when free user selects speaking mode in quiz settings', async () => {
      setPremiumEnabled(false);
      updateSettings({ quizInputMode: 'choice' });

      const { getByTestId } = renderWithProviders(<VerbQuizScreen />);

      await waitFor(() => {
        expect(getByTestId('quiz-settings-button')).toBeTruthy();
      });

      const settingsBtn = getByTestId('quiz-settings-button');
      fireEvent.press(settingsBtn);

      await waitFor(() => {
        expect(getByTestId('quiz-input-mode-speaking-btn')).toBeTruthy();
      });

      const speakingBtn = getByTestId('quiz-input-mode-speaking-btn');
      fireEvent.press(speakingBtn);

      await waitFor(() => {
        expect(getByTestId('premium-subscribe-sheet')).toBeTruthy();
      });
    });

    it('opens TextInput when user taps on a gap slot in speaking mode', async () => {
      setPremiumEnabled(true);
      updateSettings({ quizInputMode: 'speaking' });

      const { getByTestId, queryByTestId } = renderWithProviders(<VerbQuizScreen />);

      await waitFor(() => {
        expect(getByTestId('speaking-bottom-bar')).toBeTruthy();
      });

      // Initially no TextInput is mounted so keyboard does not auto-open
      expect(queryByTestId('gap-slot-input-0')).toBeNull();

      // Tapping slot 0 opens TextInput for manual typing
      fireEvent.press(getByTestId('gap-slot-touch-0'));

      await waitFor(() => {
        expect(getByTestId('gap-slot-input-0')).toBeTruthy();
      });
    });
  });
});
