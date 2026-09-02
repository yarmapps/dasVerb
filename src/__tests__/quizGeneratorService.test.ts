import { quizGeneratorService } from '../services/quizGeneratorService';
import { progressService } from '../services/progressService';
import { VerbCard } from '../../docs/verb.types';

const mockAnrufenCard: VerbCard = {
  id: 'anrufen',
  infinitive: 'anrufen',
  translation: {
    ru: 'звонить по телефону',
    en: 'to call, to phone',
  },
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
      german: 'Ich rufe dich heute Abend an.',
      translation: {
        ru: 'Я позвоню тебе сегодня вечером.',
        en: 'I will call you this evening.',
      },
      bracket_parts: ['rufe', 'an'],
    },
    {
      id: 's2',
      tense: 'Perfekt',
      german: 'Er hat seinen Freund gestern angerufen.',
      translation: {
        ru: 'Он вчера позвонил своему другу.',
        en: 'He called his friend yesterday.',
      },
      bracket_parts: ['hat', 'angerufen'],
    },
    {
      id: 's3',
      tense: 'Imperativ',
      german: 'Ruf mich bitte morgen an!',
      translation: {
        ru: 'Позвони мне, пожалуйста, завтра!',
        en: 'Please call me tomorrow!',
      },
      bracket_parts: ['Ruf', 'an'],
    },
  ],
};

