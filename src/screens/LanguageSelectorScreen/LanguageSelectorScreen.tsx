import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useIntl } from 'react-intl';
import { SupportedLocales, LANGUAGES } from '../../types/intl';
import { getMessages } from '../../services/intlService';
import { ScreenHeader } from '../../components/ScreenHeader/ScreenHeader';
import { ScreenBackground } from '../../components/ScreenBackground/ScreenBackground';
import { useAppTheme } from '../../context/ThemeContext';
import { useLocale } from '../../context/LocaleContext';
import { RootStackParamList } from '../../types/navigation';
import { updateLanguageSettings } from '../../services/settingsService';
import { createStyles } from './LanguageSelectorScreen.styles';

export function LanguageSelectorScreen(): React.JSX.Element {
  const intl = useIntl();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  let isSettingsMode = false;
  try {
    const route = useRoute<RouteProp<RootStackParamList, 'LanguageSelector'>>();
    isSettingsMode = Boolean(route.params?.isSettingsMode);
  } catch {
    // If rendered outside route context
  }

  const { colors, isDark } = useAppTheme();
  const { locale, setLocale } = useLocale();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLocales | null>(
    isSettingsMode ? locale : null,
  );
  const [isSaving, setIsSaving] = useState(false);

  // Динамический перевод интерфейса под выбранный язык для мгновенного отклика
  const activeLocale = selectedLanguage || locale || 'en';
  const dynamicMessages = useMemo(() => getMessages(activeLocale), [activeLocale]);
  const screenTitle =
    dynamicMessages['languageSelectorScreen.title'] ||
    intl.formatMessage({ id: 'languageSelectorScreen.title' });
  const continueButtonLabel =
    dynamicMessages['languageSelectorScreen.continue'] ||
    intl.formatMessage({ id: 'languageSelectorScreen.continue' });

  const handleLanguageSelect = (languageCode: SupportedLocales) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Игнорируем в вебе / тестах
    }
    setSelectedLanguage(languageCode);
  };

  const handleContinue = () => {
    if (!selectedLanguage || isSaving) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      // Игнорируем
    }

    setIsSaving(true);

    try {
      setLocale(selectedLanguage);
      updateLanguageSettings(true, selectedLanguage);

      if (isSettingsMode) {
        navigation.goBack();
      } else {
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainTabs' }],
        });
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to save language setting:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScreenBackground>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <View testID="language-selector-screen">
        <ScreenHeader
          title={screenTitle}
          showBackButton={isSettingsMode}
          onBackPress={() => navigation.goBack()}
          showStreak={false}
        />
      </View>

      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.grid}>
            {LANGUAGES.map(language => (
              <TouchableOpacity
                key={language.code}
                style={[
                  styles.languageCard,
                  selectedLanguage === language.code && styles.languageCardSelected,
                ]}
                onPress={() => handleLanguageSelect(language.code)}
                activeOpacity={0.7}
                testID={`language-card-${language.code}`}
              >
                <Text style={styles.flag}>{language.flag}</Text>
                <Text
                  style={[
                    styles.languageName,
                    selectedLanguage === language.code && styles.languageNameSelected,
                  ]}
                >
                  {language.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            testID="continue-button"
            style={[styles.continueButton, !selectedLanguage && styles.continueButtonDisabled]}
            onPress={handleContinue}
            disabled={!selectedLanguage || isSaving}
            activeOpacity={0.8}
          >
            <Text style={styles.continueButtonText}>{continueButtonLabel} ➔</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenBackground>
  );
}
