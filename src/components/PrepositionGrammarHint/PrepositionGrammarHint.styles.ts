import { StyleSheet } from 'react-native';
import { ThemeColors } from '../../styles/themeColors';
import { Spacing } from '../../styles/spacing';

export function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      marginHorizontal: Spacing.xl,
      marginTop: Spacing.md,
      padding: Spacing.xl,
      borderRadius: 18,
      backgroundColor: colors.blockBackground,
      borderWidth: 1,
      borderColor: colors.blockBorder,
    },
    embeddedContainer: {
      marginTop: Spacing.lg,
      paddingTop: Spacing.lg,
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
    prepBadge: {
      paddingHorizontal: Spacing.sm,
      paddingVertical: 3,
      borderRadius: 6,
      backgroundColor: `${colors.primary}18`,
      borderWidth: 1,
      borderColor: `${colors.primary}40`,
    },
    prepBadgeText: {
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
    ruleRow: {
      marginTop: Spacing.xs,
    },
    ruleMainText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textPrimary,
      lineHeight: 20,
    },
    questionsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 4,
      gap: 6,
    },
    questionLabel: {
      fontSize: 12,
      fontWeight: '500',
      color: colors.textMuted,
    },
    questionsText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textSecondary,
    },
  });
}
