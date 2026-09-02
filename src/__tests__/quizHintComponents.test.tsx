import React from 'react';
import { render } from '@testing-library/react-native';
import { IntlProvider } from 'react-intl';
import { ThemeProvider } from '../context/ThemeContext';
import { ConjugationHintTable } from '../components/ConjugationHintTable/ConjugationHintTable';
import { PrincipalPartsHintTable } from '../components/PrincipalPartsHintTable/PrincipalPartsHintTable';
import { AuxiliaryHintCard } from '../components/AuxiliaryHintCard/AuxiliaryHintCard';
import { getMessages } from '../services/intlService';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <IntlProvider locale="ru" messages={getMessages('ru')}>
    <ThemeProvider>{children}</ThemeProvider>
  </IntlProvider>
);

describe('Quiz Hint Components', () => {
  describe('ConjugationHintTable', () => {
    it('should render all 6 present tense forms and vowel change badge', () => {
      const mockConjugation = {
        ich: 'rufe an',
        du: 'rufst an',
        er_sie_es: 'ruft an',
        wir: 'rufen an',
        ihr: 'ruft an',
        sie_Sie: 'rufen an',
        root_vowel_change: 'e -> i' as const,
      };

      const { getByText, getAllByText, getByTestId } = render(
        <Wrapper>
          <ConjugationHintTable conjugation={mockConjugation} />
        </Wrapper>,
      );

      expect(getByTestId('conjugation-hint-table')).toBeTruthy();
      expect(getByText('Спряжение в Präsens')).toBeTruthy();
      expect(getByText('e -> i')).toBeTruthy();
      expect(getByText('ich')).toBeTruthy();
      expect(getByText('rufe an')).toBeTruthy();
      expect(getByText('du')).toBeTruthy();
      expect(getByText('rufst an')).toBeTruthy();
      expect(getByText('er/sie/es')).toBeTruthy();
      expect(getByText('wir')).toBeTruthy();
      expect(getByText('ihr')).toBeTruthy();
      expect(getByText('sie/Sie')).toBeTruthy();
      expect(getAllByText('ruft an').length).toBe(2);
      expect(getAllByText('rufen an').length).toBe(2);
    });
  });

  describe('PrincipalPartsHintTable', () => {
    it('should render 3 principal parts correctly', () => {
      const mockPrincipalParts = {
        infinitive: 'anrufen',
        present_3sg: 'ruft an',
        praeteritum_3sg: 'rief an',
        partizip_2: 'angerufen',
      };

      const { getByText, getByTestId } = render(
        <Wrapper>
          <PrincipalPartsHintTable principalParts={mockPrincipalParts} auxiliary="haben" />
        </Wrapper>,
      );

      expect(getByTestId('principal-parts-hint-table')).toBeTruthy();
      expect(getByText('Основные формы')).toBeTruthy();
      expect(getByText('ruft an')).toBeTruthy();
      expect(getByText('rief an')).toBeTruthy();
      expect(getByText('hat angerufen')).toBeTruthy();
    });

    it('should render pronoun-specific forms when sentenceText is provided', () => {
      const mockPrincipalParts = {
        infinitive: 'anrufen',
        present_3sg: 'ruft an',
        praeteritum_3sg: 'rief an',
        partizip_2: 'angerufen',
      };
      const mockConjugation = {
        present: {
          ich: 'rufe an',
          du: 'rufst an',
          er_sie_es: 'ruft an',
          wir: 'rufen an',
          ihr: 'ruft an',
          sie_Sie: 'rufen an',
          root_vowel_change: null,
        },
      };

      const { getByText, getByTestId, getAllByText } = render(
        <Wrapper>
          <PrincipalPartsHintTable
            principalParts={mockPrincipalParts}
            auxiliary="haben"
            conjugation={mockConjugation}
            sentenceText="Du rufst mich nie an."
          />
        </Wrapper>,
      );

      expect(getByTestId('principal-parts-hint-table')).toBeTruthy();
      expect(getAllByText('du').length).toBeGreaterThanOrEqual(1);
      expect(getByText('rufst an')).toBeTruthy();
      expect(getByText('hast angerufen')).toBeTruthy();
    });

    it('should distinguish sie (Singular) from sie (Plural) and Sie (Höflichkeitsform)', () => {
      const mockPrincipalParts = {
        infinitive: 'anrufen',
        present_3sg: 'ruft an',
        praeteritum_3sg: 'rief an',
        partizip_2: 'angerufen',
      };
      const mockConjugation = {
        present: {
          ich: 'rufe an',
          du: 'rufst an',
          er_sie_es: 'ruft an',
          wir: 'rufen an',
          ihr: 'ruft an',
          sie_Sie: 'rufen an',
          root_vowel_change: null,
        },
      };

      // 1. "sie" Singular (она): "Sie ruft ihren Freund an."
      const {
        getByText: getByTextSg,
        getAllByText: getAllByTextSg,
        unmount: unmountSg,
      } = render(
        <Wrapper>
          <PrincipalPartsHintTable
            principalParts={mockPrincipalParts}
            auxiliary="haben"
            conjugation={mockConjugation}
            sentenceText="Sie ruft ihren Freund an."
          />
        </Wrapper>,
      );
      expect(getAllByTextSg('sie').length).toBe(3);
      expect(getByTextSg('ruft an')).toBeTruthy();
      expect(getByTextSg('hat angerufen')).toBeTruthy();
      unmountSg();

      // 2. "Sie" Polite (Вы): "Rufen Sie mich bitte an!"
      const {
        getByText: getByTextPolite,
        getAllByText: getAllByTextPolite,
        unmount: unmountPolite,
      } = render(
        <Wrapper>
          <PrincipalPartsHintTable
            principalParts={mockPrincipalParts}
            auxiliary="haben"
            conjugation={mockConjugation}
            sentenceText="Rufen Sie mich bitte an!"
          />
        </Wrapper>,
      );
      expect(getAllByTextPolite('Sie').length).toBe(3);
      expect(getByTextPolite('haben angerufen')).toBeTruthy();
      unmountPolite();

      // 3. "sie" Plural (они): "Sie haben uns gestern nicht angerufen."
      const { getByText: getByTextPl, getAllByText: getAllByTextPl } = render(
        <Wrapper>
          <PrincipalPartsHintTable
            principalParts={mockPrincipalParts}
            auxiliary="haben"
            conjugation={mockConjugation}
            sentenceText="Sie haben uns gestern nicht angerufen."
          />
        </Wrapper>,
      );
      expect(getAllByTextPl('sie').length).toBe(3);
      expect(getByTextPl('haben angerufen')).toBeTruthy();
    });
  });

  describe('AuxiliaryHintCard', () => {
    it('should render movement/change of state explanation for sein auxiliary', () => {
      const { getByText, getByTestId } = render(
        <Wrapper>
          <AuxiliaryHintCard infinitive="aufstehen" auxiliary="sein" correctForm="ist" />
        </Wrapper>,
      );

      expect(getByTestId('auxiliary-hint-card')).toBeTruthy();
      expect(getByText('Perfekt · sein')).toBeTruthy();
      expect(
        getByText(
          'Глагол aufstehen выражает движение или смену состояния, поэтому в Perfekt используется вспомогательный глагол sein (ist).',
        ),
      );
    });

    it('should render general explanation for haben auxiliary', () => {
      const { getByText, getByTestId } = render(
        <Wrapper>
          <AuxiliaryHintCard infinitive="anrufen" auxiliary="haben" correctForm="hat" />
        </Wrapper>,
      );

      expect(getByTestId('auxiliary-hint-card')).toBeTruthy();
      expect(getByText('Perfekt · haben')).toBeTruthy();
      expect(getByText('Глагол anrufen образует Perfekt со вспомогательным глаголом haben (hat).'));
    });
  });
});
