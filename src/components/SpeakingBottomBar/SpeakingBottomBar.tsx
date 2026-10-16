import React, { useMemo, useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Animated,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useIntl } from 'react-intl';
import { useAppTheme } from '../../context/ThemeContext';
import { QuizExercise } from '../../services/quizGeneratorService';
import { createStyles } from './SpeakingBottomBar.styles';

export type SpeakingState = 'idle' | 'recording' | 'evaluating' | 'error' | 'permission_denied';

export interface SpeakingBottomBarProps {
  state: SpeakingState;
  exerciseType?: QuizExercise['type'];
  onStartRecording: () => void;
  onStopRecording: () => void;
  onRequestPermission?: () => void;
}

export function SpeakingBottomBar({
  state,
  exerciseType,
  onStartRecording,
  onStopRecording,
  onRequestPermission,
}: SpeakingBottomBarProps): React.JSX.Element {
  const intl = useIntl();
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  const isRecording = state === 'recording';
  const isEvaluating = state === 'evaluating';
  const isPermissionDenied = state === 'permission_denied';
  const isError = state === 'error';

  // Animation values
  const [pulseScale] = useState(() => new Animated.Value(1));
  const [ripple1Scale] = useState(() => new Animated.Value(1));
  const [ripple1Opacity] = useState(() => new Animated.Value(0));
  const [ripple2Scale] = useState(() => new Animated.Value(1));
  const [ripple2Opacity] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (isRecording) {
      // 1. Button breathing pulse
      const pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseScale, {
            toValue: 1.08,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseScale, {
            toValue: 1.0,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
      );

      // 2. Ripple ring 1
      const ripple1Loop = Animated.loop(
        Animated.parallel([
          Animated.timing(ripple1Scale, {
            toValue: 1.7,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(ripple1Opacity, {
              toValue: 0.5,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(ripple1Opacity, {
              toValue: 0,
              duration: 1000,
              useNativeDriver: true,
            }),
          ]),
        ]),
      );

      // 3. Ripple ring 2 (delayed by 600ms)
      const ripple2Loop = Animated.loop(
        Animated.sequence([
          Animated.delay(600),
          Animated.parallel([
            Animated.timing(ripple2Scale, {
              toValue: 1.7,
              duration: 1200,
              useNativeDriver: true,
            }),
            Animated.sequence([
              Animated.timing(ripple2Opacity, {
                toValue: 0.5,
                duration: 200,
                useNativeDriver: true,
              }),
              Animated.timing(ripple2Opacity, {
                toValue: 0,
                duration: 1000,
                useNativeDriver: true,
              }),
            ]),
          ]),
        ]),
      );

      pulseLoop.start();
      ripple1Loop.start();
      ripple2Loop.start();

      return () => {
        pulseLoop.stop();
        ripple1Loop.stop();
        ripple2Loop.stop();
      };
    }

    // Reset animations when not recording
    Animated.parallel([
      Animated.timing(pulseScale, { toValue: 1, duration: 150, useNativeDriver: true }),
      Animated.timing(ripple1Scale, { toValue: 1, duration: 150, useNativeDriver: true }),
      Animated.timing(ripple1Opacity, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(ripple2Scale, { toValue: 1, duration: 150, useNativeDriver: true }),
      Animated.timing(ripple2Opacity, { toValue: 0, duration: 150, useNativeDriver: true }),
    ]).start();
  }, [isRecording, pulseScale, ripple1Scale, ripple1Opacity, ripple2Scale, ripple2Opacity]);

  const handleTogglePress = () => {
    if (isEvaluating || isPermissionDenied) {
      return;
    }
    if (isRecording) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      } catch {
        // Ignore haptics error
      }
      onStopRecording();
    } else {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      } catch {
        // Ignore haptics error on simulator
      }
      onStartRecording();
    }
  };

  const handleOpenSettings = () => {
    if (onRequestPermission) {
      onRequestPermission();
    } else {
      Linking.openSettings().catch(() => {});
    }
  };

  const renderHintContent = () => {
    if (isPermissionDenied) {
      return (
        <>
          <View style={styles.hintIconContainer}>
            <Ionicons name="lock-closed-outline" size={14} color="#EF4444" />
          </View>
          <Text style={[styles.hintText, styles.hintTextError]}>
            {intl.formatMessage({ id: 'speakingBar.permissionRequired' })}
          </Text>
        </>
      );
    }

    if (isRecording) {
      return (
        <>
          <View style={styles.hintIconContainer}>
            <View style={styles.recordingDot} />
          </View>
          <Text style={[styles.hintText, styles.hintTextRecording]}>
            {intl.formatMessage({ id: 'speakingBar.recording' })}
          </Text>
        </>
      );
    }

    if (isEvaluating) {
      return (
        <>
          <View style={styles.hintIconContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
          <Text style={styles.hintText}>
            {intl.formatMessage({ id: 'speakingBar.evaluating' })}
          </Text>
        </>
      );
    }

    if (isError) {
      return (
        <>
          <View style={styles.hintIconContainer}>
            <Ionicons name="warning-outline" size={14} color="#EF4444" />
          </View>
          <Text style={[styles.hintText, styles.hintTextError]}>
            {intl.formatMessage({ id: 'speakingBar.tryAgain' })}
          </Text>
        </>
      );
    }

    // Default Idle Hint based on exercise type
    let promptKey = 'speakingBar.holdToSpeakSentence';
    if (exerciseType === 'verb_forms_fill') {
      promptKey = 'speakingBar.holdToSpeakForms';
    } else if (exerciseType === 'conjugation_fill') {
      promptKey = 'speakingBar.holdToSpeakConjugation';
    }

    return (
      <>
        <View style={styles.hintIconContainer}>
          <FontAwesome5 name="microphone" size={12} color={colors.primary} />
        </View>
        <Text style={styles.hintText}>{intl.formatMessage({ id: promptKey })}</Text>
      </>
    );
  };

  const renderButtonIcon = () => {
    if (isEvaluating) {
      return <ActivityIndicator size="small" color="#FFFFFF" />;
    }
    if (isRecording) {
      return <FontAwesome5 name="stop" size={20} color="#FFFFFF" />;
    }
    return <FontAwesome5 name="microphone" size={26} color="#FFFFFF" />;
  };

  return (
    <View style={styles.container} testID="speaking-bottom-bar">
      {/* Dynamic Hint Pill */}
      <View
        style={[
          styles.hintPill,
          isRecording && styles.hintPillRecording,
          (isError || isPermissionDenied) && styles.hintPillError,
        ]}
        testID="speaking-hint-pill"
      >
        {renderHintContent()}
      </View>

      {/* Permission Open Settings CTA if permission is denied */}
      {isPermissionDenied && (
        <TouchableOpacity
          style={styles.permissionActionBtn}
          onPress={handleOpenSettings}
          activeOpacity={0.8}
          testID="speaking-permission-btn"
        >
          <Text style={styles.permissionActionText}>
            {intl.formatMessage({ id: 'speakingBar.openSettings' })}
          </Text>
        </TouchableOpacity>
      )}

      {/* Push-to-Talk Button with Animations */}
      <View style={styles.micButtonWrapper}>
        {/* Ripple Wave 1 */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.rippleRing,
            {
              transform: [{ scale: ripple1Scale }],
              opacity: ripple1Opacity,
            },
          ]}
        />

        {/* Ripple Wave 2 */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.rippleRing,
            {
              transform: [{ scale: ripple2Scale }],
              opacity: ripple2Opacity,
            },
          ]}
        />

        {/* Active Mic Button */}
        <Animated.View style={{ transform: [{ scale: pulseScale }] }}>
          <Pressable
            onPress={handleTogglePress}
            disabled={isEvaluating || isPermissionDenied}
            style={[
              styles.micButton,
              isRecording && styles.micButtonRecording,
              isEvaluating && styles.micButtonEvaluating,
            ]}
            testID="speaking-mic-btn"
          >
            {renderButtonIcon()}
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}
