import React, { useEffect, useMemo } from 'react';
import { View, Animated, Easing, StyleSheet } from 'react-native';
import { Svg, Circle } from 'react-native-svg';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../context/ThemeContext';
import { VerbProgressStatus } from '../../services/progressService';
import { createStyles } from './AnimatedRewardCircle.styles';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export interface AnimatedRewardCircleProps {
  status: VerbProgressStatus;
  size?: number;
  delay?: number;
}

export function AnimatedRewardCircle({
  status,
  size = 96,
  delay = 350,
}: AnimatedRewardCircleProps): React.JSX.Element {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const isAnimated = status !== 'uncompleted';
  const animVal = useMemo(() => new Animated.Value(isAnimated ? 0 : 1), [isAnimated]);

  useEffect(() => {
    if (isAnimated) {
      animVal.setValue(0);
      Animated.timing(animVal, {
        toValue: 1,
        duration: 900,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    }
  }, [animVal, isAnimated, delay]);

  const strokeWidth = 3;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  const strokeDashoffset = animVal.interpolate({
    inputRange: [0, 0.85, 1],
    outputRange: [circumference, 0, 0],
  });

  const iconScale = animVal.interpolate({
    inputRange: [0, 0.55, 0.85, 1],
    outputRange: [0.3, 0.75, 1.12, 1],
  });

  const iconOpacity = animVal.interpolate({
    inputRange: [0, 0.35],
    outputRange: [0, 1],
  });

  // Задний фон и ореол свечения плавно проявляются (fade-in) в самом конце анимации
  const bgOpacity = animVal.interpolate({
    inputRange: [0, 0.7, 1],
    outputRange: [0, 0, 1],
  });

  const themeConfig = useMemo(() => {
    switch (status) {
      case 'trophy':
        return {
          strokeColor: '#FFD700',
          fillColor: '#FFD70020',
          glowStyle: styles.glowTrophy,
          icon: <FontAwesome5 name="trophy" size={44} color="#FFD700" />,
        };
      case 'silver':
        return {
          strokeColor: '#94A3B8',
          fillColor: '#94A3B818',
          glowStyle: styles.glowSilver,
          icon: <FontAwesome5 name="medal" size={44} color="#94A3B8" />,
        };
      case 'bronze':
        return {
          strokeColor: '#CD7F32',
          fillColor: '#CD7F3218',
          glowStyle: styles.glowBronze,
          icon: <FontAwesome5 name="medal" size={44} color="#CD7F32" />,
        };
      case 'uncompleted':
      default:
        return {
          strokeColor: `${colors.textMuted}35`,
          fillColor: `${colors.textMuted}15`,
          glowStyle: styles.glowUncompleted,
          icon: <Ionicons name="ribbon-outline" size={48} color={colors.textMuted} />,
        };
    }
  }, [status, colors, styles]);

  return (
    <View style={[styles.container, { width: size, height: size }]} testID="animated-reward-circle">
      {/* Radiant Glow Shadow fading in at the end */}
      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          themeConfig.glowStyle,
          isAnimated && { opacity: bgOpacity },
        ]}
      />

      {/* SVG Circle with clockwise border draw animation */}
      <Svg
        width={size}
        height={size}
        style={[styles.svgContainer, { transform: [{ rotate: '-90deg' }] }]}
      >
        {/* Background Fill Circle (fades in at the very end) */}
        {isAnimated ? (
          <AnimatedCircle
            cx={center}
            cy={center}
            r={radius}
            fill={themeConfig.fillColor}
            opacity={bgOpacity}
            stroke="transparent"
          />
        ) : (
          <Circle
            cx={center}
            cy={center}
            r={radius}
            fill={themeConfig.fillColor}
            stroke="transparent"
          />
        )}

        {/* Animated Clockwise Stroke */}
        {isAnimated ? (
          <AnimatedCircle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={themeConfig.strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        ) : (
          <Circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={themeConfig.strokeColor}
            strokeWidth={strokeWidth}
          />
        )}
      </Svg>

      {/* Central Icon popping in */}
      <Animated.View
        style={[
          styles.iconCenter,
          { width: size, height: size },
          isAnimated && {
            transform: [{ scale: iconScale }],
            opacity: iconOpacity,
          },
        ]}
      >
        {themeConfig.icon}
      </Animated.View>
    </View>
  );
}
