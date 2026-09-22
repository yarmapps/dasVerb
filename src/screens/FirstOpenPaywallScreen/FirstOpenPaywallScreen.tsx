import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  LayoutChangeEvent,
  ViewToken,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import { useNavigation, useRoute, CommonActions, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useIntl } from 'react-intl';
import { RootStackParamList } from '../../types/navigation';
import { useAppTheme } from '../../context/ThemeContext';
import { ScreenBackground } from '../../components/ScreenBackground/ScreenBackground';
import { TimelineStep } from '../../components/TimelineStep/TimelineStep';
import { createStyles } from './FirstOpenPaywallScreen.styles';
import {
  getMappedPackages,
  MappedPackages,
  purchasePackage,
  restorePurchases,
} from '../../services/revenueCatService';
import { trackEvent } from '../../services/analyticsService';
import { markFirstOpenPaywallSeen } from '../../services/usageService';
import { isFeatureEnabled } from '../../services/featuresService';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'FirstOpenPaywall'>;
type RoutePropType = RouteProp<RootStackParamList, 'FirstOpenPaywall'>;

type BenefitKey = 'noAds' | 'unlimitedQuizzes' | 'offlineMode' | 'allLevels' | 'smartQuizMode';

const BENEFIT_KEYS: BenefitKey[] = [
  'noAds',
  'unlimitedQuizzes',
  'offlineMode',
  'allLevels',
  'smartQuizMode',
];

