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
        expect(['weak', 'strong', 'mixed', 'modal', 'auxiliary']).toContain(
          verb.morphology.verb_class,
        );
        expect(['none', 'separable', 'inseparable', 'dual']).toContain(verb.morphology.prefix_type);
        expect(typeof verb.morphology.is_reflexive).toBe('boolean');
      });

      it('should have 3 principal parts (Stammformen)', () => {
        expect(verb.principal_parts).toBeDefined();
        expect(verb.principal_parts.infinitive).toBe(verb.infinitive);
        expect(verb.principal_parts.present_3sg).toBeDefined();
        expect(verb.principal_parts.praeteritum_3sg).toBeDefined();
        expect(verb.principal_parts.partizip_2).toBeDefined();
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
