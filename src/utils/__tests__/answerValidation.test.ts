import { isAnswerCorrect, normalizeGermanAnswer } from '../answerValidation';

describe('answerValidation', () => {
  describe('normalizeGermanAnswer', () => {
    it('trims whitespace and converts to lower case', () => {
      expect(normalizeGermanAnswer('  Gehe  ')).toBe('gehe');
      expect(normalizeGermanAnswer('MACHEN')).toBe('machen');
    });

    it('collapses multiple spaces', () => {
      expect(normalizeGermanAnswer('auf   den')).toBe('auf den');
    });

    it('normalizes umlauts and sharp S', () => {
      expect(normalizeGermanAnswer('müssen')).toBe('muessen');
      expect(normalizeGermanAnswer('können')).toBe('koennen');
      expect(normalizeGermanAnswer('Mädchen')).toBe('maedchen');
      expect(normalizeGermanAnswer('weiß')).toBe('weiss');
    });

    it('normalizes contracted prepositions and their expanded forms to identical canonical form', () => {
      expect(normalizeGermanAnswer('im')).toBe(normalizeGermanAnswer('in dem'));
      expect(normalizeGermanAnswer('vom')).toBe(normalizeGermanAnswer('von dem'));
      expect(normalizeGermanAnswer('ans')).toBe(normalizeGermanAnswer('an das'));
      expect(normalizeGermanAnswer('fürs')).toBe(normalizeGermanAnswer('fuer das'));
    });
  });

  describe('isAnswerCorrect', () => {
    it('matches exact strings', () => {
      expect(isAnswerCorrect('gehe', 'gehe')).toBe(true);
      expect(isAnswerCorrect('macht', 'macht')).toBe(true);
    });

    it('ignores case and whitespace differences', () => {
      expect(isAnswerCorrect('  Gehe ', 'gehe')).toBe(true);
      expect(isAnswerCorrect('AUF DEN', 'auf den')).toBe(true);
    });

    it('accepts ae/oe/ue/ss instead of ä/ö/ü/ß', () => {
      expect(isAnswerCorrect('muessen', 'müssen')).toBe(true);
      expect(isAnswerCorrect('müssen', 'muessen')).toBe(true);
      expect(isAnswerCorrect('koennen', 'können')).toBe(true);
      expect(isAnswerCorrect('weiss', 'weiß')).toBe(true);
      expect(isAnswerCorrect('weiß', 'weiss')).toBe(true);
    });

    it('accepts contracted and expanded preposition pairs interchangeably', () => {
      expect(isAnswerCorrect('im', 'in dem')).toBe(true);
      expect(isAnswerCorrect('in dem', 'im')).toBe(true);
      expect(isAnswerCorrect('vom', 'von dem')).toBe(true);
      expect(isAnswerCorrect('von dem', 'vom')).toBe(true);
      expect(isAnswerCorrect('ans', 'an das')).toBe(true);
      expect(isAnswerCorrect('an das', 'ans')).toBe(true);
      expect(isAnswerCorrect('fuer das', 'fürs')).toBe(true);
      expect(isAnswerCorrect('fürs', 'für das')).toBe(true);
    });

    it('handles inseparable prefix slots (target — or -)', () => {
      expect(isAnswerCorrect('', '—')).toBe(true);
      expect(isAnswerCorrect('-', '—')).toBe(true);
      expect(isAnswerCorrect('—', '—')).toBe(true);
      expect(isAnswerCorrect('  ', '—')).toBe(true);
      expect(isAnswerCorrect('an', '—')).toBe(false);
    });

    it('returns false for incorrect answers', () => {
      expect(isAnswerCorrect('geht', 'gehe')).toBe(false);
      expect(isAnswerCorrect('auf dem', 'auf den')).toBe(false);
      expect(isAnswerCorrect('hat', 'ist')).toBe(false);
    });
  });
});
