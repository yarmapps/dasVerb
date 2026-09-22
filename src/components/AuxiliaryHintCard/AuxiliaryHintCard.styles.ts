import { StyleSheet } from 'react-native';
import { ThemeColors } from '../../styles/themeColors';
import { Spacing } from '../../styles/spacing';
import { Typography } from '../../styles/typography';

export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      marginHorizontal: Spacing.xl,
      marginTop: Spacing.md,
      backgroundColor: colors.blockBackground,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.blockBorder,
      padding: Spacing.xl,
    },
    embeddedContainer: {
      marginTop: Spacing.lg,
      paddingTop: Spacing.lg,
      borderTopWidth: 1,
      borderTopColor: colors.blockBorder,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 6,
    },
    title: {
      fontSize: Typography.fontSize.xs,
      fontWeight: '700',
      color: colors.primary,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
    explanationText: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '400',
      color: colors.textPrimary,
    },
  });
