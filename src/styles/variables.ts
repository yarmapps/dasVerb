/**
 * variables.ts
 * Агрегированные константы макета и стилизации
 */

import { Spacing, BorderRadius } from './spacing';
import { Typography } from './typography';
import { lightColors, darkColors, ThemeColors } from './themeColors';

export const Layout = {
  spacing: Spacing,
  borderRadius: BorderRadius,
  typography: Typography,
} as const;

export { Spacing, BorderRadius, Typography, lightColors, darkColors, ThemeColors };
