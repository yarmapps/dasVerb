import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { PracticeScreen } from '../screens/PracticeScreen/PracticeScreen';
import { VerbsPracticeListScreen } from '../screens/VerbsPracticeListScreen/VerbsPracticeListScreen';
import { DictionaryScreen } from '../screens/DictionaryScreen/DictionaryScreen';
import { SettingsScreen } from '../screens/SettingsScreen/SettingsScreen';
import { LanguageSelectorScreen } from '../screens/LanguageSelectorScreen/LanguageSelectorScreen';
import { ThemeProvider } from '../context/ThemeContext';
import { LocaleProvider } from '../context/LocaleContext';
import { verbDataService } from '../services/verbDataService';
import { progressService } from '../services/progressService';
import { VerbCard } from '../../docs/verb.types';

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockReset = jest.fn();

jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: mockNavigate,
      goBack: mockGoBack,
      reset: mockReset,
    }),
    useRoute: () => ({
      params: {},
    }),
  };
});

const mockVerbs: VerbCard[] = [
  {
    id: 'fahren_dat_mit',
    infinitive: 'fahren',
    level: 'A1',
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
    jest.clearAllMocks();
  });

  describe('PracticeScreen', () => {
    it('should render header, settings button and navigate to VerbsPracticeList on featured card press', () => {
      const { getByTestId, getByText } = render(
        <ScreenWrapper>
          <PracticeScreen />
        </ScreenWrapper>,
      );

      expect(getByText('Практика')).toBeTruthy();
      expect(getByText('Тренируй глаголы')).toBeTruthy();

      const settingsBtn = getByTestId('settings-button');
      fireEvent.press(settingsBtn);
      expect(mockNavigate).toHaveBeenCalledWith('Settings');

      const featuredCard = getByTestId('featured-practice-card');
      fireEvent.press(featuredCard);
      expect(mockNavigate).toHaveBeenCalledWith('VerbsPracticeList');
    });
  });

  describe('VerbsPracticeListScreen', () => {
    it('should group verbs by level, deduplicate infinitives and render clean cards', async () => {
      jest.spyOn(verbDataService, 'getVerbsOrderedByDifficulty').mockResolvedValue(mockVerbs);
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
        expect(getByText(/A1/i)).toBeTruthy();
        expect(getByText(/A2/i)).toBeTruthy();
        expect(getByText('fahren')).toBeTruthy();
        expect(getByText('to drive')).toBeTruthy();
        expect(getByText('hängen')).toBeTruthy();
        expect(getByText('to hang')).toBeTruthy();
        expect(getByTestId('verb-practice-level-fahren')).toBeTruthy();
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
      jest.spyOn(verbDataService, 'searchVerbs').mockResolvedValue([mockVerbs[0]]);

      const { getByPlaceholderText, getByText, getAllByText, getByTestId } = render(
        <ScreenWrapper>
          <DictionaryScreen />
        </ScreenWrapper>,
      );

      expect(getByText('Словарь')).toBeTruthy();
      const searchInput = getByPlaceholderText(/Поиск/i);
      expect(searchInput).toBeTruthy();

      await waitFor(() => {
        expect(getByTestId('verb-item-fahren_dat_mit')).toBeTruthy();
      });

      // Toggle expand on first card
      const cardHeader = getByTestId('verb-item-fahren_dat_mit');
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
});
