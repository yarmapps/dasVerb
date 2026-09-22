import { StyleSheet } from 'react-native';
import { ThemeColors } from '../../styles/themeColors';
import { Spacing, BorderRadius } from '../../styles/spacing';
import { Typography } from '../../styles/typography';

export const createStyles = (colors: ThemeColors, isDark: boolean) =>
  StyleSheet.create({
    cardWrapper: {
      width: '100%',
    },
    container: {
      width: '100%',
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: Spacing.sm,
      paddingRight: 28,
    },
    adBadge: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.06)',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.blockBorder,
    },
    adBadgeText: {
      fontSize: 10,
      fontWeight: '700',
      color: colors.textSecondary,
      letterSpacing: 0.5,
      textTransform: 'uppercase',
    },
    advertiserText: {
      fontSize: 11,
      color: colors.textSecondary,
      marginLeft: Spacing.sm,
      flex: 1,
    },
    mainContent: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: Spacing.md,
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
    ctaButton: {
      backgroundColor: colors.primary,
      color: '#FFFFFF',
      fontSize: Typography.fontSize.sm,
      fontWeight: '700',
      textAlign: 'center',
      borderRadius: BorderRadius.full,
      paddingVertical: 10,
      paddingHorizontal: Spacing.lg,
      overflow: 'hidden',
    },
  });
