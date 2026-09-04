/**
 * themeColors.ts
 * Цветовая палитра темной и светлой тем для dasVerb
 */

export interface ThemeColors {
  // Базовые фоновые цвета
  background: string; // Фон приложения
  blockBackground: string; // Фон карточек
  blockBorder: string; // Цвет рамок блоков
  headerButtonBackground: string; // Полупрозрачный фон для кнопок хедера и действий

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

  // Премиум токены (derArtikel style)
  premiumDiamond: string;
  premiumHighlight: string;
  premiumHighlightText: string;
  premiumSecondarySurface: string;
  premiumGradient: readonly [string, string, ...string[]];
  featureBadges: {
    blue: string;
    purple: string;
    cyan: string;
    pink: string;
    green: string;
    yellow: string;
  };
  white: string;
  textDisabled: string;
}

export const lightColors: ThemeColors = {
  background: '#FFF6F4',
  blockBackground: '#FFFFFF',
  blockBorder: '#F7DDD5',
  headerButtonBackground: 'rgba(0, 0, 0, 0.05)',

  textPrimary: '#1D1D1F',
  textSecondary: '#424245',
  textMuted: '#6E6E73',
  textMutedInverted: '#6E6E73',

  primary: '#2563EB',
  secondary: '#7C3AED',
  tertiary: '#10B981',

  grammar: {
    haben: '#0284C7', // haben
    sein: '#E11D48', // sein
  },

  premiumDiamond: '#A05BFA',
  premiumHighlight: '#FACC15',
  premiumHighlightText: '#241641',
  premiumSecondarySurface: '#F0F0F2',
  premiumGradient: ['#1E1145', '#2D1B69', '#1A0B2E'] as const,
  featureBadges: {
    blue: '#3B5EF5',
    purple: '#8B5CF6',
    cyan: '#0EA5E9',
    pink: '#EC4899',
    green: '#22C55E',
    yellow: '#FACC15',
  },
  white: '#FFFFFF',
  textDisabled: 'rgba(60, 60, 67, 0.3)',
};

export const darkColors: ThemeColors = {
  background: '#0B1120',
  blockBackground: '#1E293B',
  blockBorder: '#334155',
  headerButtonBackground: 'rgba(255, 255, 255, 0.12)',

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

  premiumDiamond: '#D5B4FF',
  premiumHighlight: '#FACC15',
  premiumHighlightText: '#241641',
  premiumSecondarySurface: '#241641',
  premiumGradient: ['#1E1145', '#2D1B69', '#1A0B2E'] as const,
  featureBadges: {
    blue: '#3B5EF5',
    purple: '#8B5CF6',
    cyan: '#0EA5E9',
    pink: '#EC4899',
    green: '#22C55E',
    yellow: '#FACC15',
  },
  white: '#FFFFFF',
  textDisabled: 'rgba(255, 255, 255, 0.3)',
};

export const Colors = darkColors;
