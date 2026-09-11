import { StyleSheet } from 'react-native';
import { ThemeColors } from '../../styles/themeColors';
import { Spacing } from '../../styles/spacing';
import { Typography } from '../../styles/typography';

export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      marginHorizontal: Spacing.xl,
      marginTop: Spacing.md,
      backgroundColor: colors.blockBackground,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.blockBorder,
      padding: Spacing.md,
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
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: Spacing.sm,
    },
    title: {
      fontSize: Typography.fontSize.xs,
      fontWeight: '700',
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
    table: {
      gap: 4,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 6,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.blockBorder,
    },
    rowLast: {
      borderBottomWidth: 0,
      paddingBottom: 2,
    },
    tenseTag: {
      width: 88,
    },
    tenseTagText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textMuted,
    },
    formContent: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    pronounText: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.textMuted,
    },
    formText: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.textPrimary,
    },
  });
