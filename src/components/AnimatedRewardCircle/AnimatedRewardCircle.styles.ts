import { StyleSheet } from 'react-native';
import { ThemeColors } from '../../styles/themeColors';

export const createStyles = (_colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
    },
    svgContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
    },
    iconCenter: {
      position: 'absolute',
      alignItems: 'center',
      justifyContent: 'center',
    },
    glowTrophy: {
      shadowColor: '#FFD700',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.5,
      shadowRadius: 18,
      elevation: 8,
    },
    glowSilver: {
      shadowColor: '#94A3B8',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 14,
      elevation: 6,
    },
    glowBronze: {
      shadowColor: '#CD7F32',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 14,
      elevation: 6,
    },
    glowUncompleted: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
      elevation: 2,
    },
  });
