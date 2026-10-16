import { tokenizeSpeech, evaluateSpeechForExercise } from '../speechAlignment';
import { QuizExercise } from '../../services/quizGeneratorService';

describe('speechAlignment', () => {
  describe('tokenizeSpeech', () => {
    it('splits text into lowercase tokens removing punctuation', () => {
      expect(
        tokenizeSpeech('Ich rufe dich morgen an! Wie geht es dir, mein Freund? — Gut.'),
      ).toEqual([
        'ich',
        'rufe',
        'dich',
        'morgen',
        'an',
        'wie',
        'geht',
        'es',
        'dir',
        'mein',
        'freund',
        'gut',
      ]);
    });

    it('handles empty or whitespace strings', () => {
      expect(tokenizeSpeech('')).toEqual([]);
      expect(tokenizeSpeech('   ')).toEqual([]);
    });
  });

  describe('evaluateSpeechForExercise - sentence exercises', () => {
    const mockSentenceExercise: QuizExercise = {
      id: 'ex1',
      type: 'sentence_fill',
      verbCard: { infinitive: 'warten' } as any,
      tense: 'Präsens',
      label: 'warten',
      sentence: { german: 'Er wartet auf den Bus.' } as any,
      segments: [{ text: 'Er wartet ' }, { gapIndex: 0 }, { text: ' Bus.' }],
      gaps: [
        {
          id: '0',
          correctValue: 'auf den',
          options: ['auf den', 'auf dem', 'an den', 'fuer den'],
        },
      ],
      translation: { en: 'He is waiting for the bus.', ru: 'Он ждет автобус.' },
    };

    it('matches when full sentence with correct gap is spoken', () => {
      const result = evaluateSpeechForExercise(mockSentenceExercise, 'Er wartet auf den Bus.');
      expect(result.isCorrect).toBe(true);
      expect(result.isCompleted).toBe(true);
      expect(result.capturedAnswers[0]).toBe('auf den');
    });

    it('matches when contracted form or alternative equivalent is spoken', () => {
      const contractionExercise: QuizExercise = {
        ...mockSentenceExercise,
        gaps: [
          {
            id: '0',
            correctValue: 'in dem',
            options: ['in dem', 'in den'],
          },
        ],
      };
      const result = evaluateSpeechForExercise(contractionExercise, 'Er wartet im Bus.');
      expect(result.isCorrect).toBe(true);
      expect(result.capturedAnswers[0]).toBe('im');
    });

    it('captures incorrect gap when wrong words are spoken', () => {
      const result = evaluateSpeechForExercise(mockSentenceExercise, 'Er wartet auf dem Bus.');
      expect(result.isCorrect).toBe(false);
      expect(result.capturedAnswers[0]).toBe('auf dem');
    });

    it('handles prefix dual slot with separable prefix', () => {
      const mockPrefixExercise: QuizExercise = {
        id: 'pref1',
        type: 'prefix_dual_slot',
        verbCard: { infinitive: 'anrufen' } as any,
        tense: 'Präsens',
        label: 'anrufen',
        sentence: { german: 'Ich rufe dich morgen an.' } as any,
        segments: [
          { text: 'Ich ' },
          { gapIndex: 0 },
          { text: ' dich morgen ' },
          { gapIndex: 1 },
          { text: '.' },
        ],
        gaps: [
          { id: '0', correctValue: 'rufe', options: ['rufe', 'rufst'] },
          { id: '1', correctValue: 'an', options: ['an', 'ab'] },
        ],
        translation: {},
      };

      const result = evaluateSpeechForExercise(mockPrefixExercise, 'Ich rufe dich morgen an.');
      expect(result.isCorrect).toBe(true);
      expect(result.capturedAnswers[0]).toBe('rufe');
      expect(result.capturedAnswers[1]).toBe('an');
    });

    it('handles inseparable prefix with dash placeholder', () => {
      const mockInseparableExercise: QuizExercise = {
        id: 'pref2',
        type: 'prefix_dual_slot',
        verbCard: { infinitive: 'besuchen' } as any,
        tense: 'Präsens',
        label: 'besuchen',
        sentence: { german: 'Wir besuchen Oma.' } as any,
        segments: [
          { text: 'Wir ' },
          { gapIndex: 0 },
          { text: ' Oma ' },
          { gapIndex: 1 },
          { text: '.' },
        ],
        gaps: [
          { id: '0', correctValue: 'besuchen', options: ['besuchen'] },
          { id: '1', correctValue: '—', options: ['—', 'be'] },
        ],
        translation: {},
      };

      const result = evaluateSpeechForExercise(mockInseparableExercise, 'Wir besuchen Oma.');
      expect(result.isCorrect).toBe(true);
      expect(result.capturedAnswers[0]).toBe('besuchen');
      expect(result.capturedAnswers[1]).toBe('—');
    });
  });

  describe('evaluateSpeechForExercise - verb_forms_fill', () => {
    const mockVerbFormsExercise: QuizExercise = {
      id: 'vf1',
      type: 'verb_forms_fill',
      tense: 'Perfekt',
      label: 'gehen',
      sentence: {} as any,
      segments: [],
      gaps: [
        { id: '0', correctValue: 'ging', options: ['ging', 'gehte'] },
        { id: '1', correctValue: 'gegangen', options: ['gegangen', 'gegeht'] },
      ],
      translation: {},
      verbCard: {
        infinitive: 'gehen',
        auxiliary: 'sein',
        principal_parts: {
          praeteritum_3sg: 'ging',
          partizip_2: 'gegangen',
        },
      } as any,
    };

    it('accepts full triad including infinitive (gehen ging ist gegangen)', () => {
      const result = evaluateSpeechForExercise(mockVerbFormsExercise, 'gehen ging ist gegangen');
      expect(result.isCorrect).toBe(true);
      expect(result.isCompleted).toBe(true);
      expect(result.capturedAnswers[0]).toBe('ging');
      expect(result.selectedAuxiliary).toBe('sein');
      expect(result.capturedAnswers[1]).toBe('gegangen');
    });

    it('accepts forms without infinitive (ging ist gegangen)', () => {
      const result = evaluateSpeechForExercise(mockVerbFormsExercise, 'ging ist gegangen');
      expect(result.isCorrect).toBe(true);
      expect(result.isCompleted).toBe(true);
      expect(result.capturedAnswers[0]).toBe('ging');
      expect(result.selectedAuxiliary).toBe('sein');
      expect(result.capturedAnswers[1]).toBe('gegangen');
    });

    it('flags incorrect auxiliary verb', () => {
      const result = evaluateSpeechForExercise(mockVerbFormsExercise, 'gehen ging hat gegangen');
      expect(result.isCorrect).toBe(false);
      expect(result.selectedAuxiliary).toBe('haben');
      expect(result.capturedAnswers[0]).toBe('ging');
      expect(result.capturedAnswers[1]).toBe('gegangen');
    });

    it('flags incorrect praeteritum form', () => {
      const result = evaluateSpeechForExercise(mockVerbFormsExercise, 'gehte ist gegangen');
      expect(result.isCorrect).toBe(false);
      expect(result.capturedAnswers[0]).toBe('gehte');
      expect(result.selectedAuxiliary).toBe('sein');
      expect(result.capturedAnswers[1]).toBe('gegangen');
    });
  });

  describe('evaluateSpeechForExercise - conjugation_fill', () => {
    const mockConjugationExercise: QuizExercise = {
      id: 'conj1',
      type: 'conjugation_fill',
      verbCard: { infinitive: 'lernen' } as any,
      tense: 'Präsens',
      label: 'lernen',
      sentence: {} as any,
      segments: [],
      gaps: [
        { id: '0', correctValue: 'lerne', options: [] },
        { id: '1', correctValue: 'lernst', options: [] },
        { id: '2', correctValue: 'lernt', options: [] },
        { id: '3', correctValue: 'lernen', options: [] },
        { id: '4', correctValue: 'lernt', options: [] },
        { id: '5', correctValue: 'lernen', options: [] },
      ],
      translation: {},
    };

    it('evaluates full conjugation chant with pronouns', () => {
      const result = evaluateSpeechForExercise(
        mockConjugationExercise,
        'ich lerne, du lernst, er lernt, wir lernen, ihr lernt, sie lernen',
      );
      expect(result.isCorrect).toBe(true);
      expect(result.isCompleted).toBe(true);
      expect(result.capturedAnswers[0]).toBe('lerne');
      expect(result.capturedAnswers[1]).toBe('lernst');
      expect(result.capturedAnswers[2]).toBe('lernt');
      expect(result.capturedAnswers[3]).toBe('lernen');
      expect(result.capturedAnswers[4]).toBe('lernt');
      expect(result.capturedAnswers[5]).toBe('lernen');
    });

    it('evaluates conjugation chant without pronouns', () => {
      const result = evaluateSpeechForExercise(
        mockConjugationExercise,
        'lerne lernst lernt lernen lernt lernen',
      );
      expect(result.isCorrect).toBe(true);
      expect(result.isCompleted).toBe(true);
      expect(result.capturedAnswers[0]).toBe('lerne');
      expect(result.capturedAnswers[5]).toBe('lernen');
    });

    it('detects errors in forms', () => {
      const result = evaluateSpeechForExercise(
        mockConjugationExercise,
        'ich lerne, du lerne, er lernt, wir lernen, ihr lernt, sie lernen',
      );
      expect(result.isCorrect).toBe(false);
      expect(result.capturedAnswers[1]).toBe('lerne');
    });
  });
});
