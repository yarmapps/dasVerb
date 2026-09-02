import React, { useEffect, useState, useMemo } from 'react';
import { Animated, View } from 'react-native';
import { Svg, Path, Circle } from 'react-native-svg';
import { createStyles } from './AnimatedCheckmark.styles';

const AnimatedPath = Animated.createAnimatedComponent(Path);

export interface AnimatedCheckmarkProps {
  size?: number;
  color?: string;
  duration?: number;
}

export function AnimatedCheckmark(props: AnimatedCheckmarkProps): React.JSX.Element {
  const { size = 96, color = '#10B981', duration = 600 } = props;
  const styles = useMemo(() => createStyles(), []);

  const [animatedValue] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration,
      useNativeDriver: true,
    }).start();
  }, [animatedValue, duration]);

  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [60, 0],
  });

  const scale = animatedValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 1.1, 1],
  });

  const opacity = animatedValue.interpolate({
    inputRange: [0, 0.3],
    outputRange: [0, 1],
  });

  return (
    <View style={[styles.container, { width: size, height: size }]} testID="animated-checkmark">
      <Animated.View style={{ transform: [{ scale }], opacity }}>
        <Svg width={size} height={size} viewBox="0 0 80 80">
          <Circle cx="40" cy="40" r="38" fill={`${color}15`} stroke={color} strokeWidth="3" />
          <AnimatedPath
            d="M23 41 L35 53 L58 30"
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="60"
            strokeDashoffset={strokeDashoffset}
          />
        </Svg>
      </Animated.View>
    </View>
  );
}