export function FirstOpenPaywallScreen(): React.JSX.Element | null {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RoutePropType>();
  const isDebugPreview = route.params?.isDebugPreview === true;
  const intl = useIntl();
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  const [packages, setPackages] = useState<MappedPackages | null>(null);
  const [isLoadingPackages, setIsLoadingPackages] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [activeBenefit, setActiveBenefit] = useState(0);
  const [slideWidth, setSlideWidth] = useState(0);
  const benefitsListRef = useRef<FlatList<BenefitKey>>(null);
  const autoTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const userTouchedRef = useRef(false);

  const goToMainTabs = useCallback(() => {
    markFirstOpenPaywallSeen();
    if (isDebugPreview && navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'MainTabs' }],
        }),
      );
    }
  }, [navigation, isDebugPreview]);

  useEffect(() => {
    if (!isFeatureEnabled('ENABLE_PREMIUM') && !isDebugPreview) {
      goToMainTabs();
      return;
    }

    let isCancelled = false;
    setIsLoadingPackages(true);
    getMappedPackages()
      .then(mapped => {
        if (!isCancelled) {
          setPackages(mapped);
        }
      })
      .catch(error => {
        if (__DEV__) {
          // eslint-disable-next-line no-console
          console.warn('[FirstOpenPaywall] Failed to load packages:', error);
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoadingPackages(false);
        }
      });

    trackEvent('first_open_paywall_shown', {});

    return () => {
      isCancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClose = useCallback(() => {
    trackEvent('first_open_paywall_close_clicked', {});
    goToMainTabs();
  }, [goToMainTabs]);

  const handleProceedLimited = useCallback(() => {
    trackEvent('first_open_paywall_limited_clicked', {});
    goToMainTabs();
  }, [goToMainTabs]);

  const handlePurchase = async () => {
    const targetPackage =
      packages?.threeMonth?.pkg ??
      packages?.yearly?.pkg ??
      packages?.monthly?.pkg ??
      packages?.lifetime?.pkg;
    if (!targetPackage) {
      Alert.alert(
        intl.formatMessage({ id: 'premiumSheets.errorTitle' }),
        intl.formatMessage({ id: 'premiumSheets.errorUnavailable' }),
      );
      return;
    }

    trackEvent('first_open_paywall_buy_clicked', {});
    setIsPurchasing(true);
    try {
      const isSuccess = await purchasePackage(targetPackage);
      if (isSuccess) {
        trackEvent('first_open_paywall_purchase_complete', {});
        goToMainTabs();
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      Alert.alert(intl.formatMessage({ id: 'premiumSheets.errorTitle' }), message);
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleRestore = async () => {
    trackEvent('first_open_paywall_restore_clicked', {});
    setIsPurchasing(true);
    try {
      const isRestored = await restorePurchases();
      if (isRestored) {
        trackEvent('first_open_paywall_restore_complete', {});
        Alert.alert(
          intl.formatMessage({ id: 'premiumSheets.restoreSuccessTitle' }),
          intl.formatMessage({ id: 'premiumSheets.restoreSuccessMessage' }),
        );
        goToMainTabs();
      } else {
        Alert.alert(
          intl.formatMessage({ id: 'premiumSheets.restoreNothingTitle' }),
          intl.formatMessage({ id: 'premiumSheets.restoreNothingMessage' }),
        );
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      Alert.alert(intl.formatMessage({ id: 'premiumSheets.errorTitle' }), message);
    } finally {
      setIsPurchasing(false);
    }
  };

  const heroPackage = packages?.threeMonth ?? packages?.yearly;
  const day3Subline = heroPackage
    ? intl.formatMessage(
        { id: 'firstOpenPaywall.price3MonthsWithCoffee' },
        { price: heroPackage.priceString },
      )
    : undefined;

  const handleBenefitsLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    if (width > 0 && width !== slideWidth) {
      setSlideWidth(width);
    }
  };

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 60 }).current;
  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index != null) {
      setActiveBenefit(viewableItems[0].index);
    }
  }).current;

  const stopAutoAdvance = useCallback(() => {
    if (autoTimerRef.current) {
      clearInterval(autoTimerRef.current);
      autoTimerRef.current = null;
    }
  }, []);

  const startAutoAdvance = useCallback(() => {
    stopAutoAdvance();
    autoTimerRef.current = setInterval(() => {
      if (userTouchedRef.current) return;
      setActiveBenefit(previousIndex => {
        const nextIndex = (previousIndex + 1) % BENEFIT_KEYS.length;
        benefitsListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
        return nextIndex;
      });
    }, 3500);
  }, [stopAutoAdvance]);

  useEffect(() => {
    if (slideWidth > 0) {
      startAutoAdvance();
    }
    return stopAutoAdvance;
  }, [slideWidth, startAutoAdvance, stopAutoAdvance]);

  const handleBenefitsScrollBegin = () => {
    userTouchedRef.current = true;
    stopAutoAdvance();
  };

  const handleBenefitsMomentumEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (slideWidth <= 0) return;
    const index = Math.round(event.nativeEvent.contentOffset.x / slideWidth);
    setActiveBenefit(index);
    userTouchedRef.current = false;
    startAutoAdvance();
  };

  const getIconForBenefit = (benefitKey: BenefitKey) => {
    switch (benefitKey) {
      case 'noAds':
        return 'ban';
      case 'unlimitedQuizzes':
        return 'infinity';
      case 'allLevels':
        return 'layer-group';
      case 'smartQuizMode':
        return 'brain';
      default:
        return 'check';
    }
  };

  const renderBenefit = ({ item }: { item: BenefitKey }) => (
    <View style={[styles.benefitSlide, { width: slideWidth }]}>
      <View style={styles.benefitCard}>
        <View style={styles.benefitIconContainer}>
          <FontAwesome5
            name={getIconForBenefit(item)}
            size={18}
            color={isDark ? colors.premiumHighlight : colors.primary}
          />
        </View>
        <View style={styles.benefitTextContainer}>
          <Text style={styles.benefitTitle}>
            {intl.formatMessage({ id: `firstOpenPaywall.timeline.today.benefits.${item}.title` })}
          </Text>
          <Text style={styles.benefitBody}>
            {intl.formatMessage({ id: `firstOpenPaywall.timeline.today.benefits.${item}.text` })}
          </Text>
        </View>
      </View>
    </View>
  );

  const todayNestedContent = (
    <View onLayout={handleBenefitsLayout}>
      {slideWidth > 0 ? (
        <>
          <FlatList
            ref={benefitsListRef}
            data={BENEFIT_KEYS}
            keyExtractor={itemKey => itemKey}
            renderItem={renderBenefit}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={styles.benefitsCarousel}
            onScrollBeginDrag={handleBenefitsScrollBegin}
            onMomentumScrollEnd={handleBenefitsMomentumEnd}
            viewabilityConfig={viewabilityConfig}
            onViewableItemsChanged={onViewableItemsChanged}
            getItemLayout={(_, index) => ({
              length: slideWidth,
              offset: slideWidth * index,
              index,
            })}
          />
          <View style={styles.dotsContainer}>
            {BENEFIT_KEYS.map((key, index) => (
              <View
                key={key}
                style={[styles.dot, activeBenefit === index ? styles.dotActive : null]}
              />
            ))}
          </View>
        </>
      ) : null}
    </View>
  );

  if (!isFeatureEnabled('ENABLE_PREMIUM') && !isDebugPreview) {
    return null;
  }

  const connectorColor = colors.blockBorder;
  const dayIconColor = isDark ? '#c5bdefff' : '#b16650ff';
  const dayIconBg = 'transparent';

  return (
    <ScreenBackground>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.topBar}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleRestore}
            disabled={isPurchasing}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            testID="first-open-paywall-restore"
          >
            <Text style={styles.restoreText}>
              {intl.formatMessage({ id: 'firstOpenPaywall.restore' })}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleClose}
            disabled={isPurchasing}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            testID="first-open-paywall-close"
            style={styles.closeButton}
          >
            <FontAwesome5 name="times" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.trialBadge}>
              <Text style={styles.trialBadgeText}>
                {intl.formatMessage({ id: 'firstOpenPaywall.trialBadge' })}
              </Text>
            </View>
            <Text style={styles.title}>
              {intl
                .formatMessage({ id: 'firstOpenPaywall.title' })
                .split(/(Premium)/i)
                .map((part, index) =>
                  part.toLowerCase() === 'premium' ? (
                    <Text key={index} style={{ color: colors.premiumDiamond }}>
                      {part}
                    </Text>
                  ) : (
                    part
                  ),
                )}
            </Text>
          </View>

          <View style={styles.timeline}>
            <TimelineStep
              icon="gem"
              iconColor={colors.premiumDiamond}
              iconBgColor={`${colors.premiumDiamond.slice(0, 7)}30`}
              connectorColor={connectorColor}
              showConnector
              day={intl.formatMessage({ id: 'firstOpenPaywall.timeline.today.day' })}
              headline={intl.formatMessage({ id: 'firstOpenPaywall.timeline.today.headline' })}
            >
              {todayNestedContent}
            </TimelineStep>

            <TimelineStep
              icon="envelope"
              iconColor={dayIconColor}
              iconBgColor={dayIconBg}
              iconBorderColor={connectorColor}
              connectorColor={connectorColor}
              showConnector
              day={intl.formatMessage({ id: 'firstOpenPaywall.timeline.day2.day' })}
              headline={intl.formatMessage({ id: 'firstOpenPaywall.timeline.day2.headline' })}
              description={intl.formatMessage({
                id: 'firstOpenPaywall.timeline.day2.description',
              })}
            />

            <TimelineStep
              icon="credit-card"
              iconColor={dayIconColor}
              iconBgColor={dayIconBg}
              iconBorderColor={connectorColor}
              connectorColor={connectorColor}
              showConnector={false}
              day={intl.formatMessage({ id: 'firstOpenPaywall.timeline.day3.day' })}
              headline={intl.formatMessage({ id: 'firstOpenPaywall.timeline.day3.headline' })}
              subline={day3Subline}
              description={intl.formatMessage({
                id: 'firstOpenPaywall.timeline.day3.description',
              })}
            />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.ctaButton, isPurchasing && styles.ctaButtonDisabled]}
            activeOpacity={0.9}
            onPress={handlePurchase}
            disabled={isPurchasing || isLoadingPackages}
            testID="first-open-paywall-cta"
          >
            {isPurchasing || isLoadingPackages ? (
              <ActivityIndicator
                size="small"
                color={isDark ? colors.premiumHighlightText : colors.white}
              />
            ) : (
              <Text style={styles.ctaText}>
                {intl.formatMessage({ id: 'firstOpenPaywall.cta' })} →
              </Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.proceedLimitedButton}
            activeOpacity={0.7}
            onPress={handleProceedLimited}
            disabled={isPurchasing}
            testID="first-open-paywall-proceed-limited"
          >
            <Text style={styles.proceedLimitedText}>
              {intl.formatMessage({ id: 'firstOpenPaywall.proceedLimited' })}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ScreenBackground>
  );
}
