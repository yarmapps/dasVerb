import { StyleSheet } from 'react-native';
import { ThemeColors } from '../../styles/themeColors';
import { Spacing } from '../../styles/spacing';
import { Typography } from '../../styles/typography';

export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      marginBottom: Spacing.md,
    },
    label: {
      fontSize: Typography.fontSize.xs,
      fontWeight: '600',
      color: colors.textMuted,
      letterSpacing: 1,
      textTransform: 'uppercase',
      marginBottom: Spacing.xs,
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.blockBackground,
      borderRadius: 12,
      paddingHorizontal: Spacing.lg,
      borderWidth: 1,
      borderColor: colors.blockBorder,
    },
    inputRowFocused: {
      borderColor: colors.primary,
    },
    inputRowError: {
      borderColor: colors.grammar.sein,
    },
    input: {
      flex: 1,
      color: colors.textPrimary,
      fontSize: Typography.fontSize.md,
      paddingVertical: Spacing.md,
    },
    leftIcon: {
      marginRight: Spacing.sm,
    },
    rightIcon: {
      alignSelf: 'stretch',
      justifyContent: 'center',
      paddingLeft: Spacing.md,
    },
  });
