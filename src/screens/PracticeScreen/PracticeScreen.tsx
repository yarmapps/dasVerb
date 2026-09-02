import React, { useMemo } from 'react';
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
import { soundService } from '../../services/soundService';
import { useNavigateToQuiz } from '../../hooks/useNavigateToQuiz';
import { RootStackParamList, PracticeStackParamList } from '../../types/navigation';
import { createStyles } from './PracticeScreen.styles';

type NavigationProp = NativeStackNavigationProp<PracticeStackParamList & RootStackParamList>;

export function PracticeScreen(): React.JSX.Element {
  const intl = useIntl();
  const navigation = useNavigation<NavigationProp>();
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { navigateToQuiz, dailyQuizLimitModalUI } = useNavigateToQuiz(navigation);

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
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.navigate('Settings')}
            testID="settings-button"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <FontAwesome5 name="cog" size={18} color={colors.textPrimary} />
          </TouchableOpacity>
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
    </ScreenBackground>
  );
}
