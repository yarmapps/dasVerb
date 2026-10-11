import { StyleSheet } from 'react-native';

export const createStyles = () =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    outerRing: {
      position: 'absolute',
      backgroundColor: 'transparent',
    },
    innerCircleWrapper: {
      overflow: 'hidden',
      alignItems: 'center',
      justifyContent: 'center',
    },
    innerBackground: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    fillLayer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
    },
    shineLayer: {
      position: 'absolute',
      top: 2,
      left: 2,
      borderRadius: 100,
    },
    topShineLayer: {
      position: 'absolute',
      top: 0,
      left: '15%',
      right: '15%',
      height: '30%',
      borderRadius: 100,
    },
    contentLayer: {
      zIndex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
