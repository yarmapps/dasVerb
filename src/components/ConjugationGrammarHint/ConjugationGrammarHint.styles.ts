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
    infoLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xs,
    },
    vowelBadge: {
      paddingHorizontal: Spacing.sm,
      paddingVertical: 3,
      borderRadius: 6,
      backgroundColor: `${colors.primary}18`,
      borderWidth: 1,
      borderColor: `${colors.primary}40`,
    },
    vowelBadgeText: {
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
      lineHeight: 19,
      color: colors.textSecondary,
      marginTop: Spacing.xs,
    },
  });
}
