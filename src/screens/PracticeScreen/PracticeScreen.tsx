import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useIntl } from 'react-intl';
import { useAppTheme } from '../../context/ThemeContext';
import { HeaderIconButton } from '../../components/HeaderIconButton/HeaderIconButton';
import { ScreenHeader } from '../../components/ScreenHeader/ScreenHeader';
import { ScreenBackground } from '../../components/ScreenBackground/ScreenBackground';
import { FeaturedStartCard } from '../../components/FeaturedStartCard/FeaturedStartCard';
import { PrefixPracticeCard } from '../../components/PrefixPracticeCard/PrefixPracticeCard';
import { ConjugationPracticeCard } from '../../components/ConjugationPracticeCard/ConjugationPracticeCard';
import { VerbFormsPracticeCard } from '../../components/VerbFormsPracticeCard/VerbFormsPracticeCard';
import { PrepositionPracticeCard } from '../../components/PrepositionPracticeCard/PrepositionPracticeCard';
import { SmartQuizCard } from '../../components/SmartQuizCard/SmartQuizCard';
import { PracticeNativeAdCard } from '../../components/PracticeNativeAdCard/PracticeNativeAdCard';
import { ThematicCategoriesSection } from '../../components/ThematicCategoriesSection/ThematicCategoriesSection';
import { ThematicCategory } from '../../config/categories';
import { PremiumSubscribeSheet } from '../../components/PremiumSubscribeSheet/PremiumSubscribeSheet';
import { UserNameModal } from '../../components/UserNameModal/UserNameModal';
import { MonthlySummaryModal } from '../../components/MonthlySummaryModal/MonthlySummaryModal';
import { useMonthlySummary } from '../../hooks/useMonthlySummary';
import { soundService } from '../../services/soundService';
import { useNavigateToQuiz } from '../../hooks/useNavigateToQuiz';
import { usePremiumStatus } from '../../hooks/usePremiumStatus';
import { getSettings, updateSettings } from '../../services/settingsService';
import {
  getStoredDisplayName,
  updateDisplayName,
  isLeaderboardEnabled,
} from '../../services/leaderboardService';
import { RootStackParamList, PracticeStackParamList } from '../../types/navigation';
import { createStyles } from './PracticeScreen.styles';
import { useFeatureFlag } from '../../services/featuresService';
import { trackEvent } from '../../services/analyticsService';

type NavigationProp = NativeStackNavigationProp<PracticeStackParamList & RootStackParamList>;

