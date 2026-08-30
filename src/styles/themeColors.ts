/**
 * themeColors.ts
 * Цветовая палитра темной и светлой тем для dasVerb
 */

export interface ThemeColors {
  // Базовые фоновые цвета
  background: string; // Фон приложения
  blockBackground: string; // Фон карточек
  blockBorder: string; // Цвет рамок блоков

  // Текст
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textMutedInverted: string; // Контрастный приглушенный текст внутри блоков

  // Брендовые / акцентные
  primary: string;
  secondary: string;
  tertiary: string;

  // Грамматические токены немецкого языка
  grammar: {
    // Вспомогательные глаголы (Perfekt)
    haben: string;
    sein: string;
  };
}

export const lightColors: ThemeColors = {
  background: '#F8FAFC',
  blockBackground: '#EEF2F6',
  blockBorder: '#CBD5E1',

  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textMutedInverted: '#475569',

  primary: '#2563EB',
  secondary: '#7C3AED',
  tertiary: '#10B981',

  grammar: {
    haben: '#0284C7', // haben
    sein: '#E11D48', // sein
  },
};

export const darkColors: ThemeColors = {
  background: '#0B1120',
  blockBackground: '#1E293B',
  blockBorder: '#334155',

  textPrimary: '#F8FAFC',
  textSecondary: '#CBD5E1',
  textMuted: '#64748B',
  textMutedInverted: '#94A3B8',

  primary: '#3B82F6',
  secondary: '#A855F7',
  tertiary: '#06B6D4',

  grammar: {
    haben: '#38BDF8',
    sein: '#FB7185',
  },
};

export const Colors = darkColors;
