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
    mainContent: {
      flex: 1,
      paddingHorizontal: Spacing.xl,
      paddingBottom: Spacing.md,
      justifyContent: 'space-between',
    },
    heroSection: {
      alignItems: 'center',
      marginTop: Spacing.sm,
      marginBottom: Spacing.xl,
    },
    headline: {
      fontSize: 24,
      fontWeight: '800',
      color: colors.textPrimary,
      textAlign: 'center',
      marginTop: Spacing.sm,
      marginBottom: Spacing.xs,
    },
    scoreText: {
      fontSize: Typography.fontSize.sm,
      fontWeight: '600',
      color: colors.textSecondary,
      textAlign: 'center',
    },
    reviewSection: {
      flex: 1,
      justifyContent: 'center',
      marginTop: Spacing.sm,
      marginBottom: Spacing.xl,
    },
    reviewCard: {
      flexGrow: 0,
      flexShrink: 1,
      maxHeight: '100%',
      backgroundColor: colors.blockBackground,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.blockBorder,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 8,
      elevation: 2,
    },
    reviewList: {
      flexGrow: 0,
      flexShrink: 1,
    },
    reviewListContent: {
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.xs,
    },
    reviewItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingVertical: Spacing.sm + 2,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.blockBorder,
      gap: Spacing.sm,
    },
    reviewItemLast: {
      borderBottomWidth: 0,
    },
    reviewIconContainer: {
      marginTop: 2,
    },
    reviewContent: {
      flex: 1,
    },
    reviewGermanText: {
      fontSize: Typography.fontSize.md,
      fontWeight: '600',
      color: colors.textPrimary,
      lineHeight: 22,
    },
    reviewTranslationText: {
      fontSize: Typography.fontSize.xs,
      color: colors.textMuted,
      marginTop: 2,
      lineHeight: 18,
    },
    bottomActions: {
      marginTop: Spacing.sm,
      marginBottom: Spacing.xs,
      gap: Spacing.md,
    },
    primaryButton: {
      height: 52,
      borderRadius: 14,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 10,
      elevation: 4,
    },
    primaryButtonText: {
      fontSize: Typography.fontSize.md,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    secondaryButton: {
      height: 52,
      borderRadius: 14,
      backgroundColor: `${colors.primary}10`,
      borderWidth: 1.5,
      borderColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    secondaryButtonText: {
      fontSize: Typography.fontSize.md,
      fontWeight: '700',
      color: colors.primary,
    },
  });