export function PracticeScreen(): React.JSX.Element {
  const intl = useIntl();
  const navigation = useNavigation<NavigationProp>();
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { navigateToQuiz, dailyQuizLimitModalUI } = useNavigateToQuiz(navigation);
  const isPremium = usePremiumStatus();
  const isPremiumFeature = useFeatureFlag('ENABLE_PREMIUM');
  const [showPremiumSheet, setShowPremiumSheet] = useState(false);
  const [premiumSheetSource, setPremiumSheetSource] = useState<string>('home_header_gem');

  const isLeaderboardActive = isLeaderboardEnabled();
  const {
    recapData,
    isModalVisible: isMonthlyRecapVisible,
    closeModal: handleCloseMonthlyRecap,
  } = useMonthlySummary(isLeaderboardActive);

  const [showNameModal, setShowNameModal] = useState(false);

  useEffect(() => {
    if (showPremiumSheet || isMonthlyRecapVisible) return;

    const timer = setTimeout(() => {
      const currentSettings = getSettings();
      if (currentSettings.hasPromptedNameOnLaunch) {
        return;
      }

      const storedName = getStoredDisplayName()?.trim();
      const hasCustomName = Boolean(storedName && storedName.toLowerCase() !== 'learner');

      if (hasCustomName) {
        updateSettings({ hasPromptedNameOnLaunch: true });
      } else {
        setShowNameModal(true);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [showPremiumSheet, isMonthlyRecapVisible]);

  const handleSaveNameModal = async (savedName: string) => {
    soundService.playTapSound();
    await updateDisplayName(savedName);
    updateSettings({ hasPromptedNameOnLaunch: true });
    setShowNameModal(false);
  };

  const handleCloseNameModal = () => {
    soundService.playTapSound();
    updateSettings({ hasPromptedNameOnLaunch: true });
    setShowNameModal(false);
  };

  const handleStartStandard = () => {
    soundService.playTapSound();
    trackEvent('practice_mode_selected', { mode: 'standard_course' });
    navigation.navigate('VerbsPracticeList');
  };

  const handleStartPrefixPractice = () => {
    soundService.playTapSound();
    trackEvent('practice_mode_selected', { mode: 'prefixes' });
    navigation.navigate('PrefixPracticeList');
  };

  const handleStartConjugationPractice = () => {
    soundService.playTapSound();
    trackEvent('practice_mode_selected', { mode: 'conjugation' });
    navigation.navigate('ConjugationPracticeList');
  };

  const handleStartVerbFormsPractice = () => {
    soundService.playTapSound();
    trackEvent('practice_mode_selected', { mode: 'verb_forms' });
    navigation.navigate('VerbFormsPracticeList');
  };

  const handleStartPrepositionPractice = () => {
    soundService.playTapSound();
    trackEvent('practice_mode_selected', { mode: 'prepositions' });
    navigation.navigate('PrepositionsPracticeList');
  };

  const handleStartSmartQuiz = () => {
    soundService.playTapSound();
    trackEvent('practice_mode_selected', { mode: 'smart_quiz' });
    if (!isPremium) {
      setPremiumSheetSource('smart_quiz_card');
      setShowPremiumSheet(true);
      return;
    }
    navigateToQuiz({ isSmartQuiz: true });
  };

  const handleSelectCategory = (category: ThematicCategory) => {
    soundService.playTapSound();
    const categoryTitle = intl.formatMessage({ id: category.titleKey });
    trackEvent('category_selected', {
      category_id: category.id,
      category_title: categoryTitle,
    });
    navigation.navigate('VerbsPracticeList', {
      categoryId: category.id,
      categoryTitle,
      infinitives: category.verbInfinitives,
    });
  };

  return (
    <ScreenBackground>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <ScreenHeader
        showBackButton={false}
        showLeaderboard={true}
        leftContent={
          <View style={styles.headerLeftRow}>
            {isPremiumFeature && !isPremium && (
              <HeaderIconButton
                icon="gem"
                iconSize={18}
                iconColor={colors.premiumDiamond}
                onPress={() => {
                  setPremiumSheetSource('home_header_gem');
                  setShowPremiumSheet(true);
                }}
                testID="premium-gem-button"
              />
            )}
            <HeaderIconButton
              icon="cog"
              iconSize={18}
              iconColor={colors.textPrimary}
              onPress={() => {
                navigation.navigate('Settings');
              }}
              onLongPress={() => {
                if (__DEV__) {
                  navigation.navigate('Debug');
                }
              }}
              delayLongPress={350}
              testID="settings-button"
            />
          </View>
        }
      />
      <View style={styles.content}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* 1. Standard Course Path */}
          <FeaturedStartCard onPress={handleStartStandard} />

          {/* 2. Smart Quiz Mode (right after recommended card) */}
          <SmartQuizCard onPress={handleStartSmartQuiz} isPremium={isPremium} />

          {/* 3. Active Native Ad Block between smart quiz and other modes */}
          <PracticeNativeAdCard isPremium={isPremium} colors={colors} isDark={isDark} />

          {/* 4. Section Title: Learn by Mode */}
          <Text style={styles.sectionTitle}>
            {intl.formatMessage({ id: 'practiceScreen.sectionModes' })}
          </Text>

          {/* 5. Other 4 modes in 2x2 grid (columns of two) */}
          <View style={styles.gridRow}>
            <ConjugationPracticeCard onPress={handleStartConjugationPractice} />
            <VerbFormsPracticeCard onPress={handleStartVerbFormsPractice} />
          </View>
          <View style={styles.gridRow}>
            <PrepositionPracticeCard onPress={handleStartPrepositionPractice} />
            <PrefixPracticeCard onPress={handleStartPrefixPractice} />
          </View>

          {/* 6. Section Title: Learn by Topic */}
          <Text style={styles.sectionTitle}>
            {intl.formatMessage({ id: 'practiceScreen.sectionTopics' })}
          </Text>

          {/* 7. Thematic Categories Section */}
          <ThematicCategoriesSection onSelectCategory={handleSelectCategory} />
        </ScrollView>
      </View>
      {dailyQuizLimitModalUI}
      {isPremiumFeature && (
        <PremiumSubscribeSheet
          visible={showPremiumSheet}
          onClose={() => setShowPremiumSheet(false)}
          source={premiumSheetSource}
        />
      )}
      <MonthlySummaryModal
        visible={isMonthlyRecapVisible}
        data={recapData}
        onClose={handleCloseMonthlyRecap}
      />
      <UserNameModal
        visible={showNameModal}
        initialValue=""
        onSave={handleSaveNameModal}
        onClose={handleCloseNameModal}
      />
    </ScreenBackground>
  );
}
