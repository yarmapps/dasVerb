import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useIntl } from 'react-intl';
import appConfig from '../../../app.json';
import { ScreenHeader } from '../../components/ScreenHeader/ScreenHeader';
import { ScreenBackground } from '../../components/ScreenBackground/ScreenBackground';
import { RootStackParamList } from '../../types/navigation';
import { useAppTheme } from '../../context/ThemeContext';
import {
  getDailyCompletedQuizzesCount,
  getFreeDailyQuizzes,
  getExtraQuizzesCount,
  getAdGrantsToday,
  getMaxAdGrantsPerDay,
  resetDailyQuizLimits,
  grantExtraQuiz,
  incrementDailyCompletedQuizzes,
  resetFirstOpenPaywall,
} from '../../services/usageService';
import {
  getStreakState,
  resetStreakData,
  recordStreakActivity,
} from '../../services/streakService';
import { getSettings, updateSettings, resetAllSettings } from '../../services/settingsService';
import { resetAllStorages } from '../../services/storageService';
import { progressService } from '../../services/progressService';
import { setPremiumEnabled, isPremiumEnabled } from '../../services/premiumAccessService';
import {
  isFeatureEnabled,
  getFeatureOverride,
  setFeatureOverride,
  resetAllFeatureOverrides,
  FeatureFlagName,
} from '../../services/featuresService';
import { triggerDebugAppUpdate } from '../../hooks/useAppUpdate';
import { forceRequestReview } from '../../services/reviewService';
import { createStyles } from './DebugScreen.styles';

type DebugScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function DebugScreen(): React.JSX.Element {
  const intl = useIntl();
  const navigation = useNavigation<DebugScreenNavigationProp>();
  const { colors, isDark, setThemeMode } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [refreshKey, setRefreshKey] = useState(0);

  const refreshState = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  const completedToday = getDailyCompletedQuizzesCount();
  const freeLimit = getFreeDailyQuizzes();
  const extraQuizzes = getExtraQuizzesCount();
  const adGrants = getAdGrantsToday();
  const maxAdGrants = getMaxAdGrantsPerDay();
  const streakState = getStreakState();
  const currentSettings = getSettings();
  const isPremiumUser = isPremiumEnabled();

  const handleToggleFeature = (name: FeatureFlagName, value: boolean | null) => {
    setFeatureOverride(name, value);
    refreshState();
  };

  const handleTogglePremiumUser = (enabled: boolean) => {
    setPremiumEnabled(enabled);
    refreshState();
  };

  const handleResetFeatureOverrides = () => {
    resetAllFeatureOverrides();
    refreshState();
    Alert.alert('Success', 'All feature overrides have been reset to default values.');
  };

  const handleResetDailyLimit = () => {
    resetDailyQuizLimits();
    refreshState();
    Alert.alert(
      intl.formatMessage({ id: 'debugScreen.alertSuccess' }),
      intl.formatMessage({ id: 'debugScreen.dailyLimitResetSuccess' }),
    );
  };

  const handleGrantExtraQuiz = () => {
    grantExtraQuiz();
    refreshState();
  };

  const handleConsumeQuiz = () => {
    incrementDailyCompletedQuizzes();
    refreshState();
  };

  const handleResetStreak = () => {
    resetStreakData();
    refreshState();
    Alert.alert(
      intl.formatMessage({ id: 'debugScreen.alertSuccess' }),
      intl.formatMessage({ id: 'debugScreen.streakResetSuccess' }),
    );
  };

  const handleIncrementStreak = () => {
    recordStreakActivity();
    refreshState();
  };

  const handleResetAllSettings = () => {
    resetAllSettings();
    setThemeMode('system');
    refreshState();
    Alert.alert(
      intl.formatMessage({ id: 'debugScreen.alertSuccess' }),
      intl.formatMessage({ id: 'debugScreen.settingsResetSuccess' }),
    );
  };

  const handleResetAllMMKV = () => {
    resetAllStorages();
    resetAllSettings();
    resetStreakData();
    resetDailyQuizLimits();
    resetFirstOpenPaywall();
    resetAllFeatureOverrides();
    progressService.clearAllProgress();
    setPremiumEnabled(false);
    setThemeMode('system');
    refreshState();
    Alert.alert(
      'Full Reset Complete',
      'All MMKV storages, user progress, streak, daily limits, feature overrides, settings, language onboarding and first-open paywall state have been reset to defaults.',
    );
  };

  const handleTriggerSoftUpdate = () => {
    triggerDebugAppUpdate('soft');
  };

  const handleTriggerForceUpdate = () => {
    triggerDebugAppUpdate('force');
  };

  const handleResetUpdateState = () => {
    triggerDebugAppUpdate(null);
  };

  const handleTriggerReview = async () => {
    const success = await forceRequestReview();
    refreshState();
    Alert.alert(
      intl.formatMessage({ id: 'debugScreen.alertSuccess' }),
      success
        ? intl.formatMessage({ id: 'debugScreen.reviewTriggerSuccess' })
        : 'StoreReview is not available on this device/simulator.',
    );
  };

  const handleResetReviewCooldown = () => {
    updateSettings({ lastReviewPromptDate: null });
    refreshState();
    Alert.alert(
      intl.formatMessage({ id: 'debugScreen.alertSuccess' }),
      intl.formatMessage({ id: 'debugScreen.reviewCooldownResetSuccess' }),
    );
  };

  const handleAddCompletedQuizzes = () => {
    const updatedCount = (currentSettings.completedQuizCount || 0) + 5;
    updateSettings({ completedQuizCount: updatedCount });
    refreshState();
  };

  const renderFeatureRow = (flag: FeatureFlagName, title: string) => {
    const isEnabled = isFeatureEnabled(flag);
    const override = getFeatureOverride(flag);
    const hasOverride = override !== null;

    let statusLabel = isEnabled ? 'ON' : 'OFF';
    if (hasOverride) {
      statusLabel += ' (OVERRIDE)';
    } else {
      statusLabel += ' (DEFAULT)';
    }

    return (
      <View key={flag} style={styles.featureRow}>
        <View style={styles.featureHeader}>
          <Text style={styles.featureTitle}>{title}</Text>
          <View
            style={[
              styles.featureTag,
              isEnabled ? styles.featureTagActive : styles.featureTagInactive,
            ]}
          >
            <Text
              style={[
                styles.featureTagText,
                isEnabled ? styles.featureTagActiveText : styles.featureTagInactiveText,
              ]}
            >
              {statusLabel}
            </Text>
          </View>
        </View>

        <View style={styles.toggleGrid}>
          <TouchableOpacity
            style={[styles.toggleBtn, override === true && styles.toggleBtnActiveOn]}
            onPress={() => handleToggleFeature(flag, true)}
            activeOpacity={0.7}
            testID={`debug-feature-${flag}-on`}
          >
            <Text style={[styles.toggleBtnText, override === true && styles.toggleBtnTextActive]}>
              {override === true ? '✓ ' : ''}ON
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toggleBtn, override === false && styles.toggleBtnActiveOff]}
            onPress={() => handleToggleFeature(flag, false)}
            activeOpacity={0.7}
            testID={`debug-feature-${flag}-off`}
          >
            <Text style={[styles.toggleBtnText, override === false && styles.toggleBtnTextActive]}>
              {override === false ? '✓ ' : ''}OFF
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toggleBtn, override === null && styles.toggleBtnActiveDefault]}
            onPress={() => handleToggleFeature(flag, null)}
            activeOpacity={0.7}
            testID={`debug-feature-${flag}-default`}
          >
            <Text style={[styles.toggleBtnText, override === null && styles.toggleBtnTextActive]}>
              {override === null ? '✓ ' : ''}Default
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <ScreenBackground key={refreshKey}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <ScreenHeader
        title={intl.formatMessage({ id: 'debugScreen.title' })}
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
        showStreak={false}
      />
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* APP STATE SUMMARY */}
        <Text style={styles.sectionTitle}>
          {intl.formatMessage({ id: 'debugScreen.sectionState' })}
        </Text>
        <View style={styles.sectionContainer}>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>
              {intl.formatMessage(
                { id: 'debugScreen.dailyQuizzes' },
                { count: completedToday, limit: freeLimit },
              )}
            </Text>
            <Text style={styles.statusValue}>{`${completedToday}/${freeLimit}`}</Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>
              {intl.formatMessage({ id: 'debugScreen.extraQuizzes' }, { count: extraQuizzes })}
            </Text>
            <Text style={styles.statusValue}>{extraQuizzes}</Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>
              {intl.formatMessage(
                { id: 'debugScreen.totalQuizzes' },
                { count: currentSettings.completedQuizCount || 0 },
              )}
            </Text>
            <Text style={styles.statusValue}>{currentSettings.completedQuizCount || 0}</Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>
              {intl.formatMessage(
                { id: 'debugScreen.adGrants' },
                { count: adGrants, limit: maxAdGrants },
              )}
            </Text>
            <Text style={styles.statusValue}>{`${adGrants}/${maxAdGrants}`}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>User Premium Status</Text>
            <Text style={styles.statusValue}>{isPremiumUser ? '👑 Active Pro' : 'Free User'}</Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>ENABLE_PREMIUM Feature</Text>
            <Text style={styles.statusValue}>
              {isFeatureEnabled('ENABLE_PREMIUM') ? 'Active' : 'Inactive'}
            </Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>ENABLE_ADS Feature</Text>
            <Text style={styles.statusValue}>
              {isFeatureEnabled('ENABLE_ADS') ? 'Active' : 'Inactive'}
            </Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>ENABLE_ANALYTICS Feature</Text>
            <Text style={styles.statusValue}>
              {isFeatureEnabled('ENABLE_ANALYTICS') ? 'Active' : 'Inactive'}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>
              {intl.formatMessage(
                { id: 'debugScreen.streakSummary' },
                { streak: streakState.currentStreak, best: streakState.bestStreak },
              )}
            </Text>
            <Text style={styles.statusValue}>{`🔥 ${streakState.currentStreak}`}</Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Last Review Prompt</Text>
            <Text style={styles.statusValue}>
              {currentSettings.lastReviewPromptDate
                ? currentSettings.lastReviewPromptDate.split('T')[0]
                : 'Never'}
            </Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Version</Text>
            <Text style={styles.statusValue}>{appConfig.expo.version}</Text>
          </View>
        </View>

        {/* FEATURES & FEATURE FLAGS SECTION */}
        <Text style={styles.sectionTitle}>FEATURES & DYNAMIC OVERRIDES</Text>
        <View style={styles.sectionContainer}>
          {renderFeatureRow('ENABLE_PREMIUM', 'ENABLE_PREMIUM (RevenueCat & Paywalls)')}
          {renderFeatureRow('ENABLE_ADS', 'ENABLE_ADS (Google Mobile Ads)')}
          {renderFeatureRow('ENABLE_ANALYTICS', 'ENABLE_ANALYTICS (Firebase GA4)')}

          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonWarning]}
            onPress={handleResetFeatureOverrides}
            activeOpacity={0.7}
            testID="debug-reset-feature-overrides"
          >
            <FontAwesome5 name="undo" size={14} color="#ffffff" style={styles.buttonIcon} />
            <Text style={styles.actionButtonTextLight}>Reset All Feature Overrides</Text>
          </TouchableOpacity>
        </View>

        {/* USER PREMIUM STATUS SECTION */}
        <Text style={styles.sectionTitle}>USER PREMIUM STATUS (SUBSCRIPTION)</Text>
        <View style={styles.sectionContainer}>
          <View style={styles.featureHeader}>
            <Text style={styles.featureTitle}>Simulate Premium Subscription</Text>
            <View
              style={[
                styles.featureTag,
                isPremiumUser ? styles.featureTagActive : styles.featureTagInactive,
              ]}
            >
              <Text
                style={[
                  styles.featureTagText,
                  isPremiumUser ? styles.featureTagActiveText : styles.featureTagInactiveText,
                ]}
              >
                {isPremiumUser ? '👑 PRO ACTIVE' : 'FREE USER'}
              </Text>
            </View>
          </View>

          <View style={styles.toggleGrid}>
            <TouchableOpacity
              style={[styles.toggleBtn, isPremiumUser && styles.toggleBtnActiveOn]}
              onPress={() => handleTogglePremiumUser(true)}
              activeOpacity={0.7}
              testID="debug-premium-user-on"
            >
              <Text style={[styles.toggleBtnText, isPremiumUser && styles.toggleBtnTextActive]}>
                {isPremiumUser ? '✓ ' : ''}👑 Premium User ON
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.toggleBtn, !isPremiumUser && styles.toggleBtnActiveOff]}
              onPress={() => handleTogglePremiumUser(false)}
              activeOpacity={0.7}
              testID="debug-premium-user-off"
            >
              <Text style={[styles.toggleBtnText, !isPremiumUser && styles.toggleBtnTextActive]}>
                {!isPremiumUser ? '✓ ' : ''}Free User OFF
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* IN-APP REVIEW SECTION */}
        <Text style={styles.sectionTitle}>
          {intl.formatMessage({ id: 'debugScreen.sectionReview' })}
        </Text>
        <View style={styles.sectionContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonPrimary]}
            onPress={handleTriggerReview}
            activeOpacity={0.7}
            testID="debug-trigger-review"
          >
            <FontAwesome5 name="star" size={14} color="#ffffff" style={styles.buttonIcon} />
            <Text style={styles.actionButtonTextLight}>
              {intl.formatMessage({ id: 'debugScreen.triggerReview' })}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonSecondary]}
            onPress={handleAddCompletedQuizzes}
            activeOpacity={0.7}
            testID="debug-add-completed-quizzes"
          >
            <FontAwesome5
              name="plus"
              size={14}
              color={colors.textPrimary}
              style={styles.buttonIcon}
            />
            <Text style={styles.actionButtonTextDark}>
              {intl.formatMessage({ id: 'debugScreen.addCompletedQuizzes' })}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonWarning]}
            onPress={handleResetReviewCooldown}
            activeOpacity={0.7}
            testID="debug-reset-review-cooldown"
          >
            <FontAwesome5 name="history" size={14} color="#ffffff" style={styles.buttonIcon} />
            <Text style={styles.actionButtonTextLight}>
              {intl.formatMessage({ id: 'debugScreen.resetReviewCooldown' })}
            </Text>
          </TouchableOpacity>
        </View>

        {/* DAILY LIMIT SECTION */}
        <Text style={styles.sectionTitle}>
          {intl.formatMessage({ id: 'debugScreen.sectionDailyLimit' })}
        </Text>
        <View style={styles.sectionContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonDanger]}
            onPress={handleResetDailyLimit}
            activeOpacity={0.7}
            testID="debug-reset-daily-limit"
          >
            <FontAwesome5 name="redo-alt" size={14} color="#ffffff" style={styles.buttonIcon} />
            <Text style={styles.actionButtonTextLight}>
              {intl.formatMessage({ id: 'debugScreen.resetDailyLimit' })}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonSecondary]}
            onPress={handleGrantExtraQuiz}
            activeOpacity={0.7}
            testID="debug-grant-extra-quiz"
          >
            <FontAwesome5
              name="plus"
              size={14}
              color={colors.textPrimary}
              style={styles.buttonIcon}
            />
            <Text style={styles.actionButtonTextDark}>
              {intl.formatMessage({ id: 'debugScreen.grantExtraQuiz' })}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonSecondary]}
            onPress={handleConsumeQuiz}
            activeOpacity={0.7}
            testID="debug-consume-quiz"
          >
            <FontAwesome5
              name="minus"
              size={14}
              color={colors.textPrimary}
              style={styles.buttonIcon}
            />
            <Text style={styles.actionButtonTextDark}>
              {intl.formatMessage({ id: 'debugScreen.consumeQuiz' })}
            </Text>
          </TouchableOpacity>
        </View>

        {/* STREAK SECTION */}
        <Text style={styles.sectionTitle}>
          {intl.formatMessage({ id: 'debugScreen.sectionStreak' })}
        </Text>
        <View style={styles.sectionContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonDanger]}
            onPress={handleResetStreak}
            activeOpacity={0.7}
            testID="debug-reset-streak"
          >
            <FontAwesome5 name="fire-alt" size={14} color="#ffffff" style={styles.buttonIcon} />
            <Text style={styles.actionButtonTextLight}>
              {intl.formatMessage({ id: 'debugScreen.resetStreak' })}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonSecondary]}
            onPress={handleIncrementStreak}
            activeOpacity={0.7}
            testID="debug-increment-streak"
          >
            <FontAwesome5
              name="plus"
              size={14}
              color={colors.textPrimary}
              style={styles.buttonIcon}
            />
            <Text style={styles.actionButtonTextDark}>
              {intl.formatMessage({ id: 'debugScreen.incrementStreak' })}
            </Text>
          </TouchableOpacity>
        </View>

        {/* SETTINGS SECTION */}
        <Text style={styles.sectionTitle}>
          {intl.formatMessage({ id: 'debugScreen.sectionSettings' })}
        </Text>
        <View style={styles.sectionContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonWarning]}
            onPress={handleResetAllSettings}
            activeOpacity={0.7}
            testID="debug-reset-all-settings"
          >
            <FontAwesome5 name="trash" size={14} color="#ffffff" style={styles.buttonIcon} />
            <Text style={styles.actionButtonTextLight}>
              {intl.formatMessage({ id: 'debugScreen.resetAllSettings' })}
            </Text>
          </TouchableOpacity>
        </View>

        {/* FULL APP & MMKV RESET SECTION */}
        <Text style={styles.sectionTitle}>FULL STORAGE & DATA RESET</Text>
        <View style={styles.sectionContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonDanger]}
            onPress={handleResetAllMMKV}
            activeOpacity={0.7}
            testID="debug-reset-all-mmkv"
          >
            <FontAwesome5 name="bomb" size={14} color="#ffffff" style={styles.buttonIcon} />
            <Text style={styles.actionButtonTextLight}>Reset All MMKV to Defaults</Text>
          </TouchableOpacity>
        </View>

        {/* FIRST OPEN PAYWALL SECTION */}
        <Text style={styles.sectionTitle}>FIRST OPEN PAYWALL</Text>
        <View style={styles.sectionContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonPrimary]}
            onPress={() => navigation.navigate('FirstOpenPaywall', { isDebugPreview: true })}
            activeOpacity={0.7}
            testID="debug-open-first-open-paywall"
          >
            <FontAwesome5 name="gem" size={14} color="#ffffff" style={styles.buttonIcon} />
            <Text style={styles.actionButtonTextLight}>Open First Open Paywall</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonSecondary]}
            onPress={() => {
              resetFirstOpenPaywall();
              refreshState();
              Alert.alert('Success', 'First open paywall state reset!');
            }}
            activeOpacity={0.7}
            testID="debug-reset-first-open-paywall"
          >
            <FontAwesome5
              name="redo"
              size={14}
              color={colors.textPrimary}
              style={styles.buttonIcon}
            />
            <Text style={styles.actionButtonTextDark}>Reset Seen State</Text>
          </TouchableOpacity>
        </View>

        {/* APP UPDATE SECTION */}
        <Text style={styles.sectionTitle}>
          {intl.formatMessage({ id: 'debugScreen.sectionAppUpdate' })}
        </Text>
        <View style={styles.sectionContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonPrimary]}
            onPress={handleTriggerSoftUpdate}
            activeOpacity={0.7}
            testID="debug-trigger-soft-update"
          >
            <Ionicons
              name="cloud-download-outline"
              size={16}
              color="#ffffff"
              style={styles.buttonIcon}
            />
            <Text style={styles.actionButtonTextLight}>
              {intl.formatMessage({ id: 'debugScreen.triggerSoftUpdate' })}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonDanger]}
            onPress={handleTriggerForceUpdate}
            activeOpacity={0.7}
            testID="debug-trigger-force-update"
          >
            <Ionicons name="warning-outline" size={16} color="#ffffff" style={styles.buttonIcon} />
            <Text style={styles.actionButtonTextLight}>
              {intl.formatMessage({ id: 'debugScreen.triggerForceUpdate' })}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonSecondary]}
            onPress={handleResetUpdateState}
            activeOpacity={0.7}
            testID="debug-reset-update-state"
          >
            <Ionicons
              name="refresh-outline"
              size={16}
              color={colors.textPrimary}
              style={styles.buttonIcon}
            />
            <Text style={styles.actionButtonTextDark}>
              {intl.formatMessage({ id: 'debugScreen.resetUpdateState' })}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenBackground>
  );
}
