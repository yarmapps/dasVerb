import { StyleSheet } from 'react-native';
import { ThemeColors } from '../../styles/themeColors';
import { Spacing, BorderRadius } from '../../styles/spacing';
import { Typography } from '../../styles/typography';

export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    badgeContainer: {
      height: 38,
      minWidth: 44,
      paddingHorizontal: Spacing.md,
      borderRadius: BorderRadius.xl,
      backgroundColor: colors.headerButtonBackground,
      alignItems: 'center',
      justifyContent: 'center',
    },
    innerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.xs,
    },
    streakText: {
      fontSize: Typography.fontSize.sm,
      fontWeight: Typography.fontWeight.bold,
      color: colors.textPrimary,
      includeFontPadding: false,
    },
  });
