/**
 * themeColors.ts
 * Цветовая палитра темной и светлой тем для dasVerb
 */

export interface ThemeColors {
  // Базовые фоновые цвета
  background: string;
  surface: string;
  surfaceElevated: string;
  surfaceHighlight: string;
  border: string;
  borderFocus: string;

  // Текст
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;

  // Брендовые / акцентные
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;

  // Состояния
  success: string;
  warning: string;
  error: string;
  info: string;

  // Грамматические токены немецкого языка
  grammar: {
    // Падежи
    nominativ: string;
    akkusativ: string;
    dativ: string;
    genitiv: string;

    // Вспомогательные глаголы (Perfekt)
    haben: string;
    sein: string;

    // Приставки
    separablePrefix: string;
    inseparablePrefix: string;

    // Глагольная рамка (Satzklammer)
    bracketLeft: string;
    bracketRight: string;
  };
}

export const lightColors: ThemeColors = {
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceElevated: '#F1F5F9',
  surfaceHighlight: '#E2E8F0',
  border: '#E2E8F0',
  borderFocus: '#3B82F6',

  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textInverse: '#FFFFFF',

  primary: '#2563EB',
  primaryLight: '#DBEAFE',
  primaryDark: '#1D4ED8',
  secondary: '#7C3AED',

  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#06B6D4',

  grammar: {
    nominativ: '#3B82F6', // Синий
    akkusativ: '#10B981', // Зеленый
    dativ: '#F59E0B', // Оранжевый / Янтарный
    genitiv: '#8B5CF6', // Фиолетовый

    haben: '#0284C7', // Небесно-голубой
    sein: '#E11D48', // Розово-красный

    separablePrefix: '#D97706',
    inseparablePrefix: '#6D28D9',

    bracketLeft: '#2563EB',
    bracketRight: '#D97706',
  },
};

export const darkColors: ThemeColors = {
  background: '#0B1120',
  surface: '#1E293B',
  surfaceElevated: '#334155',
  surfaceHighlight: '#475569',
  border: '#334155',
  borderFocus: '#60A5FA',

  textPrimary: '#F8FAFC',
  textSecondary: '#CBD5E1',
  textMuted: '#64748B',
  textInverse: '#0F172A',

  primary: '#3B82F6',
  primaryLight: '#1E3A8A',
  primaryDark: '#60A5FA',
  secondary: '#A855F7',

  success: '#34D399',
  warning: '#FBBF24',
  error: '#F87171',
  info: '#38BDF8',

  grammar: {
    nominativ: '#60A5FA',
    akkusativ: '#34D399',
    dativ: '#FBBF24',
    genitiv: '#C084FC',

    haben: '#38BDF8',
    sein: '#FB7185',

    separablePrefix: '#F59E0B',
    inseparablePrefix: '#A855F7',

    bracketLeft: '#60A5FA',
    bracketRight: '#F59E0B',
  },
};

export const Colors = darkColors;
