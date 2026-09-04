import { StyleSheet, Dimensions } from 'react-native';
import { ThemeColors } from '../../styles/themeColors';
import { Spacing } from '../../styles/spacing';
import { Typography } from '../../styles/typography';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const BLOCK_SPACING = SCREEN_HEIGHT * 0.035;

export const SELECTED_GRADIENT_COLORS = [
  'rgba(250, 204, 21, 0.18)',
  'rgba(250, 204, 21, 0.06)',
  'rgba(250, 204, 21, 0.02)',
] as const;

export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    /* ── Shell ────────────────────────────────────────────── */
    overlay: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(10, 8, 20, 0.78)',
    },
    backdropTouch: {
      flex: 1,
    },
    sheet: {
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      overflow: 'hidden',
    },
    gradient: {
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      paddingTop: Spacing.md,
      paddingBottom: Spacing.xxl,
    },
    contentContainer: {},

    /* ── Close & Restore buttons ─────────────────────────── */
    closeButton: {
      position: 'absolute',
      right: Spacing.lg,
      top: Spacing.lg,
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.16)',
      zIndex: 10,
    },
    restoreButton: {
      position: 'absolute',
      left: Spacing.lg,
      top: Spacing.xl,
      justifyContent: 'center',
      zIndex: 10,
    },
    restoreButtonText: {
      color: 'rgba(255, 255, 255, 0.45)',
      fontSize: Typography.fontSize.xxs,
      fontWeight: '600',
    },

    /* ── Diamond icon ────────────────────────────────────── */
    diamondContainer: {
      alignSelf: 'center',
      marginTop: Spacing.xl,
      marginBottom: Spacing.md,
    },

    /* ── Title & subtitle ────────────────────────────────── */
    title: {
      color: colors.white,
      fontSize: 26,
      lineHeight: 32,
      fontWeight: '800',
      textAlign: 'center',
      marginBottom: BLOCK_SPACING,
    },
    subtitle: {
      color: 'rgba(255, 255, 255, 0.70)',
      fontSize: Typography.fontSize.sm,
      textAlign: 'center',
      marginTop: -Spacing.sm,
      marginBottom: BLOCK_SPACING,
      paddingHorizontal: Spacing.lg,
    },

    /* ── Pricing cards ───────────────────────────────────── */
    plansRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: Spacing.md,
      gap: 10,
      marginBottom: BLOCK_SPACING,
    },
    planCard: {
      flex: 1,
      backgroundColor: 'rgba(255, 255, 255, 0.06)',
      borderRadius: 16,
      borderWidth: 2,
      borderColor: 'rgba(255, 255, 255, 0.10)',
      paddingVertical: 20,
      paddingHorizontal: 8,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 120,
      position: 'relative',
    },
    planCardSelected: {
      borderColor: colors.premiumHighlight,
      borderWidth: 2,
      backgroundColor: 'transparent',
    },
    planCardFeatured: {
      minHeight: 150,
    },
    planCardGradient: {
      ...StyleSheet.absoluteFillObject,
      borderRadius: 14,
    },

    /* Plan badge */
    planBadge: {
      position: 'absolute',
      top: -12,
      alignSelf: 'center',
      paddingHorizontal: 10,
      paddingVertical: 3,
      borderRadius: 8,
    },
    planBadgeYellow: {
      backgroundColor: colors.premiumHighlight,
    },
    planBadgeSolid: {
      backgroundColor: 'rgba(139, 92, 246, 1)',
    },
    planBadgeText: {
      fontSize: 9,
      fontWeight: '800',
      letterSpacing: 0,
      textTransform: 'uppercase',
      textAlign: 'center',
    },
    planBadgeTextDark: {
      color: colors.premiumHighlightText,
    },
    planBadgeTextLight: {
      color: colors.white,
    },

    /* Plan label */
    planLabel: {
      color: 'rgba(255, 255, 255, 0.75)',
      fontSize: Typography.fontSize.sm,
      fontWeight: '600',
      marginBottom: 6,
    },
    planLabelSelected: {
      color: colors.white,
    },

    /* Plan price */
    planPrice: {
      color: colors.white,
      fontSize: 20,
      fontWeight: '800',
      marginBottom: 2,
      textAlign: 'center',
    },
    planPriceSelected: {
      color: colors.white,
    },
    planPriceSmall: {
      fontSize: Typography.fontSize.sm,
    },

    /* Per-period label */
    planPer: {
      color: 'rgba(255, 255, 255, 0.50)',
      fontSize: Typography.fontSize.xxs,
      fontWeight: '500',
      textAlign: 'center',
    },
    planPerSelected: {
      color: 'rgba(255, 255, 255, 0.70)',
      textAlign: 'center',
    },

    /* Trial badge */
    trialBadge: {
      marginTop: 6,
      backgroundColor: 'rgba(34, 197, 94, 0.20)',
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 2,
    },
    trialBadgeText: {
      color: 'rgba(34, 197, 94, 1)',
      fontSize: 9,
      fontWeight: '700',
      textAlign: 'center',
    },

    /* ── Features section ────────────────────────────────── */
    featuresSectionTitle: {
      color: 'rgba(255, 255, 255, 0.45)',
      fontSize: Typography.fontSize.xs,
      fontWeight: '700',
      letterSpacing: 1.4,
      textTransform: 'uppercase',
      textAlign: 'center',
      marginBottom: Spacing.md,
    },
    featuresMarqueeContainer: {
      overflow: 'hidden',
      width: '100%',
      marginBottom: BLOCK_SPACING,
    },
    featuresRow: {
      flexDirection: 'row',
      paddingLeft: Spacing.xl,
      paddingRight: Spacing.xl,
      gap: 8,
      paddingBottom: Spacing.sm,
      alignSelf: 'flex-start',
    },
    featureItem: {
      alignItems: 'center',
      width: 82,
    },
    featureIconWrap: {
      width: 42,
      height: 42,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
    },
    featureLabel: {
      color: 'rgba(255, 255, 255, 0.80)',
      fontSize: 11,
      fontWeight: '600',
      textAlign: 'center',
      lineHeight: 14,
    },

    /* ── CTA Button ──────────────────────────────────────── */
    ctaButton: {
      backgroundColor: colors.premiumHighlight,
      borderRadius: 16,
      minHeight: 48,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      marginHorizontal: Spacing.md,
      marginBottom: Spacing.sm,
    },
    ctaButtonDisabled: {
      opacity: 0.7,
    },
    ctaText: {
      color: colors.premiumHighlightText,
      fontSize: Typography.fontSize.md,
      fontWeight: '800',
      letterSpacing: 0.3,
      textAlign: 'center',
    },
    ctaArrow: {
      position: 'absolute',
      right: 24,
    },

    /* ── Disclaimer ──────────────────────────────────────── */
    disclaimer: {
      color: 'rgba(255, 255, 255, 0.35)',
      fontSize: 11,
      lineHeight: 15,
      textAlign: 'center',
      minHeight: 30,
      marginTop: Spacing.xs,
      marginHorizontal: Spacing.md,
      marginBottom: BLOCK_SPACING,
    },

    /* ── Footer links ────────────────────────────────────── */
    footerLinks: {
      alignItems: 'center',
    },
    footerRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    footerLinkText: {
      color: 'rgba(255, 255, 255, 0.40)',
      fontSize: 11,
      fontWeight: '500',
    },
    footerDot: {
      color: 'rgba(255, 255, 255, 0.25)',
      fontSize: 11,
      marginHorizontal: 6,
    },
  });
