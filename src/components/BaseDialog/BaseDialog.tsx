import React, { useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../context/ThemeContext';
import { soundService } from '../../services/soundService';
import { createStyles } from './BaseDialog.styles';

export interface BaseDialogButtonProps {
  text?: string;
  content?: React.ReactNode;
  onPress: () => void;
  icon?: React.ReactNode;
  disabled?: boolean;
  testID?: string;
  buttonStyle?: ViewStyle;
}

export interface BaseDialogProps {
  visible: boolean;
  onClose?: () => void;
  icon?: React.ReactNode;
  iconBackgroundColor?: string;
  title: string | React.ReactNode;
  message?: string | React.ReactNode;
  emphasisText?: string | React.ReactNode;
  children?: React.ReactNode;
  primaryButton?: BaseDialogButtonProps;
  secondaryButton?: BaseDialogButtonProps;
  dividerText?: string;
  testID?: string;
  closeButtonTestID?: string;
  backdropTestID?: string;
  containerStyle?: ViewStyle;
  titleStyle?: TextStyle;
  messageStyle?: TextStyle;
}

export function BaseDialog({
  visible,
  onClose,
  icon,
  iconBackgroundColor,
  title,
  message,
  emphasisText,
  children,
  primaryButton,
  secondaryButton,
  dividerText,
  testID,
  closeButtonTestID,
  backdropTestID,
  containerStyle,
  titleStyle,
  messageStyle,
}: BaseDialogProps): React.JSX.Element {
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  const handleClose = () => {
    soundService.playTapSound();
    onClose?.();
  };

  const handlePrimaryPress = () => {
    soundService.playTapSound();
    primaryButton?.onPress();
  };

  const handleSecondaryPress = () => {
    soundService.playTapSound();
    secondaryButton?.onPress();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <TouchableOpacity
            style={styles.backdrop}
            activeOpacity={1}
            onPress={onClose ? handleClose : undefined}
            testID={backdropTestID}
          />

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={[styles.modalContainer, containerStyle]}
            testID={testID}
          >
            <View style={styles.gradient}>
              {onClose && (
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={handleClose}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  testID={closeButtonTestID}
                  accessibilityRole="button"
                >
                  <Ionicons name="close" size={20} color={colors.textMuted} />
                </TouchableOpacity>
              )}

              <View style={styles.content}>
                {icon && (
                  <View
                    style={[
                      styles.iconCircle,
                      iconBackgroundColor ? { backgroundColor: iconBackgroundColor } : null,
                    ]}
                  >
                    {icon}
                  </View>
                )}

                {typeof title === 'string' ? (
                  <Text style={[styles.title, titleStyle]}>{title}</Text>
                ) : (
                  title
                )}

                {message &&
                  (typeof message === 'string' ? (
                    <Text style={[styles.message, messageStyle]}>{message}</Text>
                  ) : (
                    message
                  ))}

                {emphasisText &&
                  (typeof emphasisText === 'string' ? (
                    <Text style={styles.emphasisText}>{emphasisText}</Text>
                  ) : (
                    emphasisText
                  ))}

                {children}

                {primaryButton && (
                  <TouchableOpacity
                    style={[
                      styles.primaryButton,
                      primaryButton.buttonStyle,
                      primaryButton.disabled && styles.disabledButton,
                    ]}
                    activeOpacity={0.85}
                    onPress={handlePrimaryPress}
                    disabled={primaryButton.disabled}
                    testID={primaryButton.testID}
                  >
                    {primaryButton.content ?? (
                      <>
                        {primaryButton.icon && (
                          <View style={styles.buttonIcon}>{primaryButton.icon}</View>
                        )}
                        {primaryButton.text && (
                          <Text style={styles.primaryButtonText}>{primaryButton.text}</Text>
                        )}
                      </>
                    )}
                  </TouchableOpacity>
                )}

                {primaryButton && secondaryButton && dividerText && (
                  <View style={styles.divider}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>{dividerText}</Text>
                    <View style={styles.dividerLine} />
                  </View>
                )}

                {secondaryButton && (
                  <TouchableOpacity
                    style={[
                      styles.secondaryButton,
                      secondaryButton.buttonStyle,
                      secondaryButton.disabled && styles.disabledButton,
                    ]}
                    activeOpacity={0.85}
                    onPress={handleSecondaryPress}
                    disabled={secondaryButton.disabled}
                    testID={secondaryButton.testID}
                  >
                    {secondaryButton.content ?? (
                      <>
                        {secondaryButton.icon && (
                          <View style={styles.buttonIcon}>{secondaryButton.icon}</View>
                        )}
                        {secondaryButton.text && (
                          <Text style={styles.secondaryButtonText}>{secondaryButton.text}</Text>
                        )}
                      </>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
