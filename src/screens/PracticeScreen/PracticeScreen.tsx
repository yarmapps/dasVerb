import React, { useMemo, useState } from 'react';
import { View, TouchableOpacity, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FontAwesome5 } from '@expo/vector-icons';
import { useIntl } from 'react-intl';
import { useAppTheme } from '../../context/ThemeContext';
import { ScreenHeader } from '../../components/ScreenHeader/ScreenHeader';
import { ScreenBackground } from '../../components/ScreenBackground/ScreenBackground';
import { FeaturedStartCard } from '../../components/FeaturedStartCard/FeaturedStartCard';
import { SmartQuizCard } from '../../components/SmartQuizCard/SmartQuizCard';
import { PremiumSubscribeSheet } from '../../components/PremiumSubscribeSheet/PremiumSubscribeSheet';
import { soundService } from '../../services/soundService';
import { useNavigateToQuiz } from '../../hooks/useNavigateToQuiz';
import { usePremiumStatus } from '../../hooks/usePremiumStatus';
import { RootStackParamList, PracticeStackParamList } from '../../types/navigation';
import { createStyles } from './PracticeScreen.styles';

type NavigationProp = NativeStackNavigationProp<PracticeStackParamList & RootStackParamList>;

export function PracticeScreen(): React.JSX.Element {
  const intl = useIntl();
  const navigation = useNavigation<NavigationProp>();
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { navigateToQuiz, dailyQuizLimitModalUI } = useNavigateToQuiz(navigation);
  const isPremium = usePremiumStatus();
  const [showPremiumSheet, setShowPremiumSheet] = useState(false);

  const handleStartStandard = () => {
    soundService.playTapSound();
    navigation.navigate('VerbsPracticeList');
  };

  const handleStartSmartQuiz = () => {
    soundService.playTapSound();
    navigateToQuiz({ isSmartQuiz: true });
  };

  return (
    <ScreenBackground>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <ScreenHeader
        title={intl.formatMessage({ id: 'practiceScreen.title' })}
        showBackButton={false}
        leftContent={
          <View style={styles.headerLeftRow}>
            {!isPremium && (
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
          {/* Standard Course Path */}
          <FeaturedStartCard onPress={handleStartStandard} />

          {/* Smart Quiz Mode (derArtikel style) */}
          <SmartQuizCard onPress={handleStartSmartQuiz} />
        </ScrollView>
      </View>
      {dailyQuizLimitModalUI}
      <PremiumSubscribeSheet
        visible={showPremiumSheet}
        onClose={() => setShowPremiumSheet(false)}
        source="home_header_gem"
      />
    </ScreenBackground>
  );
}
