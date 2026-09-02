import React, { useEffect, useMemo } from 'react';
import { TouchableOpacity, Text, ViewStyle, Animated, View } from 'react-native';
import { useStreak } from '../../hooks/useStreak';
import { useAppTheme } from '../../context/ThemeContext';
import { soundService } from '../../services/soundService';
import { FireIcon } from '../FireIcon/FireIcon';
import { createStyles } from './StreakBadge.styles';

export interface StreakBadgeProps {
  style?: ViewStyle;
  onPress?: () => void;
  animate?: boolean; // Set to true to trigger flame pulse & flicker loop animation
}

export function StreakBadge({
  style,
  onPress,
  animate = false,
}: StreakBadgeProps): React.JSX.Element {
  const { currentStreak, isActiveToday } = useStreak();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const flameScale = useMemo(() => new Animated.Value(1), []);
  const flameRotate = useMemo(() => new Animated.Value(0), []);

  useEffect(() => {
    let loopAnimation: Animated.CompositeAnimation | null = null;

    if (animate) {
      loopAnimation = Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(flameScale, {
              toValue: 1.55,
              duration: 350,
              useNativeDriver: true,
            }),
            Animated.timing(flameRotate, {
              toValue: 1,
              duration: 350,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(flameScale, {
              toValue: 0.9,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(flameRotate, {
              toValue: -1,
              duration: 300,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(flameScale, {
              toValue: 1.35,
              duration: 320,
              useNativeDriver: true,
            }),
            Animated.timing(flameRotate, {
              toValue: 0.5,
              duration: 320,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(flameScale, {
              toValue: 1.0,
              duration: 380,
              useNativeDriver: true,
            }),
            Animated.timing(flameRotate, {
              toValue: 0,
              duration: 380,
              useNativeDriver: true,
            }),
          ]),
        ]),
      );
      loopAnimation.start();
    } else {
      flameScale.setValue(1);
      flameRotate.setValue(0);
    }

    return () => {
      if (loopAnimation) {
        loopAnimation.stop();
      }
    };
  }, [animate, flameScale, flameRotate]);

  const handlePress = () => {
    soundService.playTapSound();
    if (onPress) {
      onPress();
    }
  };

  const isFireActive = isActiveToday || currentStreak > 0;

  const spinRotation = useMemo(
    () =>
      flameRotate.interpolate({
        inputRange: [-1, 0, 1],
        outputRange: ['-12deg', '0deg', '12deg'],
      }),
    [flameRotate],
  );

  return (
    <TouchableOpacity
      style={[styles.badgeContainer, style]}
      onPress={handlePress}
      activeOpacity={0.7}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      testID="streak-badge"
    >
      <View style={styles.innerRow}>
        <Animated.View
          style={{
            transform: [{ scale: flameScale }, { rotate: spinRotation }],
          }}
        >
          <FireIcon size={18} isActive={isFireActive} inactiveColor={colors.textMuted} />
        </Animated.View>
        <Text style={styles.streakText} testID="streak-count-text">
          {currentStreak}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
