import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, Animated, Easing } from 'react-native';
import { useAppTheme } from '../../context/ThemeContext';
import { createStyles } from './LeaderboardPointsTooltip.styles';

export interface LeaderboardPointsTooltipProps {
  points: number;
}

export function LeaderboardPointsTooltip({
  points,
}: LeaderboardPointsTooltipProps): React.JSX.Element | null {
  const { isDark } = useAppTheme();
  const styles = useMemo(() => createStyles(), []);

  const [scaleAnim] = useState(() => new Animated.Value(0.3));
  const [fadeAnim] = useState(() => new Animated.Value(0));
  const [translateYAnim] = useState(() => new Animated.Value(-12));
  const [floatAnim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    let floatAnimation: Animated.CompositeAnimation | null = null;

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
        Animated.spring(translateYAnim, {
          toValue: 0,
          friction: 6,
          tension: 70,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          tension: 80,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Start subtle idle floating motion
        floatAnimation = Animated.loop(
          Animated.sequence([
            Animated.timing(floatAnim, {
              toValue: -2,
              duration: 1200,
              useNativeDriver: true,
              easing: Easing.inOut(Easing.quad),
            }),
            Animated.timing(floatAnim, {
              toValue: 0,
              duration: 1200,
              useNativeDriver: true,
              easing: Easing.inOut(Easing.quad),
            }),
          ]),
        );
        floatAnimation.start();
      });
    }, 450);

    return () => {
      clearTimeout(timer);
      if (floatAnimation) {
        floatAnimation.stop();
      }
    };
  }, [fadeAnim, floatAnim, scaleAnim, translateYAnim]);

  if (points <= 0) return null;

  const bg = isDark ? '#D97706' : '#FFD700';
  const textColor = isDark ? '#FFFFFF' : '#78350F';

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [
            { translateY: Animated.add(translateYAnim, floatAnim) },
            { scale: scaleAnim },
          ],
        },
      ]}
      pointerEvents="none"
    >
      {/* Upward pointing arrow */}
      <View style={[styles.arrow, { borderBottomColor: bg }]} />

      {/* Main Tooltip Body */}
      <View style={[styles.bubble, { backgroundColor: bg }]}>
        <Text style={[styles.text, { color: textColor }]}>+{points} pts</Text>
      </View>
    </Animated.View>
  );
}
