import React from 'react';
import { Animated } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { IntlProvider } from 'react-intl';
import { ScreenHeader } from '../components/ScreenHeader/ScreenHeader';
import { FormInput } from '../components/FormInput/FormInput';
import { FeaturedStartCard } from '../components/FeaturedStartCard/FeaturedStartCard';
import { SmartQuizCard } from '../components/SmartQuizCard/SmartQuizCard';
import { VerbCardDetails } from '../components/VerbCardDetails/VerbCardDetails';
import { AnimatedCheckmark } from '../components/AnimatedCheckmark/AnimatedCheckmark';
import { AnimatedRewardCircle } from '../components/AnimatedRewardCircle/AnimatedRewardCircle';
import { SentenceFillExercise } from '../components/SentenceFillExercise/SentenceFillExercise';
import { PrefixDualSlotExercise } from '../components/PrefixDualSlotExercise/PrefixDualSlotExercise';
import { QuizExercise } from '../services/quizGeneratorService';
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
      expect(getByText('От самых употребляемых к редким по методике Goethe')).toBeTruthy();
      expect(getByText('Начать сейчас')).toBeTruthy();

      const card = getByTestId('featured-practice-card');
      fireEvent.press(card);
      expect(handlePress).toHaveBeenCalledTimes(1);
    });
  });

  describe('SmartQuizCard', () => {
    it('should render diamond icon for free user and fire onPress', () => {
      const handlePress = jest.fn();
      const { getByTestId, getByText } = render(
        <TestWrapper>
          <SmartQuizCard onPress={handlePress} isPremium={false} />
        </TestWrapper>,
      );

      expect(getByText('Умный алгоритм')).toBeTruthy();
      expect(getByTestId('smart-quiz-premium-badge')).toBeTruthy();

      const card = getByTestId('smart-quiz-card');
      fireEvent.press(card);
      expect(handlePress).toHaveBeenCalledTimes(1);
    });

    it('should hide diamond icon for premium user', () => {
      const handlePress = jest.fn();
      const { queryByTestId, getByText } = render(
        <TestWrapper>
          <SmartQuizCard onPress={handlePress} isPremium={true} />
        </TestWrapper>,
      );

      expect(getByText('Умный алгоритм')).toBeTruthy();
      expect(queryByTestId('smart-quiz-premium-badge')).toBeNull();
    });
  });

  describe('VerbCardDetails', () => {
    const mockVerb: VerbCard = {
      id: 'sprechen_dat_mit',
      infinitive: 'sprechen',
      level: 'A1',
      frequency_rank: 30,
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

  describe('AnimatedCheckmark', () => {
    it('should render animated checkmark svg container', () => {
      const { getByTestId } = render(
        <TestWrapper>
          <AnimatedCheckmark size={96} color="#10B981" />
        </TestWrapper>,
      );

      expect(getByTestId('animated-checkmark')).toBeTruthy();
    });
  });

  describe('AnimatedRewardCircle', () => {
    it('should render animated reward circle for trophy, silver, bronze and uncompleted', () => {
      const { getByTestId, rerender } = render(
        <TestWrapper>
          <AnimatedRewardCircle status="trophy" size={92} />
        </TestWrapper>,
      );
      expect(getByTestId('animated-reward-circle')).toBeTruthy();

      rerender(
        <TestWrapper>
          <AnimatedRewardCircle status="silver" size={92} />
        </TestWrapper>,
      );
      expect(getByTestId('animated-reward-circle')).toBeTruthy();

      rerender(
        <TestWrapper>
          <AnimatedRewardCircle status="bronze" size={92} />
        </TestWrapper>,
      );
      expect(getByTestId('animated-reward-circle')).toBeTruthy();

      rerender(
        <TestWrapper>
          <AnimatedRewardCircle status="uncompleted" size={92} />
        </TestWrapper>,
      );
      expect(getByTestId('animated-reward-circle')).toBeTruthy();
    });
  });

  describe('SmartQuizCard', () => {
    it('should render SmartQuizCard and handle click', () => {
      const handlePress = jest.fn();
      const { getByTestId, getByText } = render(
        <TestWrapper>
          <SmartQuizCard onPress={handlePress} />
        </TestWrapper>,
      );

      expect(getByTestId('smart-quiz-card')).toBeTruthy();
      expect(getByText('Умный алгоритм')).toBeTruthy();

      fireEvent.press(getByTestId('smart-quiz-card'));
      expect(handlePress).toHaveBeenCalledTimes(1);
    });
  });

  describe('Slot Interaction in SentenceFillExercise and PrefixDualSlotExercise', () => {
    it('should call onSlotPress when tapping a slot in SentenceFillExercise', () => {
      const handleSlotPress = jest.fn();
      const mockExercise = {
        id: 'ex1',
        type: 'sentence_fill' as const,
        label: 'Präsens',
        tense: 'Präsens',
        translation: {},
        verbCard: {} as VerbCard,
        sentence: { id: 's1', tense: 'Präsens', german: 'Ich rufe an.', translation: {} },
        segments: [{ text: 'Ich' }, { gapIndex: 0 }, { text: 'an.' }],
        gaps: [{ id: 'g0', correctValue: 'rufe', options: ['rufe', 'rufst'] }],
        distractors: [],
      };

      const { getByTestId } = render(
        <TestWrapper>
          <SentenceFillExercise
            exercise={mockExercise as QuizExercise}
            activeGapIndex={0}
            userAnswers={['rufe']}
            status="idle"
            pulseAnim={new Animated.Value(1)}
            onSlotPress={handleSlotPress}
          />
        </TestWrapper>,
      );

      const slotTouch = getByTestId('gap-slot-touch-0');
      fireEvent.press(slotTouch);
      expect(handleSlotPress).toHaveBeenCalledWith(0);
    });

    it('should call onSlotPress when tapping a slot in PrefixDualSlotExercise', () => {
      const handleSlotPress = jest.fn();
      const mockExercise = {
        id: 'ex2',
        type: 'prefix_dual_slot' as const,
        label: 'Präsens',
        tense: 'Präsens',
        translation: {},
        verbCard: {} as VerbCard,
        sentence: { id: 's1', tense: 'Präsens', german: 'Ich rufe heute an.', translation: {} },
        segments: [
          { text: 'Ich' },
          { gapIndex: 0 },
          { text: 'heute' },
          { gapIndex: 1 },
          { text: '.' },
        ],
        gaps: [
          { id: 'g0', correctValue: 'rufe', options: ['rufe', 'rufst'] },
          { id: 'g1', correctValue: 'an', options: ['an', 'auf'] },
        ],
        distractors: [],
      };

      const { getByTestId } = render(
        <TestWrapper>
          <PrefixDualSlotExercise
            exercise={mockExercise as QuizExercise}
            activeGapIndex={1}
            userAnswers={['rufe', 'an']}
            status="idle"
            pulseAnim={new Animated.Value(1)}
            onSlotPress={handleSlotPress}
          />
        </TestWrapper>,
      );

      const slotTouch0 = getByTestId('prefix-gap-slot-touch-0');
      fireEvent.press(slotTouch0);
      expect(handleSlotPress).toHaveBeenCalledWith(0);

      const slotTouch1 = getByTestId('prefix-gap-slot-touch-1');
      fireEvent.press(slotTouch1);
      expect(handleSlotPress).toHaveBeenCalledWith(1);
    });
  });
});
