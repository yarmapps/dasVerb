import { StyleSheet } from 'react-native';
import { ThemeColors } from '../../styles/themeColors';
import { Typography } from '../../styles/typography';
import { Spacing, BorderRadius } from '../../styles/spacing';

export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(5, 3, 15, 0.85)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: Spacing.xl,
    },
    modalContainer: {
      width: '100%',
      maxWidth: 380,
      backgroundColor: colors.blockBackground,
      borderRadius: BorderRadius.xl,
      paddingHorizontal: Spacing.xl,
      paddingTop: Spacing.xxl,
      paddingBottom: Spacing.xl,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.blockBorder,
      elevation: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.25,
      shadowRadius: 20,
    },
    closeButton: {
      position: 'absolute',
      top: Spacing.md,
      right: Spacing.md,
    },
    iconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: `${colors.primary}18`,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: Spacing.xl,
      marginTop: Spacing.sm,
    },
    title: {
      fontSize: Typography.fontSize.xl,
      fontWeight: Typography.fontWeight.bold,
      color: colors.textPrimary,
      marginBottom: Spacing.md,
      textAlign: 'center',
    },
    message: {
      fontSize: Typography.fontSize.md,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: Spacing.xxl,
      lineHeight: 22,
    },
    button: {
      backgroundColor: colors.primary,
      paddingVertical: 14,
      paddingHorizontal: Spacing.xxl,
      borderRadius: BorderRadius.full,
      width: '100%',
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    buttonText: {
      color: colors.white,
      fontSize: Typography.fontSize.md,
      fontWeight: Typography.fontWeight.bold,
      textAlign: 'center',
    },
  });
