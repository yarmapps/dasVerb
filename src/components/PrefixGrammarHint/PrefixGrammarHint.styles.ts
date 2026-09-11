import { StyleSheet } from 'react-native';
import { ThemeColors } from '../../styles/themeColors';
import { Spacing } from '../../styles/spacing';

export function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      marginHorizontal: Spacing.xl,
      marginTop: Spacing.md,
      padding: Spacing.md,
      borderRadius: 14,
      backgroundColor: colors.blockBackground,
      borderWidth: 1,
      borderColor: colors.blockBorder,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 6,
      elevation: 2,
    },
    embeddedContainer: {
      marginTop: Spacing.md,
      paddingTop: Spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.blockBorder,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: Spacing.xs,
    },
    prefixInfoLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xs,
    },
    prefixBadge: {
      paddingHorizontal: Spacing.sm,
      paddingVertical: 3,
      borderRadius: 6,
      backgroundColor: `${colors.primary}18`,
      borderWidth: 1,
      borderColor: `${colors.primary}40`,
    },
    prefixBadgeText: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.primary,
    },
    typeTag: {
      paddingHorizontal: Spacing.sm,
      paddingVertical: 3,
      borderRadius: 6,
      backgroundColor: `${colors.textSecondary}15`,
    },
    typeTagText: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    explanationText: {
      fontSize: 13,
      lineHeight: 18,
      color: colors.textPrimary,
      marginTop: Spacing.xs,
    },
  });
}
