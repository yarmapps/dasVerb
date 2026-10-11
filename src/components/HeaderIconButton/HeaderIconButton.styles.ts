import { StyleSheet } from 'react-native';
import { ThemeColors } from '../../styles/themeColors';
import { Spacing, BorderRadius } from '../../styles/spacing';
import { Typography } from '../../styles/typography';

export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    circleButton: {
      width: 40,
      height: 40,
      borderRadius: BorderRadius.xl,
      backgroundColor: colors.headerButtonBackground,
      alignItems: 'center',
      justifyContent: 'center',
    },
    pillButton: {
      height: 40,
      minWidth: 44,
      paddingHorizontal: Spacing.md,
      borderRadius: BorderRadius.xl,
      backgroundColor: colors.headerButtonBackground,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    },
    innerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.xs + 2,
    },
    label: {
      fontSize: Typography.fontSize.sm,
      fontWeight: Typography.fontWeight.bold,
      color: colors.textPrimary,
      includeFontPadding: false,
    },
  });
