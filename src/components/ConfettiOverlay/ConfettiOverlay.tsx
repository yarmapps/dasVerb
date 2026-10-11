import React, { useEffect, useMemo, useState } from 'react';
import { View, Animated, Dimensions, Easing } from 'react-native';
import { createStyles } from './ConfettiOverlay.styles';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const CONFETTI_COLORS = [
  '#FFD700', // Gold
  '#FF4081', // Pink/Magenta
  '#00E5FF', // Cyan
  '#7C4DFF', // Purple
  '#00E676', // Emerald Green
  '#FF9100', // Bright Orange
  '#FF1744', // Red
  '#EE82EE', // Violet
];

interface RainParticle {
  id: number;
  startX: number;
  startY: number;
  endY: number;
  sway: number;
  size: number;
  color: string;
  isCircle: boolean;
  duration: number;
  delay: number;
  rotation: number;
  anim: Animated.Value;
}

export interface ConfettiOverlayProps {
  count?: number;
  onAnimationEnd?: () => void;
}

function generateParticles(count: number): RainParticle[] {
  return Array.from({ length: count }).map((_, index) => {
    const startX = Math.random() * SCREEN_WIDTH;
    const startY = -20 - Math.random() * 300;
    const endY = SCREEN_HEIGHT + 60;
    const sway = (Math.random() - 0.5) * 140;

    const size = 7 + Math.random() * 9;
    const color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
    const isCircle = Math.random() > 0.5;
    const duration = 2800 + Math.random() * 1600;
    const delay = Math.random() * 1200;
    const rotation = (Math.random() > 0.5 ? 1 : -1) * (360 + Math.random() * 720);

    return {
      id: index,
      startX,
      startY,
      endY,
      sway,
      size,
      color,
      isCircle,
      duration,
      delay,
      rotation,
      anim: new Animated.Value(0),
    };
  });
}

export function ConfettiOverlay({
  count = 150,
  onAnimationEnd,
}: ConfettiOverlayProps): React.JSX.Element {
  const styles = useMemo(() => createStyles(), []);
  const [particles] = useState(() => generateParticles(count));

  useEffect(() => {
    const animations = particles.map(p =>
      Animated.sequence([
        Animated.delay(p.delay),
        Animated.timing(p.anim, {
          toValue: 1,
          duration: p.duration,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );

    Animated.parallel(animations).start(() => {
      onAnimationEnd?.();
    });
  }, [particles, onAnimationEnd]);

  return (
    <View style={styles.container} pointerEvents="none">
      {particles.map(p => {
        const translateY = p.anim.interpolate({
          inputRange: [0, 1],
          outputRange: [p.startY, p.endY],
        });

        const translateX = p.anim.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0, p.sway, p.sway * 0.5],
        });

        const rotate = p.anim.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', `${p.rotation}deg`],
        });

        const opacity = p.anim.interpolate({
          inputRange: [0, 0.08, 0.85, 1],
          outputRange: [0, 1, 1, 0],
        });

        return (
          <Animated.View
            key={p.id}
            style={{
              position: 'absolute',
              left: p.startX,
              top: 0,
              width: p.size,
              height: p.isCircle ? p.size : p.size * 1.6,
              borderRadius: p.isCircle ? p.size / 2 : 2,
              backgroundColor: p.color,
              opacity,
              transform: [{ translateY }, { translateX }, { rotate }],
            }}
          />
        );
      })}
    </View>
  );
}
