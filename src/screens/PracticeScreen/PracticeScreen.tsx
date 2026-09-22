import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FontAwesome5 } from '@expo/vector-icons';
import { useIntl } from 'react-intl';
import { useAppTheme } from '../../context/ThemeContext';
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
import { soundService } from '../../services/soundService';
import { useNavigateToQuiz } from '../../hooks/useNavigateToQuiz';
import { usePremiumStatus } from '../../hooks/usePremiumStatus';
import { RootStackParamList, PracticeStackParamList } from '../../types/navigation';
import { createStyles } from './PracticeScreen.styles';
import { useFeatureFlag } from '../../services/featuresService';

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

  const handleStartStandard = () => {
    soundService.playTapSound();
    navigation.navigate('VerbsPracticeList');
  };

  const handleStartPrefixPractice = () => {
    soundService.playTapSound();
    navigation.navigate('PrefixPracticeList');
  };

  const handleStartConjugationPractice = () => {
    soundService.playTapSound();
    navigation.navigate('ConjugationPracticeList');
  };

  const handleStartVerbFormsPractice = () => {
    soundService.playTapSound();
    navigation.navigate('VerbFormsPracticeList');
  };

  const handleStartPrepositionPractice = () => {
    soundService.playTapSound();
    navigation.navigate('PrepositionsPracticeList');
  };

  const handleStartSmartQuiz = () => {
    soundService.playTapSound();
    navigateToQuiz({ isSmartQuiz: true });
  };

  const handleSelectCategory = (category: ThematicCategory) => {
    soundService.playTapSound();
    navigation.navigate('VerbsPracticeList', {
      categoryId: category.id,
      categoryTitle: intl.formatMessage({ id: category.titleKey }),
      infinitives: category.verbInfinitives,
    });
  };

  return (
    <ScreenBackground>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <ScreenHeader
        title={intl.formatMessage({ id: 'practiceScreen.title' })}
        showBackButton={false}
        leftContent={
          <View style={styles.headerLeftRow}>
            {isPremiumFeature && !isPremium && (
              <TouchableOpacity
                style={styles.headerButton}
                onPress={() => setShowPremiumSheet(true)}
                testID="premium-gem-button"
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <FontAwesome5 name="gem" size={18} color={colors.premiumDiamond} />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => navigation.navigate('Settings')}
              onLongPress={() => {
                if (__DEV__) {
                  soundService.playTapSound();
                  navigation.navigate('Debug');
                }
              }}
              delayLongPress={350}
              testID="settings-button"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <FontAwesome5 name="cog" size={18} color={colors.textPrimary} />
            </TouchableOpacity>
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
          <SmartQuizCard onPress={handleStartSmartQuiz} />

          {/* 3. Active Native Ad Block between smart quiz and other modes */}
          <PracticeNativeAdCard isPremium={isPremium} colors={colors} isDark={isDark} />

          {/* 4. Section Title: Learn by Mode */}
          <Text style={styles.sectionTitle}>
            {intl.formatMessage({ id: 'practiceScreen.sectionModes' })}
          </Text>

          {/* 5. Other 4 modes in 2x2 grid (columns of two) */}
          <View style={styles.gridRow}>
            <PrefixPracticeCard onPress={handleStartPrefixPractice} />
            <ConjugationPracticeCard onPress={handleStartConjugationPractice} />
          </View>
          <View style={styles.gridRow}>
            <VerbFormsPracticeCard onPress={handleStartVerbFormsPractice} />
            <PrepositionPracticeCard onPress={handleStartPrepositionPractice} />
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
          source="home_header_gem"
        />
      )}
    </ScreenBackground>
  );
}
