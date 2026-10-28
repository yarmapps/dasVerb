import { StyleSheet, Dimensions } from 'react-native';
import { ThemeColors } from '../../styles/themeColors';
import { Spacing } from '../../styles/spacing';
import { Typography } from '../../styles/typography';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MIN_COMFORTABLE_SHEET_HEIGHT = 750;
export const IS_FULL_SCREEN_SHEET = SCREEN_HEIGHT * 0.9 < MIN_COMFORTABLE_SHEET_HEIGHT;

export const SELECTED_GRADIENT_COLORS = [
  'rgba(250, 204, 21, 0.18)',
  'rgba(250, 204, 21, 0.06)',
  'rgba(250, 204, 21, 0.02)',
] as const;

export const createStyles = (
  colors: ThemeColors,
  insets: { top: number; bottom: number } = { top: 0, bottom: 0 },
) => {
  const topOffset = IS_FULL_SCREEN_SHEET && insets.top > 0 ? insets.top + Spacing.sm : Spacing.lg;

  return StyleSheet.create({
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
      height: IS_FULL_SCREEN_SHEET ? SCREEN_HEIGHT : SCREEN_HEIGHT * 0.9,
      borderTopLeftRadius: IS_FULL_SCREEN_SHEET ? 0 : 28,
      borderTopRightRadius: IS_FULL_SCREEN_SHEET ? 0 : 28,
      overflow: 'hidden',
    },
    gradient: {
      flex: 1,
      justifyContent: 'space-between',
      borderTopLeftRadius: IS_FULL_SCREEN_SHEET ? 0 : 28,
      borderTopRightRadius: IS_FULL_SCREEN_SHEET ? 0 : 28,
      paddingTop: topOffset,
      paddingBottom: insets.bottom > 0 ? Math.max(insets.bottom, 8) : Spacing.sm,
    },
    contentContainer: {
      flexGrow: 1,
      justifyContent: 'space-evenly',
      gap: Spacing.md,
      paddingTop: Spacing.lg,
      paddingBottom: Spacing.sm,
    },
    headerSection: {
      alignItems: 'center',
      paddingHorizontal: Spacing.md,
    },
    featuresSection: {
      width: '100%',
    },
    bottomDock: {
      paddingTop: Spacing.xs,
    },

    /* ── Close button ────────────────────────────────────── */
    closeButton: {
      position: 'absolute',
      right: Spacing.lg,
      top: topOffset,
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.10)',
      zIndex: 10,
    },
    restoreButton: {
      fontWeight: '600',
      position: 'absolute',
      left: Spacing.lg,
      top: topOffset + 8,
      justifyContent: 'center',
      zIndex: 10,
    },
    restoreButtonText: {
      color: 'rgba(255, 255, 255, 0.40)',
      fontSize: Typography.fontSize.xxs,
      fontWeight: '600',
    },

    /* ── Diamond icon ────────────────────────────────────── */
    diamondContainer: {
      alignSelf: 'center',
      marginTop: Spacing.xs,
      marginBottom: Spacing.md + 2,
    },

    /* ── Title & subtitle ────────────────────────────────── */
    title: {
      color: colors.white,
      fontSize: 24,
      lineHeight: 30,
      fontWeight: '800',
      textAlign: 'center',
    },
    subtitle: {
      display: 'none',
    },

    /* ── Pricing cards (Vertical Stack) ──────────────────── */
    plansColumn: {
      flexDirection: 'column',
      paddingHorizontal: Spacing.md,
      gap: 12,
    },
    planCard: {
      width: '100%',
      backgroundColor: 'rgba(255, 255, 255, 0.06)',
      borderRadius: 16,
      borderWidth: 2,
      borderColor: 'rgba(255, 255, 255, 0.10)',
      paddingVertical: 11,
      paddingHorizontal: 16,
      position: 'relative',
    },
    planCardWithBadge: {
      paddingTop: 22,
      paddingBottom: 18,
      paddingHorizontal: 18,
      marginTop: 6,
    },
    planCardSelected: {
      borderColor: colors.premiumHighlight,
      borderWidth: 2,
      backgroundColor: 'transparent',
    },
    planCardGradient: {
      ...StyleSheet.absoluteFillObject,
      borderRadius: 14,
    },
    planCardRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    planCardRowBottom: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 3,
    },
    planCardRowBottomLarge: {
      marginTop: 6,
    },

    /* Plan badge */
    planBadge: {
      position: 'absolute',
      top: -11,
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
      letterSpacing: 0.2,
      textTransform: 'uppercase',
      textAlign: 'center',
    },
    planBadgeTextDark: {
      color: colors.premiumHighlightText,
    },
    planBadgeTextLight: {
      color: colors.white,
    },

    /* Plan label (e.g. "1 Year") */
    planLabel: {
      color: 'rgba(255, 255, 255, 0.85)',
      fontSize: Typography.fontSize.md,
      fontWeight: '700',
    },
    planLabelLarge: {
      fontSize: Typography.fontSize.lg,
      fontWeight: '800',
    },
    planLabelSelected: {
      color: colors.white,
    },

    /* Plan subtitle (second row left) */
    planSubtitle: {
      color: 'rgba(255, 255, 255, 0.50)',
      fontSize: Typography.fontSize.xs,
      fontWeight: '500',
    },
    planSubtitleLarge: {
      fontSize: Typography.fontSize.sm,
    },
    planSubtitleSelected: {
      color: 'rgba(255, 255, 255, 0.70)',
    },

    /* Plan monthly price (first row right) */
    planPriceRight: {
      color: 'rgba(255, 255, 255, 0.85)',
      fontSize: Typography.fontSize.md,
      fontWeight: '800',
      textAlign: 'right',
    },
    planPriceLarge: {
      fontSize: Typography.fontSize.lg,
    },
    planPriceRightSelected: {
      color: colors.white,
    },
    planPriceHighlighted: {
      color: colors.premiumHighlight,
    },
    planPriceSmall: {
      fontSize: Typography.fontSize.sm,
    },

    /* Discount badge (second row right) */
    discountBadge: {
      backgroundColor: 'rgba(34, 197, 94, 0.22)',
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 2,
    },
    discountBadgeText: {
      color: '#4ADE80',
      fontSize: 10,
      fontWeight: '800',
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
      minHeight: 54,
      paddingVertical: 8,
      paddingHorizontal: Spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      marginHorizontal: Spacing.md,
      marginBottom: 4,
    },
    ctaButtonTwoLine: {
      flexDirection: 'column',
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
    ctaSubtext: {
      color: colors.premiumHighlightText,
      fontSize: 11,
      fontWeight: '600',
      opacity: 0.85,
      textAlign: 'center',
      marginTop: 2,
    },
    ctaArrow: {
      position: 'absolute',
      right: 24,
      color: colors.premiumHighlightText,
    },

    /* ── Disclaimer ──────────────────────────────────────── */
    disclaimer: {
      color: 'rgba(255, 255, 255, 0.35)',
      fontSize: 11,
      lineHeight: 15,
      textAlign: 'center',
      minHeight: 15,
      marginHorizontal: Spacing.md,
      marginBottom: 14,
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
};
