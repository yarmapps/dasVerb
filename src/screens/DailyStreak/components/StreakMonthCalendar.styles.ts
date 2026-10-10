import { StyleSheet } from 'react-native';
import { ThemeColors } from '../../../styles/themeColors';
import { Spacing } from '../../../styles/spacing';

export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.blockBackground,
      borderColor: colors.blockBorder,
      borderWidth: 1,
      borderRadius: 16,
      padding: Spacing.md,
      marginBottom: Spacing.md,
      width: '100%',
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: Spacing.md,
      paddingHorizontal: Spacing.xs,
    },
    monthTitleText: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.textPrimary,
      textAlign: 'center',
    },
    navArrowButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.headerButtonBackground,
      alignItems: 'center',
      justifyContent: 'center',
    },
    navArrowDisabled: {
      opacity: 0.35,
    },
    weekHeaderRow: {
      flexDirection: 'row',
      width: '100%',
      marginBottom: Spacing.xs,
      paddingBottom: Spacing.xs,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.blockBorder,
    },
    weekDayColumn: {
      width: '14.2857%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    weekDayText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textMuted,
      textAlign: 'center',
    },
    daysGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      width: '100%',
    },
    cellWrapper: {
      width: '14.2857%',
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: 4,
    },
    dayCircle: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyCell: {
      width: '14.2857%',
      height: 34,
      marginVertical: 4,
    },
    todayRing: {
      borderWidth: 2,
      borderColor: colors.secondary,
    },
    dayText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textPrimary,
    },
    mutedDayText: {
      color: colors.textMuted,
      opacity: 0.35,
    },
  });
