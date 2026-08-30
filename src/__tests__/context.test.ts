import { getTranslations } from '../services/intlService';
import { darkColors, lightColors } from '../styles/themeColors';

describe('Theme and Locale Configuration', () => {
  it('should have consistent dark and light theme structures', () => {
    const lightKeys = Object.keys(lightColors);
    const darkKeys = Object.keys(darkColors);

    expect(lightKeys).toEqual(darkKeys);
    expect(Object.keys(lightColors.grammar)).toEqual(Object.keys(darkColors.grammar));
  });

  it('should have valid colors and grammar tokens in both themes', () => {
    expect(lightColors.background).toBeDefined();
    expect(lightColors.blockBackground).toBeDefined();
    expect(lightColors.blockBorder).toBeDefined();
    expect(lightColors.textMutedInverted).toBeDefined();
    expect(lightColors.grammar.haben).toBeDefined();
    expect(lightColors.grammar.sein).toBeDefined();

    expect(darkColors.background).toBeDefined();
    expect(darkColors.blockBackground).toBeDefined();
    expect(darkColors.blockBorder).toBeDefined();
    expect(darkColors.textMutedInverted).toBeDefined();
    expect(darkColors.grammar.haben).toBeDefined();
    expect(darkColors.grammar.sein).toBeDefined();
  });

  it('should properly load translations through intl service', () => {
    const ruTranslations = getTranslations('ru');
    expect(ruTranslations.languageSelectorScreen.title).toBe('Какой ваш родной язык?');
    expect(ruTranslations.languageSelectorScreen.continue).toBe('Продолжить');

    const enTranslations = getTranslations('en');
    expect(enTranslations.languageSelectorScreen.title).toBe("What's your native language?");
    expect(enTranslations.languageSelectorScreen.continue).toBe('Continue');
  });
});
