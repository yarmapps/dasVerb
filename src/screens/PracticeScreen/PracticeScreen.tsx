import React, { useMemo } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FontAwesome5 } from '@expo/vector-icons';
import { useIntl } from 'react-intl';
import { useAppTheme } from '../../context/ThemeContext';
import { ScreenHeader } from '../../components/ScreenHeader/ScreenHeader';
import { FeaturedStartCard } from '../../components/FeaturedStartCard/FeaturedStartCard';
import { RootStackParamList } from '../../types/navigation';
import { createStyles } from './PracticeScreen.styles';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function PracticeScreen(): React.JSX.Element {
  const intl = useIntl();
  const navigation = useNavigation<NavigationProp>();
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
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
        {/* Featured Practice Card (derArtikel style) as first element */}
        <FeaturedStartCard onPress={() => navigation.navigate('VerbsPracticeList')} />
      </View>
    </SafeAreaView>
  );
}
