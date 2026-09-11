import { StyleSheet } from 'react-native';
import { ThemeColors } from '../../styles/themeColors';
import { Spacing, Typography } from '../../styles/variables';

export const createStyles = (colors: ThemeColors, isDark: boolean) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
    },

    /* ── Top bar ─────────────────────────────────────────── */
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: Spacing.xl,
      paddingTop: Spacing.sm,
      paddingBottom: Spacing.xs,
    },
    restoreText: {
      color: colors.textSecondary,
      fontSize: Typography.fontSize.xs,
      fontWeight: '600',
    },
    closeButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.headerButtonBackground,
    },

    /* ── Scroll content ──────────────────────────────────── */
    scrollContent: {
      paddingHorizontal: Spacing.xl,
      paddingBottom: Spacing.xl,
    },

    /* ── Header ──────────────────────────────────────────── */
    header: {
      alignItems: 'center',
      marginTop: Spacing.lg,
      marginBottom: Spacing.xxl,
    },
    trialBadge: {
      backgroundColor: isDark ? colors.premiumHighlight : colors.primary,
      paddingHorizontal: Spacing.md,
      paddingVertical: 6,
      borderRadius: 999,
      marginBottom: Spacing.lg,
    },
    trialBadgeText: {
      color: isDark ? colors.premiumHighlightText : colors.white,
      fontSize: Typography.fontSize.xxs,
      fontWeight: '800',
      letterSpacing: 1.2,
    },
    title: {
      color: colors.textPrimary,
      fontSize: 24,
      lineHeight: 30,
      fontWeight: '800',
      textAlign: 'center',
      marginBottom: Spacing.xs,
      paddingHorizontal: Spacing.sm,
    },
    subtitle: {
      color: colors.textSecondary,
      fontSize: Typography.fontSize.xs,
      lineHeight: 18,
      textAlign: 'center',
    },

    /* ── Timeline ────────────────────────────────────────── */
    timeline: {
      marginTop: Spacing.xs,
    },

    /* ── Benefits carousel ───────────────────────────────── */
    benefitsCarousel: {
      overflow: 'visible',
    },
    benefitSlide: {
      paddingRight: Spacing.md,
    },
    benefitCard: {
      flex: 1,
      backgroundColor: colors.blockBackground,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.blockBorder,
      padding: Spacing.md,
      minHeight: 88,
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    benefitIconContainer: {
      marginRight: Spacing.md,
      marginTop: 2,
    },
    benefitTextContainer: {
      flex: 1,
    },
    benefitTitle: {
      color: colors.textPrimary,
      fontSize: Typography.fontSize.sm,
      fontWeight: '700',
      marginBottom: 2,
    },
    benefitBody: {
      color: colors.textSecondary,
      fontSize: Typography.fontSize.xs,
      lineHeight: 17,
    },
    dotsContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: Spacing.sm,
      gap: 6,
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.blockBorder,
    },
    dotActive: {
      width: 18,
      backgroundColor: isDark ? colors.premiumHighlight : colors.primary,
    },

    /* ── Footer ──────────────────────────────────────────── */
    footer: {
      paddingHorizontal: Spacing.xl,
      paddingTop: Spacing.md,
      paddingBottom: Spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.blockBorder,
      backgroundColor: 'transparent',
    },
    ctaButton: {
      backgroundColor: isDark ? colors.premiumHighlight : colors.primary,
      borderRadius: 14,
      minHeight: 50,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    },
    ctaButtonDisabled: {
      opacity: 0.7,
    },
    ctaText: {
      color: isDark ? colors.premiumHighlightText : colors.white,
      fontSize: 15,
      fontWeight: '800',
      letterSpacing: 0.3,
      textAlign: 'center',
    },
    proceedLimitedButton: {
      marginTop: Spacing.sm,
      borderWidth: 1,
      borderColor: colors.blockBorder,
      borderRadius: 12,
      minHeight: 44,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
      paddingHorizontal: Spacing.md,
    },
    proceedLimitedText: {
      color: colors.textSecondary,
      fontSize: Typography.fontSize.xs,
      fontWeight: '600',
      textAlign: 'center',
    },
  });
