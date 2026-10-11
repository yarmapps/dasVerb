import { StyleSheet } from 'react-native';
import { ThemeColors } from '../../styles/themeColors';
import { Spacing } from '../../styles/spacing';
import { Typography } from '../../styles/typography';

export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    headerLeftRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
    },
    content: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: Spacing.xl,
      paddingTop: Spacing.sm,
      paddingBottom: Spacing.xxxl,
      gap: Spacing.lg,
    },
    sectionTitle: {
      fontSize: Typography.fontSize.xs,
      fontWeight: Typography.fontWeight.semiBold,
      color: colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      marginTop: Spacing.xs,
      marginBottom: -Spacing.xs,
      paddingHorizontal: Spacing.xxs,
    },
    gridRow: {
      flexDirection: 'row',
      alignItems: 'stretch',
      gap: Spacing.md,
    },
  });
