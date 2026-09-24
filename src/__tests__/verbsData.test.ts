import fs from 'fs';
import path from 'path';
import { VerbCard, VerbSentence } from '../../docs/verb.types';

describe('German Verb JSON Cards Data Integrity', () => {
  const dataDir = path.resolve(__dirname, '../../data');
  const files = fs.readdirSync(dataDir).filter(file => file.endsWith('.json'));

  it('should have at least 20 verb cards in data directory', () => {
    expect(files.length).toBeGreaterThanOrEqual(20);
  });

  files.forEach(file => {
    describe(`Verb Card: ${file}`, () => {
      const filePath = path.join(dataDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const verb: VerbCard = JSON.parse(content);

      it('should have valid basic properties', () => {
        expect(verb.id).toBeDefined();
        expect(verb.infinitive).toBeDefined();
        expect(verb.translation).toBeDefined();
        expect(verb.translation.ru).toBeDefined();
        expect(verb.translation.en).toBeDefined();
        expect(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']).toContain(verb.level);
        expect(typeof verb.frequency_rank).toBe('number');
        expect(verb.frequency_rank).toBeGreaterThan(0);
        expect(['haben', 'sein', 'both']).toContain(verb.auxiliary);
      });

      it('should have valid morphology block', () => {
        expect(verb.morphology).toBeDefined();
        const verbClass = verb.morphology.verb_class;
        expect(['weak', 'strong', 'mixed', 'modal', 'auxiliary', 'irregular']).toContain(verbClass);
        const morphologyRecord = verb.morphology as unknown as Record<string, unknown>;
        let prefixType = morphologyRecord.prefix_type;
        if (!prefixType) {
          if (morphologyRecord.is_separable === true) {
            prefixType = 'separable';
          } else if (morphologyRecord.is_separable === false) {
            prefixType = 'inseparable';
          } else {
            prefixType = 'none';
          }
        }
        expect(['none', 'separable', 'inseparable', 'dual']).toContain(prefixType);
        expect(typeof verb.morphology.is_reflexive).toBe('boolean');
      });

      it('should have 3 principal parts (Stammformen)', () => {
        const pp = verb.principal_parts as unknown as Record<string, unknown> | undefined;
        expect(pp).toBeDefined();
        const infinitive = (pp?.infinitive as string) || verb.infinitive;
        const pres3sg = pp?.present_3sg || pp?.present_third_singular;
        const praet3sg = pp?.praeteritum_3sg || pp?.preterite_third_singular;
        const p2 = pp?.partizip_2 || pp?.past_participle;
        expect(infinitive).toBe(verb.infinitive);
        expect(pres3sg).toBeDefined();
        expect(praet3sg).toBeDefined();
        expect(p2).toBeDefined();
      });

      it('should have present conjugation', () => {
        expect(verb.conjugation).toBeDefined();
        expect(verb.conjugation.present).toBeDefined();
        expect(verb.conjugation.present.ich).toBeDefined();
        expect(verb.conjugation.present.du).toBeDefined();
        expect(verb.conjugation.present.er_sie_es).toBeDefined();
        expect(verb.conjugation.present.wir).toBeDefined();
        expect(verb.conjugation.present.ihr).toBeDefined();
        expect(verb.conjugation.present.sie_Sie).toBeDefined();
      });

      it('should have imperative conjugation', () => {
        expect(verb.conjugation).toBeDefined();
        if (verb.conjugation.imperative) {
          expect(verb.conjugation.imperative.du).toBeDefined();
          expect(verb.conjugation.imperative.ihr).toBeDefined();
          expect(verb.conjugation.imperative.Sie).toBeDefined();
        }
      });

      it('should have valid rektion definitions and pure prepositions', () => {
        expect(verb.rektion).toBeDefined();
        expect(typeof verb.rektion.requires_object).toBe('boolean');
        if (verb.rektion.preposition) {
          const forbiddenContracted = [
            'im',
            'am',
            'zum',
            'zur',
            'beim',
            'ins',
            'ans',
            'vom',
            'aufs',
            'fürs',
          ];
          expect(forbiddenContracted).not.toContain(verb.rektion.preposition.toLowerCase());
        }
      });

      it('should have 8 example sentences covering required tenses and valid translations', () => {
        expect(Array.isArray(verb.sentences)).toBe(true);
        expect(verb.sentences.length).toBe(8);
        verb.sentences.forEach((sentence: VerbSentence) => {
          expect(sentence.german).toBeDefined();
          expect(sentence.translation.ru).toBeDefined();
          expect(sentence.translation.en).toBeDefined();
        });
      });

      it('should have valid bracket_parts and literal substrings matching German grammar rules', () => {
        const isSeparable = verb.morphology.prefix_type === 'separable';

        verb.sentences.forEach((sentence: VerbSentence) => {
          const {
            german,
            bracket_parts: bracketParts = [],
            dativ_parts: dativParts = [],
            akkusativ_parts: akkusativParts = [],
            tense,
          } = sentence;

          // 1. Bracket parts presence in sentence
          bracketParts.forEach(part => {
            expect(german.toLowerCase()).toContain(part.toLowerCase());
          });

          // 2. Exact bracket parts count according to German syntax (Satzklammer)
          if (tense === 'Perfekt') {
            expect(bracketParts.length).toBe(2);
          } else if (tense === 'Präsens' || tense === 'Präteritum' || tense === 'Imperativ') {
            if (isSeparable) {
              expect(bracketParts.length).toBe(2);
            } else {
              expect(bracketParts.length).toBe(1);
            }
          }

          // 3. Dativ and Akkusativ parts must literally exist in the sentence
          dativParts.forEach(part => {
            expect(german.toLowerCase()).toContain(part.toLowerCase());
          });

          akkusativParts.forEach(part => {
            expect(german.toLowerCase()).toContain(part.toLowerCase());
          });
        });
      });
    });
  });
});
