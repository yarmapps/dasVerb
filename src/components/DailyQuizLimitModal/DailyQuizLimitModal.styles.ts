import { StyleSheet } from 'react-native';
import { ThemeColors } from '../../styles/themeColors';
import { Spacing } from '../../styles/spacing';
import { Typography } from '../../styles/typography';

export const createStyles = (colors: ThemeColors, _isDark: boolean) =>
  StyleSheet.create({
    videoButtonIcon: {
      marginRight: Spacing.sm,
    },
    videoButtonText: {
      color: colors.primary,
      fontSize: Typography.fontSize.md,
      fontWeight: '700',
      textAlign: 'center',
    },
  });