describe('quizGeneratorService', () => {
  it('should generate up to 6 structured exercises with valid 4-option gaps', () => {
    const exercises = quizGeneratorService.generateExercisesForVerb(mockAnrufenCard);

    expect(exercises.length).toBeGreaterThanOrEqual(3);
    expect(exercises.length).toBeLessThanOrEqual(6);

    exercises.forEach(exercise => {
      expect(exercise.id).toBeDefined();
      expect(exercise.label).toBeDefined();
      expect(exercise.segments.length).toBeGreaterThan(0);
      expect(exercise.gaps.length).toBeGreaterThan(0);

      exercise.gaps.forEach(gap => {
        expect(gap.correctValue).toBeDefined();
        expect(gap.options.length).toBe(4);
        expect(gap.options).toContain(gap.correctValue);
        // Check uniqueness of options
        const uniqueSet = new Set(gap.options);
        expect(uniqueSet.size).toBe(4);
      });
    });
  });

  it('should correctly build multi-gap sentence from bracket_parts', () => {
    const exercises = quizGeneratorService.generateExercisesForVerb(mockAnrufenCard);
    const multiGapExercise = exercises.find(ex => ex.gaps.length === 2);

    expect(multiGapExercise).toBeDefined();
    expect(multiGapExercise?.gaps[0].correctValue).toBeDefined();
    expect(multiGapExercise?.gaps[1].correctValue).toBeDefined();
  });

  it('should provide smart haben/sein distractors matching person and number for auxiliary gaps', () => {
    const exercises = quizGeneratorService.generateExercisesForVerb(mockAnrufenCard);
    const perfektExercise = exercises.find(ex => ex.label.includes('PERFEKT'));

    expect(perfektExercise).toBeDefined();
    const hatGap = perfektExercise?.gaps.find(g => g.correctValue.toLowerCase() === 'hat');
    expect(hatGap).toBeDefined();
    expect(hatGap?.options).toContain('hat');
    expect(hatGap?.options).toContain('ist');
    expect(hatGap?.options).toContain('habe');
    expect(hatGap?.options).toContain('sind');
    expect(hatGap?.options.length).toBe(4);
  });

  it('should always include the verb infinitive in options for Perfekt Partizip II gaps', () => {
    const exercises = quizGeneratorService.generateExercisesForVerb(mockAnrufenCard);
    const perfektExercise = exercises.find(ex => ex.label.includes('PERFEKT'));

    expect(perfektExercise).toBeDefined();
    const participleGap = perfektExercise?.gaps.find(
      g => g.correctValue.toLowerCase() === 'angerufen',
    );
    expect(participleGap).toBeDefined();
    expect(participleGap?.options).toContain('angerufen');
    expect(participleGap?.options).toContain('anrufen');
    expect(participleGap?.options.length).toBe(4);
  });

  it('should only create 1 gap for the modal verb in Präsens/Präteritum and not make gaps for dependent infinitives', () => {
    const mockKoennen: VerbCard = {
      id: 'koennen',
      infinitive: 'können',
      translation: { ru: 'мочь, уметь', en: 'can, to be able to' },
      level: 'A1',
      frequency_rank: 4,
      auxiliary: 'haben',
      morphology: {
        verb_class: 'modal',
        prefix_type: 'none',
        prefix: null,
        is_reflexive: false,
        reflexive_case: null,
      },
      principal_parts: {
        infinitive: 'können',
        present_3sg: 'kann',
        praeteritum_3sg: 'konnte',
        partizip_2: 'gekonnt',
      },
      conjugation: {
        present: {
          ich: 'kann',
          du: 'kannst',
          er_sie_es: 'kann',
          wir: 'können',
          ihr: 'könnt',
          sie_Sie: 'können',
          root_vowel_change: null,
        },
        praeteritum: {
          ich: 'konnte',
          du: 'konntest',
          er_sie_es: 'konnte',
          wir: 'konnten',
          ihr: 'konntet',
          sie_Sie: 'konnten',
        },
      },
      rektion: {
        requires_object: false,
        direct_case: null,
        preposition: null,
        preposition_case: null,
      },
      sentences: [
        {
          id: 's1',
          tense: 'Präsens',
          german: 'Ich kann gut Deutsch sprechen',
          translation: { ru: 'Я умею хорошо говорить по-немецки', en: 'I can speak German well' },
          bracket_parts: ['kann', 'sprechen'],
        },
        {
          id: 's6',
          tense: 'Präteritum',
          german: 'Gestern konnte sie die Aufgabe leicht lösen',
          translation: {
            ru: 'Вчера она смогла легко решить задачу',
            en: 'Yesterday she could solve the task',
          },
          bracket_parts: ['konnte', 'lösen'],
        },
        {
          id: 's7',
          tense: 'Perfekt',
          german: 'Sie haben gestern nicht kommen können',
          translation: { ru: 'Они вчера не смогли прийти', en: 'They could not come yesterday' },
          bracket_parts: ['haben', 'kommen können'],
        },
      ],
    };

    const exercises = quizGeneratorService.generateExercisesForVerb(mockKoennen);

    const praesensExercise = exercises.find(ex => ex.tense === 'Präsens');
    expect(praesensExercise).toBeDefined();
    expect(praesensExercise?.gaps.length).toBe(1);
    expect(praesensExercise?.gaps[0].correctValue).toBe('kann');
    // Ensure dependent infinitive "sprechen" is in segments, not in gaps
    const segmentsTexts = praesensExercise?.segments.map(s => s.text).filter(Boolean);
    expect(segmentsTexts).toContain('sprechen.');

    const praeteritumExercise = exercises.find(ex => ex.tense === 'Präteritum');
    expect(praeteritumExercise).toBeDefined();
    expect(praeteritumExercise?.gaps.length).toBe(1);
    expect(praeteritumExercise?.gaps[0].correctValue).toBe('konnte');

    const perfektExercise = exercises.find(ex => ex.tense === 'Perfekt');
    expect(perfektExercise).toBeDefined();
    expect(perfektExercise?.gaps.length).toBe(2);
    expect(perfektExercise?.gaps[0].correctValue).toBe('haben');
    expect(perfektExercise?.gaps[1].correctValue).toBe('können');
  });

  it('should generate checkpoint exercises prioritizing top mistakes and padding up to 10 exercises', () => {
    // Generate a list of mock verbs with multiple sentences
    const mockVerbs: VerbCard[] = Array.from({ length: 10 }, (_, verbIndex) => ({
      ...mockAnrufenCard,
      id: `verb_${verbIndex}`,
      infinitive: `verb${verbIndex}`,
      sentences: [
        {
          id: `s_err_${verbIndex}`,
          tense: 'Präsens',
          german: `Ich rufe ${verbIndex} an.`,
          translation: { ru: `Перевод ${verbIndex}`, en: `Translation ${verbIndex}` },
          bracket_parts: ['rufe', 'an'],
        },
        {
          id: `s_clean_${verbIndex}`,
          tense: 'Perfekt',
          german: `Er hat ${verbIndex} angerufen.`,
          translation: { ru: `Перевод 2 ${verbIndex}`, en: `Translation 2 ${verbIndex}` },
          bracket_parts: ['hat', 'angerufen'],
        },
      ],
    }));

    // Seed errors for specific sentences
    progressService.recordSentenceError('verb_0_s_err_0');
    progressService.recordSentenceError('verb_0_s_err_0'); // 2 errors
    progressService.recordSentenceError('verb_1_s_err_1'); // 1 error
    progressService.recordSentenceError('verb_2_s_err_2'); // 1 error

    const checkpointExercises = quizGeneratorService.generateCheckpointExercises(mockVerbs);

    expect(checkpointExercises.length).toBe(20);

    // The sentence with 2 errors should definitely be included in the checkpoint exercises
    const topErrorExercise = checkpointExercises.find(
      ex => ex.sentence.id === 's_err_0' && ex.verbCard.id === 'verb_0',
    );
    expect(topErrorExercise).toBeDefined();

    checkpointExercises.forEach(exercise => {
      expect(exercise.gaps.length).toBeGreaterThan(0);
      exercise.gaps.forEach(gap => {
        expect(gap.options.length).toBe(4);
        expect(gap.options).toContain(gap.correctValue);
      });
    });
  });

  it('should strictly prioritize sentences by tier: always incorrect > mixed by error rate > always correct > never practiced', () => {
    const mockCards: VerbCard[] = [
      {
        ...mockAnrufenCard,
        id: 'verb_p',
        infinitive: 'probieren',
        sentences: [
          {
            id: 's_always_wrong',
            tense: 'Präsens',
            german: 'Ich probiere 1',
            translation: { ru: 'Тест 1', en: 'Test 1' },
            bracket_parts: ['probiere'],
          },
          {
            id: 's_mixed_low_success',
            tense: 'Präsens',
            german: 'Ich probiere 2',
            translation: { ru: 'Тест 2', en: 'Test 2' },
            bracket_parts: ['probiere'],
          },
          {
            id: 's_always_correct',
            tense: 'Präsens',
            german: 'Ich probiere 3',
            translation: { ru: 'Тест 3', en: 'Test 3' },
            bracket_parts: ['probiere'],
          },
          {
            id: 's_never_practiced',
            tense: 'Präsens',
            german: 'Ich probiere 4',
            translation: { ru: 'Тест 4', en: 'Test 4' },
            bracket_parts: ['probiere'],
          },
        ],
      },
    ];

    // Seed:
    // s_always_wrong: 2 attempts, 0 correct (100% incorrect) -> Tier 1
    progressService.recordSentenceResult('verb_p_s_always_wrong', false);
    progressService.recordSentenceResult('verb_p_s_always_wrong', false);

    // s_mixed_low_success: 4 attempts, 1 correct, 3 incorrect (25% correct) -> Tier 2
    progressService.recordSentenceResult('verb_p_s_mixed_low_success', false);
    progressService.recordSentenceResult('verb_p_s_mixed_low_success', false);
    progressService.recordSentenceResult('verb_p_s_mixed_low_success', false);
    progressService.recordSentenceResult('verb_p_s_mixed_low_success', true);

    // s_always_correct: 3 attempts, 3 correct (100% correct) -> Tier 3
    progressService.recordSentenceResult('verb_p_s_always_correct', true);
    progressService.recordSentenceResult('verb_p_s_always_correct', true);
    progressService.recordSentenceResult('verb_p_s_always_correct', true);

    // s_never_practiced: 0 attempts -> Tier 4

    const generated = quizGeneratorService.generateCheckpointExercises(mockCards);
    const ids = generated.map(g => g.sentence.id);

    expect(ids).toContain('s_always_wrong');
    expect(ids).toContain('s_mixed_low_success');
    expect(ids).toContain('s_always_correct');
    expect(ids).toContain('s_never_practiced');
  });

  it('should generate smart quiz exercises prioritizing error-prone sentences up to maxCount', () => {
    const mockCards: VerbCard[] = [
      {
        ...mockAnrufenCard,
        id: 'verb_smart',
        infinitive: 'lernen',
        sentences: [
          {
            id: 'smart_s_wrong_many',
            tense: 'Präsens',
            german: 'Ich lerne 1',
            translation: { ru: 'Тест 1', en: 'Test 1' },
            bracket_parts: ['lerne'],
          },
          {
            id: 'smart_s_mixed',
            tense: 'Präsens',
            german: 'Ich lerne 2',
            translation: { ru: 'Тест 2', en: 'Test 2' },
            bracket_parts: ['lerne'],
          },
          {
            id: 'smart_s_perfect',
            tense: 'Präsens',
            german: 'Ich lerne 3',
            translation: { ru: 'Тест 3', en: 'Test 3' },
            bracket_parts: ['lerne'],
          },
          {
            id: 'smart_s_new',
            tense: 'Präsens',
            german: 'Ich lerne 4',
            translation: { ru: 'Тест 4', en: 'Test 4' },
            bracket_parts: ['lerne'],
          },
        ],
      },
    ];

    // Seed stats:
    progressService.recordSentenceResult('verb_smart_smart_s_wrong_many', false);
    progressService.recordSentenceResult('verb_smart_smart_s_wrong_many', false);

    progressService.recordSentenceResult('verb_smart_smart_s_mixed', false);
    progressService.recordSentenceResult('verb_smart_smart_s_mixed', true);

    progressService.recordSentenceResult('verb_smart_smart_s_perfect', true);

    const generated = quizGeneratorService.generateSmartQuizExercises(mockCards, 50);

    expect(generated.length).toBe(4);
    generated.forEach(exercise => {
      expect(exercise.id.startsWith('smart_sentence_')).toBe(true);
      expect(exercise.gaps.length).toBeGreaterThan(0);
    });
  });
});
