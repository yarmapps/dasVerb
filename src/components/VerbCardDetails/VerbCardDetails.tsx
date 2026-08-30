import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import { useIntl } from 'react-intl';
import { VerbCard } from '../../../docs/verb.types';
import { useAppTheme } from '../../context/ThemeContext';
import { createStyles } from './VerbCardDetails.styles';

export interface VerbCardDetailsProps {
  verb: VerbCard;
  locale: string;
}

export function VerbCardDetails({ verb, locale }: VerbCardDetailsProps): React.JSX.Element {
  const intl = useIntl();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const languageCode = locale.split('-')[0];

  const renderGrammarHighlightedSentence = (sentenceItem: VerbCard['sentences'][0]) => {
    const { german, bracket_parts = [], dativ_parts = [], akkusativ_parts = [] } = sentenceItem;

    interface GrammarSpan {
      start: number;
      end: number;
      text: string;
      type: 'verb' | 'dativ' | 'akkusativ';
    }

    const spans: GrammarSpan[] = [];

    const findSpans = (parts: string[], type: 'verb' | 'dativ' | 'akkusativ') => {
      parts.forEach(part => {
        if (!part) return;
        let searchIndex = 0;
        while (searchIndex < german.length) {
          const foundIndex = german.indexOf(part, searchIndex);
          if (foundIndex === -1) break;
          const endIndex = foundIndex + part.length;
          const hasOverlap = spans.some(
            existing => foundIndex < existing.end && endIndex > existing.start,
          );
          if (!hasOverlap) {
            spans.push({ start: foundIndex, end: endIndex, text: part, type });
          }
          searchIndex = endIndex;
        }
      });
    };

    findSpans(dativ_parts, 'dativ');
    findSpans(akkusativ_parts, 'akkusativ');
    findSpans(bracket_parts, 'verb');

    spans.sort((firstSpan, secondSpan) => firstSpan.start - secondSpan.start);

    if (spans.length === 0) {
      return <Text style={styles.germanSentence}>{german}</Text>;
    }

    const elements: React.JSX.Element[] = [];
    let currentIndex = 0;

    spans.forEach((span, spanIndex) => {
      if (span.start > currentIndex) {
        elements.push(
          <Text key={`plain-${currentIndex}`}>{german.slice(currentIndex, span.start)}</Text>,
        );
      }

      let spanStyle = styles.verbHighlight;
      if (span.type === 'dativ') {
        spanStyle = styles.dativHighlight;
      } else if (span.type === 'akkusativ') {
        spanStyle = styles.akkusativHighlight;
      }

      elements.push(
        <Text key={`span-${spanIndex}`} style={spanStyle}>
          {german.slice(span.start, span.end)}
        </Text>,
      );

      currentIndex = span.end;
    });

    if (currentIndex < german.length) {
      elements.push(<Text key="plain-tail">{german.slice(currentIndex)}</Text>);
    }

    return <Text style={styles.germanSentence}>{elements}</Text>;
  };

  const conjugationRows = [
    {
      person: 'ich',
      present: verb.conjugation?.present?.ich || '—',
      praeteritum: verb.conjugation?.praeteritum?.ich || '—',
    },
    {
      person: 'du',
      present: verb.conjugation?.present?.du || '—',
      praeteritum: verb.conjugation?.praeteritum?.du || '—',
    },
    {
      person: 'er / sie / es',
      present: verb.conjugation?.present?.er_sie_es || '—',
      praeteritum: verb.conjugation?.praeteritum?.er_sie_es || '—',
    },
    {
      person: 'wir',
      present: verb.conjugation?.present?.wir || '—',
      praeteritum: verb.conjugation?.praeteritum?.wir || '—',
    },
    {
      person: 'ihr',
      present: verb.conjugation?.present?.ihr || '—',
      praeteritum: verb.conjugation?.praeteritum?.ihr || '—',
    },
    {
      person: 'sie / Sie',
      present: verb.conjugation?.present?.sie_Sie || '—',
      praeteritum: verb.conjugation?.praeteritum?.sie_Sie || '—',
    },
  ];

  const imperativeRows = verb.conjugation?.imperative
    ? [
        {
          person: 'du',
          value: verb.conjugation.imperative.du,
        },
        {
          person: 'ihr',
          value: verb.conjugation.imperative.ihr,
        },
        {
          person: 'Sie',
          value: verb.conjugation.imperative.Sie,
        },
      ]
    : [];

  return (
    <View style={styles.container}>
      {/* 1. Unified Conjugation Table (Präsens + Präteritum) */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {intl.formatMessage({ id: 'dictionaryScreen.conjugation' })}
        </Text>
      </View>
      <View style={styles.tableContainer}>
        <View style={[styles.tableRow, styles.tableHeaderRow]}>
          <View style={styles.tableHeaderColPerson}>
            <Text style={styles.tableHeaderText}>
              {intl.formatMessage({ id: 'dictionaryScreen.person' })}
            </Text>
          </View>
          <View style={styles.tableHeaderColTense}>
            <Text style={styles.tableHeaderText}>
              {intl.formatMessage({ id: 'dictionaryScreen.present' })}
            </Text>
          </View>
          <View style={styles.tableHeaderColTense}>
            <Text style={styles.tableHeaderText}>
              {intl.formatMessage({ id: 'dictionaryScreen.praeteritum' })}
            </Text>
          </View>
        </View>

        {conjugationRows.map((row, index) => {
          const isLast = index === conjugationRows.length - 1;
          return (
            <View key={row.person} style={[styles.tableRow, isLast && styles.tableRowLast]}>
              <View style={styles.tableColPerson}>
                <Text style={styles.tablePersonText}>{row.person}</Text>
              </View>
              <View style={styles.tableColTense}>
                <Text style={styles.tableTenseText}>{row.present}</Text>
              </View>
              <View style={styles.tableColTense}>
                <Text style={styles.tableTenseText}>{row.praeteritum}</Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* 2. Imperative (Повелительное наклонение) */}
      {imperativeRows.length > 0 && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {intl.formatMessage({ id: 'dictionaryScreen.imperative' })}
            </Text>
          </View>
          <View style={styles.tableContainer}>
            {imperativeRows.map((row, index) => {
              const isLast = index === imperativeRows.length - 1;
              return (
                <View key={row.person} style={[styles.tableRow, isLast && styles.tableRowLast]}>
                  <View style={styles.imperativeLabelCol}>
                    <Text style={styles.imperativeLabelText}>{row.person}</Text>
                  </View>
                  <View style={styles.imperativeValueCol}>
                    <Text style={styles.imperativeValueText}>{row.value}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </>
      )}

      {/* 3. Sentences */}
      {verb.sentences && verb.sentences.length > 0 && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {intl.formatMessage({ id: 'dictionaryScreen.examples' })}
            </Text>
          </View>
          <View style={styles.sentencesList}>
            {verb.sentences.map((sentence, sentenceIndex) => (
              <View key={sentence.id || sentenceIndex} style={styles.sentenceCard}>
                {renderGrammarHighlightedSentence(sentence)}
                <Text style={styles.translationSentence}>
                  {sentence.translation?.[languageCode] || sentence.translation?.en || ''}
                </Text>
              </View>
            ))}
          </View>
        </>
      )}
    </View>
  );
}
