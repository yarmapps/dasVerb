import { StyleSheet } from 'react-native';
import { ThemeColors } from '../../styles/themeColors';
import { Spacing, BorderRadius } from '../../styles/spacing';
import { Typography } from '../../styles/typography';

export const createStyles = (colors: ThemeColors, _isDark: boolean) =>
  StyleSheet.create({
    cardWrapper: {
      width: '100%',
      marginBottom: Spacing.md,
    },
    container: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
    },
    icon: {
      width: 44,
      height: 44,
      borderRadius: BorderRadius.sm,
      marginRight: Spacing.md,
      backgroundColor: colors.blockBorder,
    },
    textColumn: {
      flex: 1,
      justifyContent: 'center',
      paddingRight: Spacing.xs,
    },
    headline: {
      fontSize: Typography.fontSize.sm,
      fontWeight: '700',
      color: colors.textPrimary,
      marginBottom: 2,
      lineHeight: 18,
    },
    body: {
      fontSize: 12,
      color: colors.textSecondary,
      lineHeight: 16,
    },
  });
