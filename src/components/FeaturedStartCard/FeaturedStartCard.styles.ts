import { StyleSheet } from 'react-native';
import { ThemeColors } from '../../styles/themeColors';
import { Spacing } from '../../styles/spacing';
import { Typography } from '../../styles/typography';

export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    featuredCard: {
      minHeight: 130,
      borderRadius: 18,
      padding: Spacing.xl,
      justifyContent: 'center',
      overflow: 'hidden',
      position: 'relative',
      borderWidth: 1,
      borderColor: colors.blockBorder,
    },
    featuredBackground: {
      ...StyleSheet.absoluteFillObject,
    },
    featuredBadge: {
      backgroundColor: 'rgba(255, 255, 255, 0.22)',
      paddingHorizontal: Spacing.sm,
      paddingVertical: 3,
      borderRadius: 6,
      alignSelf: 'flex-start',
      marginBottom: Spacing.xs,
    },
    featuredBadgeText: {
      color: '#FFFFFF',
      fontSize: 10,
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
    featuredTitle: {
      fontSize: Typography.fontSize.lg,
      fontWeight: '800',
      color: '#FFFFFF',
      width: '80%',
      marginBottom: 2,
      lineHeight: 24,
    },
    featuredSubtitle: {
      fontSize: Typography.fontSize.xs,
      color: 'rgba(255, 255, 255, 0.92)',
      width: '80%',
      marginBottom: Spacing.md,
      lineHeight: 16,
    },
    startButton: {
      backgroundColor: '#FFFFFF',
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 7,
      paddingHorizontal: Spacing.md,
      borderRadius: 20,
      alignSelf: 'flex-start',
    },
    startButtonText: {
      color: colors.primary,
      fontWeight: '700',
      fontSize: 12,
      marginLeft: Spacing.xs,
    },
    decorativeIconContainer: {
      position: 'absolute',
      right: -10,
      bottom: -15,
      opacity: 0.12,
    },
  });
