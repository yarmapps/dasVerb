import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch, Linking, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FontAwesome5 } from '@expo/vector-icons';
import { useIntl } from 'react-intl';
import appConfig from '../../../app.json';
import { ScreenHeader } from '../../components/ScreenHeader/ScreenHeader';
import { ScreenBackground } from '../../components/ScreenBackground/ScreenBackground';
import { RootStackParamList } from '../../types/navigation';
import { useAppTheme } from '../../context/ThemeContext';
import { useLocale } from '../../context/LocaleContext';
import { LANGUAGES } from '../../types/intl';
import { getSettings, updateSettings, resetAllSettings } from '../../services/settingsService';
import { progressService } from '../../services/progressService';
import { soundService } from '../../services/soundService';
import { trackEvent } from '../../services/analyticsService';
import {
  requestPermissions,
  scheduleDailyReminder,
  cancelDailyReminder,
  scheduleStreakReminder,
  cancelStreakReminder,
} from '../../services/notificationService';
import { createStyles } from './SettingsScreen.styles';

type SettingsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function SettingsScreen(): React.JSX.Element {
  const intl = useIntl();
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const { colors, themeMode, setThemeMode, isDark } = useAppTheme();
  const { locale } = useLocale();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [soundEnabled, setSoundEnabled] = useState(() => getSettings().soundEffects);
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    () => getSettings().notifications,
  );
  const [speakOnCorrectAnswer, setSpeakOnCorrectAnswer] = useState(
    () => getSettings().speakOnCorrectAnswer,
  );
  const [ttsVoiceGender, setTtsVoiceGender] = useState<'female' | 'male'>(
    () => getSettings().ttsVoiceGender,
  );

  const handleSoundToggle = (value: boolean) => {
    trackEvent('settings_sound_toggled', { enabled: value });
    setSoundEnabled(value);
    updateSettings({ soundEffects: value });
    if (value) {
      soundService.playTapSound();
    }
  };

  const handleNotificationsToggle = async (value: boolean) => {
    trackEvent('settings_notifications_toggled', { enabled: value });
    if (value) {
      const hasPermission = await requestPermissions();
      if (hasPermission) {
        setNotificationsEnabled(true);
        updateSettings({ notifications: true });
        await scheduleDailyReminder();
        await scheduleStreakReminder();
        soundService.playTapSound();
      } else {
        setNotificationsEnabled(false);
        updateSettings({ notifications: false });
        Alert.alert(
          intl.formatMessage({
            id: 'settingsScreen.notificationsPermissionRequiredTitle',
          }),
          intl.formatMessage({
            id: 'settingsScreen.notificationsPermissionRequiredMessage',
          }),
          [
            {
              text: intl.formatMessage({ id: 'settingsScreen.cancel' }),
              style: 'cancel',
            },
            {
              text: intl.formatMessage({ id: 'settingsScreen.openSettings' }),
              onPress: () => {
                Linking.openSettings().catch(() => {});
              },
            },
          ],
        );
      }
    } else {
      setNotificationsEnabled(false);
      updateSettings({ notifications: false });
      await cancelDailyReminder();
      await cancelStreakReminder();
    }
  };

  const handleSpeakToggle = (value: boolean) => {
    trackEvent('settings_speak_on_correct_toggled', { enabled: value });
    setSpeakOnCorrectAnswer(value);
    updateSettings({ speakOnCorrectAnswer: value });
    if (value) {
      soundService.playTapSound();
    }
  };

  const handleVoiceGenderToggle = () => {
    const next = ttsVoiceGender === 'female' ? 'male' : 'female';
    trackEvent('settings_voice_gender_changed', { gender: next });
    setTtsVoiceGender(next);
    updateSettings({ ttsVoiceGender: next });
    soundService.playTapSound();
  };

  const currentLanguageName = useMemo(() => {
    const found = LANGUAGES.find(l => l.code === locale);
    return found ? found.name : 'English';
  }, [locale]);

  const toggleThemeMode = () => {
    const modes: ('light' | 'dark' | 'system')[] = ['system', 'light', 'dark'];
    const currentIndex = modes.indexOf(themeMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    const newTheme = modes[nextIndex];
    trackEvent('settings_theme_changed', { theme: newTheme });
    setThemeMode(newTheme);
  };

  const handleContactUs = () => {
    trackEvent('settings_contact_us_clicked', {});
    Linking.openURL('mailto:yarm.apps@gmail.com');
  };

  const handleResetProgress = () => {
    Alert.alert(
      intl.formatMessage({ id: 'settingsScreen.resetProgressTitle' }),
      intl.formatMessage({ id: 'settingsScreen.resetProgressMessage' }),
      [
        {
          text: intl.formatMessage({ id: 'settingsScreen.cancel' }),
          style: 'cancel',
        },
        {
          text: intl.formatMessage({ id: 'settingsScreen.resetProgressConfirm' }),
          style: 'destructive',
          onPress: () => {
            progressService.clearAllProgress();
            trackEvent('settings_progress_reset', {});
            soundService.playTapSound();
            Alert.alert(
              intl.formatMessage({ id: 'settingsScreen.resetSuccessTitle' }),
              intl.formatMessage({ id: 'settingsScreen.resetProgressSuccess' }),
            );
          },
        },
      ],
    );
  };

  const handleResetSettings = () => {
    Alert.alert(
      intl.formatMessage({ id: 'settingsScreen.resetSettingsTitle' }),
      intl.formatMessage({ id: 'settingsScreen.resetSettingsMessage' }),
      [
        {
          text: intl.formatMessage({ id: 'settingsScreen.cancel' }),
          style: 'cancel',
        },
        {
          text: intl.formatMessage({ id: 'settingsScreen.resetSettingsConfirm' }),
          style: 'destructive',
          onPress: () => {
            resetAllSettings();
            setSoundEnabled(true);
            setNotificationsEnabled(true);
            setSpeakOnCorrectAnswer(true);
            setTtsVoiceGender('female');
            setThemeMode('system');
            trackEvent('settings_all_reset', {});
            soundService.playTapSound();
            Alert.alert(
              intl.formatMessage({ id: 'settingsScreen.resetSuccessTitle' }),
              intl.formatMessage({ id: 'settingsScreen.resetSettingsSuccess' }),
            );
          },
        },
      ],
    );
  };

  const renderSection = (title: string, children: React.ReactNode) => (
    <View>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContainer}>{children}</View>
    </View>
  );

  const renderRow = (
    icon: string,
    label: string,
    rightElement: React.ReactNode,
    onPress?: () => void,
    isLast: boolean = false,
    isDanger: boolean = false,
  ) => {
    const Component = onPress ? TouchableOpacity : View;

    return (
      <View>
        <Component style={styles.row} onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>
          <View style={styles.rowLeft}>
            <View style={[styles.iconContainer, isDanger && styles.dangerIconContainer]}>
              <FontAwesome5 name={icon} size={14} color={isDanger ? '#EF4444' : colors.primary} />
            </View>
            <Text style={[styles.rowLabel, isDanger && styles.dangerRowLabel]}>{label}</Text>
          </View>
          <View style={styles.rowRight}>{rightElement}</View>
        </Component>
        {!isLast && <View style={styles.separator} />}
      </View>
    );
  };

  const getThemeModeLabel = () => {
    switch (themeMode) {
      case 'light':
        return intl.formatMessage({ id: 'settingsScreen.themeLight' });
      case 'dark':
        return intl.formatMessage({ id: 'settingsScreen.themeDark' });
      case 'system':
      default:
        return intl.formatMessage({ id: 'settingsScreen.themeSystem' });
    }
  };

  const voiceGenderLabel = useMemo(() => {
    if (ttsVoiceGender === 'female') {
      return intl.formatMessage({ id: 'settingsScreen.voiceFemale' });
    }
    return intl.formatMessage({ id: 'settingsScreen.voiceMale' });
  }, [intl, ttsVoiceGender]);

  return (
    <ScreenBackground>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <ScreenHeader
        title={intl.formatMessage({ id: 'settingsScreen.title' })}
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
        showStreak={false}
      />
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* GENERAL SECTION */}
        {renderSection(
          intl.formatMessage({ id: 'settingsScreen.generalSection' }),
          <>
            {renderRow(
              'language',
              intl.formatMessage({ id: 'settingsScreen.appLanguage' }),
              <View style={styles.rowRightContent}>
                <Text style={styles.rowValue}>{currentLanguageName}</Text>
                <FontAwesome5 name="chevron-right" size={12} color={colors.textMutedInverted} />
              </View>,
              () => navigation.navigate('LanguageSelector', { isSettingsMode: true }),
              false,
            )}
            {renderRow(
              'moon',
              intl.formatMessage({ id: 'settingsScreen.theme' }),
              <View style={styles.rowRightContent}>
                <Text style={styles.rowValue}>{getThemeModeLabel()}</Text>
                <FontAwesome5 name="chevron-right" size={12} color={colors.textMutedInverted} />
              </View>,
              toggleThemeMode,
              false,
            )}
            {renderRow(
              'bell',
              intl.formatMessage({ id: 'settingsScreen.notifications' }),
              <Switch
                value={notificationsEnabled}
                onValueChange={handleNotificationsToggle}
                trackColor={{ false: colors.blockBorder, true: colors.primary }}
                thumbColor="#ffffff"
              />,
              undefined,
              true,
            )}
          </>,
        )}

        {/* AUDIO SECTION */}
        {renderSection(
          intl.formatMessage({ id: 'settingsScreen.audioSection' }),
          <>
            {renderRow(
              'volume-up',
              intl.formatMessage({ id: 'settingsScreen.soundEffects' }),
              <Switch
                value={soundEnabled}
                onValueChange={handleSoundToggle}
                trackColor={{ false: colors.blockBorder, true: colors.primary }}
                thumbColor="#ffffff"
              />,
              undefined,
              false,
            )}
            {renderRow(
              'comment-dots',
              intl.formatMessage({ id: 'settingsScreen.speakOnCorrectAnswer' }),
              <Switch
                value={speakOnCorrectAnswer}
                onValueChange={handleSpeakToggle}
                trackColor={{ false: colors.blockBorder, true: colors.primary }}
                thumbColor="#ffffff"
              />,
              undefined,
              false,
            )}
            {renderRow(
              'venus-mars',
              intl.formatMessage({ id: 'settingsScreen.voiceGender' }),
              <View style={styles.rowRightContent}>
                <Text style={styles.rowValue}>{voiceGenderLabel}</Text>
                <FontAwesome5 name="chevron-right" size={12} color={colors.textMutedInverted} />
              </View>,
              handleVoiceGenderToggle,
              true,
            )}
          </>,
        )}

        {/* SUPPORT SECTION */}
        {renderSection(
          intl.formatMessage({ id: 'settingsScreen.supportSection' }),
          <>
            {renderRow(
              'envelope',
              intl.formatMessage({ id: 'settingsScreen.contactUs' }),
              <FontAwesome5 name="chevron-right" size={12} color={colors.textMutedInverted} />,
              handleContactUs,
              true,
            )}
          </>,
        )}

        {/* DATA MANAGEMENT SECTION */}
        {renderSection(
          intl.formatMessage({ id: 'settingsScreen.dataSection' }),
          <>
            {renderRow(
              'trash-alt',
              intl.formatMessage({ id: 'settingsScreen.resetProgress' }),
              <FontAwesome5 name="chevron-right" size={12} color={colors.textMutedInverted} />,
              handleResetProgress,
              false,
              true,
            )}
            {renderRow(
              'redo-alt',
              intl.formatMessage({ id: 'settingsScreen.resetSettings' }),
              <FontAwesome5 name="chevron-right" size={12} color={colors.textMutedInverted} />,
              handleResetSettings,
              true,
              true,
            )}
          </>,
        )}

        <TouchableOpacity
          onLongPress={() => {
            if (__DEV__) {
              soundService.playTapSound();
              navigation.navigate('Debug');
            }
          }}
          delayLongPress={350}
          activeOpacity={0.8}
        >
          <Text style={styles.versionText}>
            {intl.formatMessage({ id: 'settingsScreen.version' })} {appConfig.expo.version} (
            {appConfig.expo.name})
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenBackground>
  );
}
