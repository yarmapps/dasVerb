import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { IntlProvider } from 'react-intl';
import { ScreenHeader } from '../components/ScreenHeader/ScreenHeader';
import { FormInput } from '../components/FormInput/FormInput';
import { FeaturedStartCard } from '../components/FeaturedStartCard/FeaturedStartCard';
import { VerbCardDetails } from '../components/VerbCardDetails/VerbCardDetails';
import { ThemeProvider } from '../context/ThemeContext';
import { getMessages } from '../services/intlService';
import { VerbCard } from '../../docs/verb.types';

const messages = getMessages('ru');

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider>
    <IntlProvider locale="ru" messages={messages}>
      {children}
    </IntlProvider>
  </ThemeProvider>
);

describe('UI Components Suite', () => {
  describe('ScreenHeader', () => {
    it('should render title correctly', () => {
      const { getByText } = render(
        <TestWrapper>
          <ScreenHeader title="Тестовый заголовок" />
        </TestWrapper>,
      );
      expect(getByText('Тестовый заголовок')).toBeTruthy();
    });

    it('should handle back button press when showBackButton is true', () => {
      const handleBackPress = jest.fn();
      const { getByTestId } = render(
        <TestWrapper>
          <ScreenHeader title="Заголовок" showBackButton onBackPress={handleBackPress} />
        </TestWrapper>,
      );

      const backButton = getByTestId('header-back-button');
      fireEvent.press(backButton);
      expect(handleBackPress).toHaveBeenCalledTimes(1);
    });
  });

  describe('FormInput', () => {
    it('should render with placeholder and handle text change', () => {
      const handleChangeText = jest.fn();
      const { getByPlaceholderText } = render(
        <TestWrapper>
          <FormInput
            value=""
            onChangeText={handleChangeText}
            placeholder="Введите текст для поиска"
          />
        </TestWrapper>,
      );

      const input = getByPlaceholderText('Введите текст для поиска');
      fireEvent.changeText(input, 'sprechen');
      expect(handleChangeText).toHaveBeenCalledWith('sprechen');
    });
  });

  describe('FeaturedStartCard', () => {
    it('should render badge, title, subtitle and fire onPress callback', () => {
      const handlePress = jest.fn();
      const { getByTestId, getByText } = render(
        <TestWrapper>
          <FeaturedStartCard onPress={handlePress} />
        </TestWrapper>,
      );

      expect(getByText(/Рекомендация/i)).toBeTruthy();
      expect(getByText('Тренируй глаголы')).toBeTruthy();
      expect(getByText('Изучай глаголы от A1 до B2')).toBeTruthy();
      expect(getByText('Начать сейчас')).toBeTruthy();

      const card = getByTestId('featured-practice-card');
      fireEvent.press(card);
      expect(handlePress).toHaveBeenCalledTimes(1);
    });
  });

  describe('VerbCardDetails', () => {
    const mockVerb: VerbCard = {
      id: 'sprechen_dat_mit',
      infinitive: 'sprechen',
      level: 'A1',
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
        imperative: {
          du: 'sprich!',
          ihr: 'sprecht!',
          Sie: 'sprechen Sie!',
        },
      },
      rektion: {
        requires_object: false,
        direct_case: null,
        preposition: 'mit',
        preposition_case: 'Dativ',
      },
      chunk: 'mit dem Freund sprechen',
      sentences: [
        {
          id: 's1',
          tense: 'Präsens',
          german: 'Ich spreche mit meinem Freund.',
          translation: {
            ru: 'Я говорю со своим другом.',
            en: 'I am speaking with my friend.',
          },
          bracket_parts: ['spreche'],
          dativ_parts: ['mit meinem Freund'],
        },
      ],
      translation: {
        ru: 'говорить, разговаривать',
        en: 'to speak, to talk',
      },
    };

    it('should render conjugation rows, imperative and highlighted sentences', () => {
      const { getByText, getAllByText } = render(
        <TestWrapper>
          <VerbCardDetails verb={mockVerb} locale="ru" />
        </TestWrapper>,
      );

      expect(getByText('Спряжение глагола')).toBeTruthy();
      expect(getAllByText('spreche').length).toBeGreaterThan(0);
      expect(getAllByText('sprach').length).toBeGreaterThan(0);
      expect(getByText('Повелительное наклонение (Imperativ)')).toBeTruthy();
      expect(getByText('sprich!')).toBeTruthy();
      expect(getByText('Примеры')).toBeTruthy();
      expect(getByText('Я говорю со своим другом.')).toBeTruthy();
    });
  });
});
