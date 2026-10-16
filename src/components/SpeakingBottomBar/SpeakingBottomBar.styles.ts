import { StyleSheet } from 'react-native';
import { ThemeColors } from '../../styles/themeColors';
import { Spacing, BorderRadius } from '../../styles/spacing';
import { Typography } from '../../styles/typography';

export const createStyles = (colors: ThemeColors, isDark: boolean) =>
  StyleSheet.create({
    container: {
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: Spacing.xs,
      paddingBottom: Spacing.sm,
    },
    hintPill: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.headerButtonBackground,
      borderWidth: 1,
      borderColor: colors.blockBorder,
      borderRadius: BorderRadius.full,
      paddingVertical: 7,
      paddingHorizontal: 16,
      marginBottom: Spacing.sm,
      maxWidth: '92%',
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
      elevation: 2,
    },
    hintPillRecording: {
      backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.08)',
      borderColor: 'rgba(239, 68, 68, 0.4)',
    },
    hintPillError: {
      backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.08)',
      borderColor: 'rgba(239, 68, 68, 0.3)',
    },
    hintIconContainer: {
      marginRight: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
    hintText: {
      fontSize: Typography.fontSize.xs,
      fontWeight: '600',
      color: colors.textSecondary,
      textAlign: 'center',
    },
    hintTextRecording: {
      color: '#EF4444',
      fontWeight: '700',
    },
    hintTextError: {
      color: '#EF4444',
      fontWeight: '600',
    },
    recordingDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#EF4444',
    },
    micButtonWrapper: {
      width: 130,
      height: 130,
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
    },
    rippleRing: {
      position: 'absolute',
      width: 74,
      height: 74,
      borderRadius: 37,
      backgroundColor: '#EF4444',
    },
    micButton: {
      width: 74,
      height: 74,
      borderRadius: 37,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.35,
      shadowRadius: 12,
      elevation: 8,
    },
    micButtonRecording: {
      backgroundColor: '#EF4444',
      shadowColor: '#EF4444',
      shadowOpacity: 0.5,
      shadowRadius: 16,
    },
    micButtonEvaluating: {
      backgroundColor: colors.primary,
      opacity: 0.85,
    },
    permissionActionBtn: {
      marginTop: Spacing.xs,
      paddingVertical: 4,
      paddingHorizontal: 12,
      borderRadius: BorderRadius.full,
      backgroundColor: colors.primary,
    },
    permissionActionText: {
      color: '#FFFFFF',
      fontSize: Typography.fontSize.xs,
      fontWeight: '700',
    },
  });
