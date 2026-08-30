import { StyleSheet } from 'react-native';
import { ThemeColors } from '../../styles/themeColors';
import { Spacing } from '../../styles/spacing';
import { Typography } from '../../styles/typography';

export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      marginTop: Spacing.md,
      paddingTop: Spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.blockBorder,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: Spacing.sm,
      marginBottom: Spacing.xs,
    },
    sectionTitle: {
      fontSize: Typography.fontSize.xs,
      fontWeight: '700',
      color: colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
    tableContainer: {
      backgroundColor: colors.blockBackground,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.blockBorder,
      overflow: 'hidden',
      marginBottom: Spacing.md,
    },
    tableRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: Spacing.sm,
      paddingHorizontal: Spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.blockBorder,
    },
    tableHeaderRow: {
      backgroundColor: `${colors.primary}12`,
      borderBottomWidth: 1,
      borderBottomColor: colors.blockBorder,
    },
    tableRowLast: {
      borderBottomWidth: 0,
    },
    tableHeaderColPerson: {
      width: '30%',
    },
    tableHeaderColTense: {
      width: '35%',
    },
    tableHeaderText: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.textPrimary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    tableColPerson: {
      width: '30%',
    },
    tablePersonText: {
      fontSize: Typography.fontSize.xs,
      fontWeight: '600',
      color: colors.textMutedInverted,
    },
    tableColTense: {
      width: '35%',
    },
    tableTenseText: {
      fontSize: Typography.fontSize.xs,
      fontWeight: '600',
      color: colors.textPrimary,
    },
    imperativeLabelCol: {
      width: '45%',
      justifyContent: 'center',
    },
    imperativeLabelText: {
      fontSize: Typography.fontSize.xs,
      color: colors.textMutedInverted,
      fontWeight: '500',
    },
    imperativeValueCol: {
      flex: 1,
      justifyContent: 'center',
    },
    imperativeValueText: {
      fontSize: Typography.fontSize.sm,
      fontWeight: '600',
      color: colors.textPrimary,
    },
    sentencesList: {
      marginTop: 2,
    },
    sentenceCard: {
      marginBottom: Spacing.sm,
      padding: Spacing.md,
      backgroundColor: colors.blockBackground,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.blockBorder,
      borderLeftWidth: 3,
      borderLeftColor: colors.primary,
    },
    germanSentence: {
      fontSize: Typography.fontSize.sm,
      color: colors.textPrimary,
      fontWeight: '500',
      marginBottom: 3,
      lineHeight: 20,
    },
    verbHighlight: {
      fontWeight: '700',
      color: colors.textPrimary,
    },
    dativHighlight: {
      fontWeight: '700',
      color: colors.secondary,
    },
    akkusativHighlight: {
      fontWeight: '700',
      color: colors.primary,
    },
    bracketHighlight: {
      color: colors.primary,
      fontWeight: '700',
    },
    translationSentence: {
      fontSize: Typography.fontSize.xs,
      color: colors.textSecondary,
      lineHeight: 16,
    },
  });
