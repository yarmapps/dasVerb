import { StyleSheet } from 'react-native';
import { ThemeColors } from '../../styles/themeColors';
import { Spacing } from '../../styles/spacing';
import { Typography } from '../../styles/typography';

export const createStyles = (colors: ThemeColors, isDark: boolean) =>
  StyleSheet.create({
    optionsContainer: {
      width: '100%',
      marginTop: Spacing.xs,
      marginBottom: Spacing.sm,
    },
    optionItem: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.background,
      borderWidth: 1.5,
      borderColor: colors.blockBorder,
      borderRadius: 16,
      paddingVertical: 14,
      paddingHorizontal: 16,
      marginBottom: 10,
    },
    optionItemActive: {
      borderColor: colors.primary,
      backgroundColor: isDark ? `${colors.primary}1A` : `${colors.primary}0D`,
    },
    optionLeft: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: Spacing.sm,
    },
    optionIconContainer: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.headerButtonBackground,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    optionIconContainerActive: {
      backgroundColor: `${colors.primary}20`,
    },
    optionTextContainer: {
      flex: 1,
    },
    optionTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    optionTitle: {
      fontSize: Typography.fontSize.sm,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    optionSubtitle: {
      fontSize: Typography.fontSize.xs,
      color: colors.textSecondary,
      marginTop: 2,
      lineHeight: 16,
    },
    diamondBadge: {
      marginLeft: 6,
    },
    radioContainer: {
      marginLeft: Spacing.xs,
    },
    radioUnchecked: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: colors.textMuted,
      opacity: 0.6,
    },
  });
