import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
  Linking,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useIntl } from 'react-intl';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../../context/ThemeContext';
import { ThemeColors } from '../../styles/themeColors';
import { CloseIconButton } from '../CloseIconButton/CloseIconButton';
import { DiamondIcon } from '../DiamondIcon/DiamondIcon';
import {
  getMappedPackages,
  MappedPackages,
  purchasePackage,
  restorePurchases,
  FreeTrialInfo,
} from '../../services/revenueCatService';
import { trackEvent } from '../../services/analyticsService';
import { soundService } from '../../services/soundService';
import { cleanPriceString, formatZeroPrice } from '../../utils/formatZeroPrice';
import { createStyles, SELECTED_GRADIENT_COLORS } from './PremiumSubscribeSheet.styles';

export interface PremiumSubscribeSheetProps {
  visible: boolean;
  onClose: () => void;
  onPurchaseSuccess?: () => void;
  source?: string;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

/* ── Plan definitions ──────────────────────────────────────── */
type PlanId = 'monthly' | 'threeMonth' | 'yearly';

interface Plan {
  id: PlanId;
  labelKey: string;
  subtitleKey: string;
  fallbackPrice: string;
  fallbackPerMonthPrice: string;
  perMonthKey: string;
  badgeKey?: string;
  badgeStyle?: 'yellow' | 'solid';
  hasDiscountBadge?: boolean;
  highlightMonthlyPrice?: boolean;
  fallbackTrialInfo?: FreeTrialInfo;
}

const PLANS: Plan[] = [
  {
    id: 'yearly',
    labelKey: 'premiumSheets.plans.oneYearLabel',
    subtitleKey: 'premiumSheets.plans.yearlySubtitle',
    fallbackPrice: '€24.99',
    fallbackPerMonthPrice: '€2.08',
    perMonthKey: 'premiumSheets.plans.perMonth',
    badgeKey: 'premiumSheets.plans.usersChoiceBadge',
    badgeStyle: 'yellow',
    hasDiscountBadge: true,
    highlightMonthlyPrice: true,
    fallbackTrialInfo: { count: 3, unit: 'day' },
  },
  {
    id: 'threeMonth',
    labelKey: 'premiumSheets.plans.threeMonthLabel',
    subtitleKey: 'premiumSheets.plans.threeMonthSubtitle',
    fallbackPrice: '€8.99',
    fallbackPerMonthPrice: '€3.00',
    perMonthKey: 'premiumSheets.plans.perMonth',
  },
  {
    id: 'monthly',
    labelKey: 'premiumSheets.plans.monthlyLabel',
    subtitleKey: 'premiumSheets.plans.monthlySubtitle',
    fallbackPrice: '€3.99',
    fallbackPerMonthPrice: '€3.99',
    perMonthKey: 'premiumSheets.plans.perMonth',
  },
];

/* ── Feature badges (horizontal marquee) ───────────────────── */
const getFeatures = (colors: ThemeColors) => [
  {
    key: 'noAds',
    icon: <FontAwesome5 name="ban" size={18} color={colors.white} />,
    bgColor: colors.featureBadges.blue,
  },
  {
    key: 'unlimitedQuizzes',
    icon: <FontAwesome5 name="infinity" size={18} color={colors.white} />,
    bgColor: colors.featureBadges.green,
  },
  {
    key: 'offlineMode',
    icon: <FontAwesome5 name="plane" size={18} color={colors.white} />,
    bgColor: colors.featureBadges.yellow,
  },
  {
    key: 'allLevels',
    icon: <FontAwesome5 name="layer-group" size={18} color={colors.white} />,
    bgColor: colors.featureBadges.purple,
  },
  {
    key: 'smartQuizMode',
    icon: <FontAwesome5 name="brain" size={18} color={colors.white} />,
    bgColor: colors.featureBadges.cyan,
  },
];

export function PremiumSubscribeSheet({
  visible,
  onClose,
  onPurchaseSuccess,
  source = 'unknown',
}: PremiumSubscribeSheetProps): React.JSX.Element {
  const intl = useIntl();
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors, insets), [colors, insets]);

  const [translateY] = useState(() => new Animated.Value(SCREEN_HEIGHT));
  const [overlayOpacity] = useState(() => new Animated.Value(0));
  const sheetHeightRef = useRef(SCREEN_HEIGHT);
  const isClosing = useRef(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanId>('yearly');
  const [packages, setPackages] = useState<MappedPackages | null>(null);
  const [isLoadingPackages, setIsLoadingPackages] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const sheetOpenTimeRef = useRef<number>(0);

  // Animation for features auto-scroll marquee
  const containerWidth = useRef(0);
  const contentWidth = useRef(0);
  const isAutoScrolling = useRef(true);
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);
  const resumeTimer = useRef<NodeJS.Timeout | null>(null);
  const isMovingForward = useRef(true);
  const autoScrollValue = useRef(new Animated.Value(0)).current;
  const currentScrollX = useRef(0);

  useEffect(() => {
    const listener = autoScrollValue.addListener(({ value }) => {
      currentScrollX.current = value;
    });
    return () => autoScrollValue.removeListener(listener);
  }, [autoScrollValue]);

  /* ── Load offerings when sheet opens ──────────────── */
  const loadPackages = useCallback(async () => {
    setIsLoadingPackages(true);
    try {
      const mapped = await getMappedPackages();
      setPackages(mapped);
    } catch (error) {
      if (__DEV__) {
        console.warn('Failed to load packages:', error);
      }
    } finally {
      setIsLoadingPackages(false);
    }
  }, []);

  /* ── Auto-scroll Animation ────────────────────────── */
  const stopAnimation = useCallback(() => {
    animationRef.current?.stop();
    animationRef.current = null;
    if (resumeTimer.current) {
      clearTimeout(resumeTimer.current);
      resumeTimer.current = null;
    }
  }, []);

  const startScrollAnimation = useCallback(() => {
    if (!visible || !isAutoScrolling.current || contentWidth.current <= containerWidth.current) {
      return;
    }

    const maxScroll = contentWidth.current - containerWidth.current;
    if (maxScroll <= 0) {
      return;
    }

    const target = isMovingForward.current ? maxScroll : 0;
    const distance = Math.abs(currentScrollX.current - target);

    if (distance < 1) {
      isMovingForward.current = !isMovingForward.current;
      resumeTimer.current = setTimeout(startScrollAnimation, 700);
      return;
    }

    const duration = distance * 40;

    animationRef.current = Animated.timing(autoScrollValue, {
      toValue: target,
      duration,
      useNativeDriver: true,
      delay: currentScrollX.current === 0 || currentScrollX.current === maxScroll ? 700 : 0,
    });

    animationRef.current.start(result => {
      if (result.finished) {
        isMovingForward.current = !isMovingForward.current;
        resumeTimer.current = setTimeout(startScrollAnimation, 700);
      }
    });
  }, [visible, autoScrollValue]);

  useEffect(() => {
    if (visible && containerWidth.current > 0 && contentWidth.current > 0) {
      startScrollAnimation();
    }
    return () => stopAnimation();
  }, [visible, startScrollAnimation, stopAnimation]);

  /* ── Open / close animation ──────────────────────────── */
  useEffect(() => {
    if (visible) {
      isClosing.current = false;
      setSelectedPlan('yearly');
      setIsPurchasing(false);
      sheetOpenTimeRef.current = Date.now();
      loadPackages();

      trackEvent('paywall_sheet_shown', {
        source,
      });
      trackEvent('premium_sheet_shown', {});

      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 280,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 280,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      translateY.setValue(sheetHeightRef.current || SCREEN_HEIGHT);
      overlayOpacity.setValue(0);
      isClosing.current = false;
      stopAnimation();
      autoScrollValue.setValue(0);
      currentScrollX.current = 0;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, source]);

  const animateClose = () => {
    if (isClosing.current || isPurchasing) {
      return;
    }
    soundService.playTapSound();
    isClosing.current = true;
    const timeSpent = Math.max(0, Math.round((Date.now() - sheetOpenTimeRef.current) / 1000));
    trackEvent('paywall_sheet_dismissed', {
      source,
      time_spent_seconds: timeSpent,
    });

    Animated.parallel([
      Animated.timing(translateY, {
        toValue: sheetHeightRef.current || SCREEN_HEIGHT,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  /* ── Get price display for a plan ──────────────────── */
  const getPriceForPlan = useCallback(
    (plan: Plan): string => {
      const rawPrice =
        (!packages ? plan.fallbackPrice : packages[plan.id]?.priceString) ?? plan.fallbackPrice;
      return cleanPriceString(rawPrice, intl.locale);
    },
    [packages, intl.locale],
  );

  const getPerMonthPrice = (plan: Plan): string => {
    if (!packages) {
      return cleanPriceString(plan.fallbackPerMonthPrice, intl.locale);
    }
    const mapped = packages[plan.id];
    const rawPrice =
      plan.id === 'monthly'
        ? (mapped?.priceString ?? plan.fallbackPerMonthPrice)
        : (mapped?.monthlyPriceString ?? plan.fallbackPerMonthPrice);
    return cleanPriceString(rawPrice, intl.locale);
  };

  const getTrialInfo = useCallback(
    (plan: Plan): FreeTrialInfo | undefined => {
      if (plan.id !== 'yearly') {
        return undefined;
      }
      if (!packages) {
        return plan.fallbackTrialInfo;
      }
      const mapped = packages[plan.id];
      return mapped?.freeTrialInfo ?? plan.fallbackTrialInfo;
    },
    [packages],
  );

  const handlePlanSelect = (plan: Plan) => {
    soundService.playTapSound();
    setSelectedPlan(plan.id);
    const trialInfo = getTrialInfo(plan);
    trackEvent('paywall_plan_selected', {
      plan_id: plan.id,
      price: getPriceForPlan(plan),
      has_free_trial: Boolean(trialInfo),
    });
  };

  const getTrialBadgeKey = (unit: FreeTrialInfo['unit']): string => {
    const keys: Record<FreeTrialInfo['unit'], string> = {
      day: 'premiumSheets.freeTrialDays',
      week: 'premiumSheets.freeTrialWeeks',
      month: 'premiumSheets.freeTrialMonths',
      year: 'premiumSheets.freeTrialYears',
    };
    return keys[unit];
  };

  /* ── Dynamic discount calculation ───────────────────── */
  const getDiscountPercent = (plan: Plan): number | undefined => {
    if (!plan.hasDiscountBadge) {
      return undefined;
    }
    const monthlyPackage = packages?.monthly?.pkg;
    const yearlyPackage = packages?.yearly?.pkg;
    if (
      monthlyPackage &&
      yearlyPackage &&
      monthlyPackage.product.price > 0 &&
      yearlyPackage.product.price > 0
    ) {
      const annualIfMonthly = monthlyPackage.product.price * 12;
      const actualAnnual = yearlyPackage.product.price;
      const discount = Math.round((1 - actualAnnual / annualIfMonthly) * 100);
      return discount > 0 ? discount : undefined;
    }
    return 50;
  };

  /* ── Handle purchase ─────────────────────────────────── */
  const handlePurchase = async () => {
    soundService.playTapSound();
    const selectedPackage = packages?.[selectedPlan]?.pkg;
    if (!selectedPackage) {
      Alert.alert(
        intl.formatMessage({ id: 'premiumSheets.errorTitle' }),
        intl.formatMessage({ id: 'premiumSheets.errorUnavailable' }),
      );
      return;
    }

    setIsPurchasing(true);
    trackEvent('paywall_purchase_started', {
      plan_id: selectedPlan,
      source,
    });

    try {
      const success = await purchasePackage(selectedPackage);
      if (success) {
        trackEvent('paywall_purchase_success', {
          plan_id: selectedPlan,
          source,
        });
        trackEvent('premium_purchase_success', {});
        onPurchaseSuccess?.();
        animateClose();
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const isUserCancelled =
        errorMessage.toLowerCase().includes('cancel') ||
        errorMessage.toLowerCase().includes('user cancelled');

      if (isUserCancelled) {
        trackEvent('paywall_purchase_cancelled', {
          plan_id: selectedPlan,
          source,
        });
      } else {
        trackEvent('paywall_purchase_failed', {
          plan_id: selectedPlan,
          source,
          error_message: errorMessage,
        });
      }

      Alert.alert(
        intl.formatMessage({ id: 'premiumSheets.errorTitle' }),
        errorMessage || intl.formatMessage({ id: 'premiumSheets.errorPurchase' }),
      );
    } finally {
      setIsPurchasing(false);
    }
  };

  /* ── Handle restore ──────────────────────────────────── */
  const handleRestore = async () => {
    soundService.playTapSound();
    setIsPurchasing(true);
    trackEvent('paywall_restore_clicked', { source });
    try {
      const restored = await restorePurchases();
      if (restored) {
        trackEvent('paywall_restore_success', { source });
        trackEvent('premium_restore_success', {});
        Alert.alert(
          intl.formatMessage({ id: 'premiumSheets.restoreSuccessTitle' }),
          intl.formatMessage({ id: 'premiumSheets.restoreSuccessMessage' }),
        );
        onPurchaseSuccess?.();
        animateClose();
      } else {
        trackEvent('paywall_restore_empty', { source });
        Alert.alert(
          intl.formatMessage({ id: 'premiumSheets.restoreNothingTitle' }),
          intl.formatMessage({ id: 'premiumSheets.restoreNothingMessage' }),
        );
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Alert.alert(
        intl.formatMessage({ id: 'premiumSheets.errorTitle' }),
        errorMessage || intl.formatMessage({ id: 'premiumSheets.errorRestore' }),
      );
    } finally {
      setIsPurchasing(false);
    }
  };

  const selectedPlanConfig = useMemo(
    () => PLANS.find(plan => plan.id === selectedPlan) || PLANS[0],
    [selectedPlan],
  );

  const disclaimerText = useMemo(() => {
    const planPrice = getPriceForPlan(selectedPlanConfig);
    const getPeriodId = (id: PlanId): string => {
      switch (id) {
        case 'monthly':
          return 'premiumSheets.periodMonth';
        case 'threeMonth':
          return 'premiumSheets.period3Months';
        case 'yearly':
          return 'premiumSheets.periodYear';
        default:
          return 'premiumSheets.periodMonth';
      }
    };
    const periodString = intl.formatMessage({ id: getPeriodId(selectedPlan) });
    return intl.formatMessage(
      { id: 'premiumSheets.disclaimerAutoRenew' },
      {
        price: planPrice,
        period: periodString,
      },
    );
  }, [intl, selectedPlan, selectedPlanConfig, getPriceForPlan]);

  const renderCtaContent = (): React.JSX.Element => {
    if (isPurchasing) {
      return <ActivityIndicator size="small" color={colors.premiumSecondarySurface} />;
    }

    if (selectedPlan === 'yearly') {
      const zeroPrice = formatZeroPrice(getPriceForPlan(selectedPlanConfig), intl.locale);
      return (
        <>
          <Text style={styles.ctaText}>{intl.formatMessage({ id: 'firstOpenPaywall.cta' })}</Text>
          <Text style={styles.ctaSubtext}>
            {intl.formatMessage(
              { id: 'firstOpenPaywall.ctaSubline' },
              { price: zeroPrice, zeroPrice },
            )}
          </Text>
        </>
      );
    }

    return (
      <>
        <Text style={styles.ctaText}>
          {intl.formatMessage({ id: 'premiumSheets.getFullAccess' })}
        </Text>
        <FontAwesome5
          name="arrow-right"
          size={16}
          color={colors.premiumSecondarySurface}
          style={styles.ctaArrow}
        />
      </>
    );
  };

  return (
    <Modal visible={visible} animationType="none" transparent onRequestClose={animateClose}>
      <View style={styles.overlay}>
        {/* Backdrop */}
        <Animated.View style={[styles.backdrop, { opacity: overlayOpacity }]}>
          <TouchableOpacity style={styles.backdropTouch} activeOpacity={1} onPress={animateClose} />
        </Animated.View>

        {/* Sheet */}
        <Animated.View
          style={[styles.sheet, { transform: [{ translateY }] }]}
          onLayout={event => {
            const { height } = event.nativeEvent.layout;
            sheetHeightRef.current = height;
          }}
          testID="premium-subscribe-sheet"
        >
          <LinearGradient
            colors={colors.premiumGradient}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.gradient}
          >
            {/* Close button */}
            <CloseIconButton
              onPress={animateClose}
              style={styles.closeButton}
              iconColor="rgba(255, 255, 255, 0.85)"
              backgroundColor="rgba(255, 255, 255, 0.10)"
            />

            {/* Restore button */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleRestore}
              disabled={isPurchasing}
              style={styles.restoreButton}
            >
              <Text style={styles.restoreButtonText}>
                {intl.formatMessage({ id: 'premiumSheets.restorePurchases' })}
              </Text>
            </TouchableOpacity>

            <ScrollView
              contentContainerStyle={styles.contentContainer}
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              {/* Header: Diamond icon + Title & subtitle */}
              <View style={styles.headerSection}>
                <View style={styles.diamondContainer}>
                  <DiamondIcon size={52} />
                </View>

                <Text style={styles.title}>
                  {intl.formatMessage({ id: 'premiumSheets.subscribeTitle' })}
                </Text>
                <Text style={styles.subtitle}>
                  {intl.formatMessage({ id: 'premiumSheets.subscribeSubtitle' })}
                </Text>
              </View>

              {/* ── Pricing cards (Vertical) ──────────────── */}
              <View style={styles.plansColumn}>
                {PLANS.map(plan => {
                  const isSelected = selectedPlan === plan.id;
                  const perMonthPrice = getPerMonthPrice(plan);
                  const trialInfo = getTrialInfo(plan);
                  const isLongCurrency = perMonthPrice.replace(/[0-9\s.,]/g, '').length > 2;

                  const formattedPerMonth = intl.formatMessage(
                    { id: plan.perMonthKey },
                    { price: isLoadingPackages ? '...' : perMonthPrice },
                  );

                  const topBadgeText = (() => {
                    if (!plan.badgeKey) {
                      return undefined;
                    }
                    const baseBadge = intl.formatMessage({ id: plan.badgeKey });
                    if (plan.id === 'yearly' && trialInfo) {
                      const trialStr = intl
                        .formatMessage(
                          { id: getTrialBadgeKey(trialInfo.unit) },
                          { count: trialInfo.count },
                        )
                        .replace(/(\d+)\s+/g, '$1\u00A0');
                      return `${baseBadge} • ${trialStr}`;
                    }
                    return baseBadge;
                  })();

                  const discountPercent = getDiscountPercent(plan);

                  return (
                    <TouchableOpacity
                      key={plan.id}
                      style={[
                        styles.planCard,
                        topBadgeText ? styles.planCardWithBadge : undefined,
                        isSelected && styles.planCardSelected,
                      ]}
                      activeOpacity={1}
                      onPress={() => handlePlanSelect(plan)}
                    >
                      {isSelected && (
                        <LinearGradient
                          colors={SELECTED_GRADIENT_COLORS}
                          start={{ x: 0.5, y: 0 }}
                          end={{ x: 0.5, y: 1 }}
                          style={styles.planCardGradient}
                        />
                      )}

                      {topBadgeText && (
                        <View
                          style={[
                            styles.planBadge,
                            plan.badgeStyle === 'yellow'
                              ? styles.planBadgeYellow
                              : styles.planBadgeSolid,
                          ]}
                        >
                          <Text
                            numberOfLines={1}
                            adjustsFontSizeToFit
                            minimumFontScale={0.75}
                            style={[
                              styles.planBadgeText,
                              plan.badgeStyle === 'yellow'
                                ? styles.planBadgeTextDark
                                : styles.planBadgeTextLight,
                            ]}
                          >
                            {topBadgeText}
                          </Text>
                        </View>
                      )}

                      {/* First Row: Plan Name (Left) & Monthly Price (Right) */}
                      <View style={styles.planCardRow}>
                        <Text
                          style={[
                            styles.planLabel,
                            plan.id === 'yearly' && styles.planLabelLarge,
                            isSelected && styles.planLabelSelected,
                          ]}
                        >
                          {intl.formatMessage({ id: plan.labelKey })}
                        </Text>

                        <Text
                          style={[
                            styles.planPriceRight,
                            plan.id === 'yearly' && styles.planPriceLarge,
                            isSelected && styles.planPriceRightSelected,
                            plan.highlightMonthlyPrice && styles.planPriceHighlighted,
                            isLongCurrency && styles.planPriceSmall,
                          ]}
                        >
                          {formattedPerMonth}
                        </Text>
                      </View>

                      {/* Second Row: Subtitle (Left) & Discount Badge (Right) */}
                      <View
                        style={[
                          styles.planCardRowBottom,
                          plan.id === 'yearly' && styles.planCardRowBottomLarge,
                        ]}
                      >
                        <Text
                          style={[
                            styles.planSubtitle,
                            plan.id === 'yearly' && styles.planSubtitleLarge,
                            isSelected && styles.planSubtitleSelected,
                          ]}
                        >
                          {intl.formatMessage({ id: plan.subtitleKey })}
                        </Text>

                        {discountPercent ? (
                          <View style={styles.discountBadge}>
                            <Text
                              numberOfLines={1}
                              adjustsFontSizeToFit
                              minimumFontScale={0.8}
                              style={styles.discountBadgeText}
                            >
                              {intl.formatMessage(
                                { id: 'premiumSheets.plans.discountBadge' },
                                { percent: discountPercent },
                              )}
                            </Text>
                          </View>
                        ) : null}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* ── Premium Features (horizontal marquee) ─── */}
              <View style={styles.featuresSection}>
                <Text style={styles.featuresSectionTitle}>
                  {intl.formatMessage({ id: 'premiumSheets.premiumFeaturesLabel' })}
                </Text>

                <View
                  style={styles.featuresMarqueeContainer}
                  onLayout={event => {
                    const { width } = event.nativeEvent.layout;
                    containerWidth.current = width;
                    if (visible) {
                      startScrollAnimation();
                    }
                  }}
                  pointerEvents="none"
                >
                  <Animated.View
                    style={[
                      styles.featuresRow,
                      {
                        transform: [
                          {
                            translateX: Animated.multiply(autoScrollValue, -1),
                          },
                        ],
                      },
                    ]}
                    onLayout={event => {
                      const { width } = event.nativeEvent.layout;
                      contentWidth.current = width;
                      if (visible) {
                        startScrollAnimation();
                      }
                    }}
                  >
                    {getFeatures(colors).map(feature => {
                      const title = intl.formatMessage({
                        id: `premiumSheets.features.${feature.key}Short`,
                      });

                      return (
                        <View key={feature.key} style={styles.featureItem}>
                          <View
                            style={[styles.featureIconWrap, { backgroundColor: feature.bgColor }]}
                          >
                            {feature.icon}
                          </View>
                          <Text style={styles.featureLabel} numberOfLines={3}>
                            {title}
                          </Text>
                        </View>
                      );
                    })}
                  </Animated.View>
                </View>
              </View>
            </ScrollView>

            {/* ── Pinned Bottom Dock: CTA + Disclaimer + Footer links ── */}
            <View style={styles.bottomDock}>
              <TouchableOpacity
                style={[
                  styles.ctaButton,
                  selectedPlan === 'yearly' && styles.ctaButtonTwoLine,
                  isPurchasing ? styles.ctaButtonDisabled : undefined,
                ]}
                activeOpacity={0.9}
                onPress={handlePurchase}
                disabled={isPurchasing}
              >
                {renderCtaContent()}
              </TouchableOpacity>

              <Text style={styles.disclaimer}>{disclaimerText}</Text>

              <View style={styles.footerLinks}>
                <View style={styles.footerRow}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => {
                      soundService.playTapSound();
                      Linking.openURL('https://das-verb.yapps.studio/legal/terms-of-service.html');
                    }}
                  >
                    <Text style={styles.footerLinkText}>
                      {intl.formatMessage({ id: 'premiumSheets.termsOfService' })}
                    </Text>
                  </TouchableOpacity>
                  <Text style={styles.footerDot}>·</Text>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => {
                      soundService.playTapSound();
                      Linking.openURL('https://das-verb.yapps.studio/legal/privacy-policy.html');
                    }}
                  >
                    <Text style={styles.footerLinkText}>
                      {intl.formatMessage({ id: 'premiumSheets.privacyPolicy' })}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
}
