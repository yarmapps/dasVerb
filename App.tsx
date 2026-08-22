import React from 'react';
import { View, Text, SafeAreaView, useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { lightColors, darkColors } from './src/styles/themeColors';
import { createStyles } from './App.styles';

export default function App(): React.JSX.Element {
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'light' ? lightColors : darkColors;
  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style={colorScheme === 'light' ? 'dark' : 'light'} />
      <View style={styles.container}>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>dasVerb • A1–B2</Text>
        </View>

        <Text style={styles.title}>dasVerb</Text>
        <Text style={styles.subtitle}>
          Интерактивный тренажер немецких глаголов, управления и грамматической рамки
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>База данных готова</Text>
          <Text style={styles.cardDescription}>
            В проекте загружено 20 базовых карточек глаголов со всеми грамматическими свойствами,
            спряжениями и примерами.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
