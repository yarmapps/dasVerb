import { parseVerbRow, VerbRow } from '../services/verbDataService';

describe('verbDataService', () => {
  it('should correctly parse VerbRow into VerbCard', () => {
    const mockRow: VerbRow = {
      id: 'anrufen',
      infinitive: 'anrufen',
      infinitive_lower: 'anrufen',
      level: 'A1',
      frequency_rank: 120,
      auxiliary: 'haben',
      morphology: JSON.stringify({
        verb_class: 'strong',
        prefix_type: 'separable',
        prefix: 'an',
        is_reflexive: false,
        reflexive_case: null,
      }),
      principal_parts: JSON.stringify({
        infinitive: 'anrufen',
        present_3sg: 'ruft an',
        praeteritum_3sg: 'rief an',
        partizip_2: 'angerufen',
      }),
      conjugation: JSON.stringify({
        present: {
          ich: 'rufe an',
          du: 'rufst an',
          er_sie_es: 'ruft an',
          wir: 'rufen an',
          ihr: 'ruft an',
          sie_Sie: 'rufen an',
        },
      }),
      rektion: JSON.stringify({
        requires_object: true,
        direct_case: 'Akkusativ',
        preposition: null,
        preposition_case: null,
      }),
      chunk: 'jemanden (Akk) anrufen',
      sentences: JSON.stringify([
        {
          id: 's1',
          tense: 'Präsens',
          german: 'Ich rufe meine Mutter an.',
          translation: {
            ru: 'Я звоню своей маме.',
            en: 'I call my mother.',
          },
          bracket_parts: ['rufe', 'an'],
        },
      ]),
      translation: JSON.stringify({
        ru: 'звонить',
        en: 'to call',
      }),
      search_text: 'anrufen an ruft an rief an angerufen звонить to call',
    };

    const verb = parseVerbRow(mockRow);
    expect(verb.id).toBe('anrufen');
    expect(verb.infinitive).toBe('anrufen');
    expect(verb.level).toBe('A1');
    expect(verb.frequency_rank).toBe(120);
    expect(verb.auxiliary).toBe('haben');
    expect(verb.morphology.prefix).toBe('an');
    expect(verb.principal_parts.present_3sg).toBe('ruft an');
    expect(verb.conjugation.present.ich).toBe('rufe an');
    expect(verb.rektion.direct_case).toBe('Akkusativ');
    expect(verb.translation.ru).toBe('звонить');
    expect(verb.sentences[0].bracket_parts).toEqual(['rufe', 'an']);
  });
});
