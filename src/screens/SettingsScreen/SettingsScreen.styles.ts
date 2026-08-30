import { StyleSheet } from 'react-native';
import { ThemeColors } from '../../styles/themeColors';
import { Typography } from '../../styles/typography';
import { Spacing } from '../../styles/spacing';

export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
      paddingHorizontal: Spacing.xl,
      paddingTop: Spacing.md,
    },
    scrollContent: {
      paddingBottom: Spacing.xxl,
    },
    sectionTitle: {
      fontSize: Typography.fontSize.xs,
      fontWeight: '600',
      color: colors.textMuted,
      marginTop: Spacing.xl,
      marginBottom: Spacing.sm,
      letterSpacing: 1,
      textTransform: 'uppercase',
    },
    sectionContainer: {
      backgroundColor: colors.blockBackground,
      borderRadius: 16,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.blockBorder,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: Spacing.lg,
      paddingHorizontal: Spacing.lg,
      backgroundColor: 'transparent',
    },
    rowLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      marginRight: Spacing.md,
    },
    iconContainer: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: `${colors.primary}20`,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: Spacing.md,
      overflow: 'hidden',
    },
    rowLabel: {
      fontSize: Typography.fontSize.sm,
      color: colors.textPrimary,
      fontWeight: '500',
      flex: 1,
    },
    rowRight: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    rowRightContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    rowValue: {
      fontSize: Typography.fontSize.sm,
      color: colors.textMutedInverted,
      marginRight: Spacing.xs,
    },
    separator: {
      height: 1,
      backgroundColor: colors.blockBorder,
      marginLeft: Spacing.lg + 32 + Spacing.md,
    },
    versionText: {
      textAlign: 'center',
      fontSize: Typography.fontSize.xs,
      color: colors.textMuted,
      marginTop: Spacing.xl,
      marginBottom: Spacing.xl,
    },
  });
