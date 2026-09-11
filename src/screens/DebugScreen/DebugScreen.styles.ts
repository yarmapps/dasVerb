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
      paddingBottom: Spacing.xxl * 2,
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
      padding: Spacing.lg,
    },
    statusRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: Spacing.xs,
    },
    statusLabel: {
      fontSize: Typography.fontSize.sm,
      color: colors.textPrimary,
    },
    statusValue: {
      fontSize: Typography.fontSize.sm,
      fontWeight: '600',
      color: colors.primary,
    },
    divider: {
      height: 1,
      backgroundColor: colors.blockBorder,
      marginVertical: Spacing.md,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.lg,
      borderRadius: 12,
      marginVertical: Spacing.xs,
    },
    buttonIcon: {
      marginRight: Spacing.sm,
    },
    actionButtonPrimary: {
      backgroundColor: colors.primary,
    },
    actionButtonSecondary: {
      backgroundColor: colors.blockBorder,
    },
    actionButtonDanger: {
      backgroundColor: colors.grammar.sein,
    },
    actionButtonWarning: {
      backgroundColor: colors.secondary,
    },
    actionButtonTextLight: {
      fontSize: Typography.fontSize.sm,
      fontWeight: '600',
      color: colors.white,
    },
    actionButtonTextDark: {
      fontSize: Typography.fontSize.sm,
      fontWeight: '600',
      color: colors.textPrimary,
    },
    featureRow: {
      marginBottom: Spacing.lg,
    },
    featureHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Spacing.sm,
    },
    featureTitle: {
      fontSize: Typography.fontSize.sm,
      fontWeight: '700',
      color: colors.textPrimary,
      flex: 1,
      marginRight: Spacing.sm,
    },
    featureTag: {
      paddingHorizontal: Spacing.sm,
      paddingVertical: 2,
      borderRadius: 6,
      borderWidth: 1,
    },
    featureTagText: {
      fontSize: Typography.fontSize.xxs,
      fontWeight: '700',
      letterSpacing: 0.5,
    },
    featureTagActive: {
      backgroundColor: colors.featureBadges.green + '20',
      borderColor: colors.featureBadges.green,
    },
    featureTagActiveText: {
      color: colors.featureBadges.green,
    },
    featureTagInactive: {
      backgroundColor: colors.textMuted + '20',
      borderColor: colors.textMuted,
    },
    featureTagInactiveText: {
      color: colors.textMuted,
    },
    toggleGrid: {
      flexDirection: 'row',
      gap: Spacing.xs,
    },
    toggleBtn: {
      flex: 1,
      paddingVertical: Spacing.sm,
      paddingHorizontal: Spacing.xs,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.blockBorder,
    },
    toggleBtnActiveOn: {
      backgroundColor: colors.primary,
    },
    toggleBtnActiveOff: {
      backgroundColor: colors.grammar.sein,
    },
    toggleBtnActiveDefault: {
      backgroundColor: colors.secondary,
    },
    toggleBtnText: {
      fontSize: Typography.fontSize.xs,
      fontWeight: '600',
      color: colors.textPrimary,
    },
    toggleBtnTextActive: {
      color: colors.white,
      fontWeight: '700',
    },
  });
