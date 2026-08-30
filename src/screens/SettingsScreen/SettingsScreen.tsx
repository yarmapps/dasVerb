import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FontAwesome5 } from '@expo/vector-icons';
import { useIntl } from 'react-intl';
import { ScreenHeader } from '../../components/ScreenHeader/ScreenHeader';
import { RootStackParamList } from '../../types/navigation';
import { useAppTheme } from '../../context/ThemeContext';
import { useLocale } from '../../context/LocaleContext';
import { LANGUAGES } from '../../types/intl';
import { createStyles } from './SettingsScreen.styles';

type SettingsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function SettingsScreen(): React.JSX.Element {
  const intl = useIntl();
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const { colors, themeMode, setThemeMode, isDark } = useAppTheme();
  const { locale } = useLocale();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const currentLanguageName = useMemo(() => {
    const found = LANGUAGES.find(l => l.code === locale);
    return found ? found.name : 'English';
  }, [locale]);

  const toggleThemeMode = () => {
    const modes: ('light' | 'dark' | 'system')[] = ['system', 'light', 'dark'];
    const currentIndex = modes.indexOf(themeMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setThemeMode(modes[nextIndex]);
  };

  const handleContactUs = () => {
    Linking.openURL('mailto:yarm.apps@gmail.com');
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
  ) => {
    const Component = onPress ? TouchableOpacity : View;

    return (
      <View>
        <Component style={styles.row} onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>
          <View style={styles.rowLeft}>
            <View style={styles.iconContainer}>
              <FontAwesome5 name={icon} size={14} color={colors.primary} />
            </View>
            <Text style={styles.rowLabel}>{label}</Text>
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

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <ScreenHeader
        title={intl.formatMessage({ id: 'settingsScreen.title' })}
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
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
                onValueChange={setNotificationsEnabled}
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
                onValueChange={setSoundEnabled}
                trackColor={{ false: colors.blockBorder, true: colors.primary }}
                thumbColor="#ffffff"
              />,
              undefined,
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

        <Text style={styles.versionText}>
          {intl.formatMessage({ id: 'settingsScreen.version' })} 1.0.0 (dasVerb)
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
