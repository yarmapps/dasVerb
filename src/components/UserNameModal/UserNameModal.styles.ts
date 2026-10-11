import { StyleSheet } from 'react-native';
import { ThemeColors } from '../../styles/themeColors';
import { Spacing } from '../../styles/spacing';
import { Typography } from '../../styles/typography';

export const createStyles = (colors: ThemeColors, _isDark: boolean) =>
  StyleSheet.create({
    title: {
      fontSize: Typography.fontSize.lg,
      fontWeight: '700',
      marginTop: Spacing.sm,
      marginHorizontal: Spacing.xxl,
      marginBottom: Spacing.xs,
    },
    message: {
      fontSize: Typography.fontSize.sm,
      color: colors.textSecondary,
      marginBottom: Spacing.lg,
      lineHeight: 20,
    },
    inputContainer: {
      width: '100%',
    },
    input: {
      width: '100%',
      height: 48,
      borderRadius: 12,
      borderWidth: 1,
      paddingHorizontal: Spacing.md,
      fontSize: Typography.fontSize.md,
      marginBottom: Spacing.sm,
      backgroundColor: colors.background,
      color: colors.textPrimary,
      borderColor: colors.blockBorder,
    },
    inputError: {
      borderColor: colors.error,
    },
    errorText: {
      fontSize: Typography.fontSize.xxs,
      color: colors.error,
      alignSelf: 'flex-start',
      marginBottom: Spacing.sm,
    },
    saveBtn: {
      width: '100%',
      height: 48,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: Spacing.sm,
      backgroundColor: colors.primary,
    },
    disabledBtn: {
      opacity: 0.5,
    },
    saveBtnText: {
      color: '#FFFFFF',
      fontSize: Typography.fontSize.md,
      fontWeight: '700',
    },
  });
