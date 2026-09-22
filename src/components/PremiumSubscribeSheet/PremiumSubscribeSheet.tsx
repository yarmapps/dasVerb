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
import {
  getMappedPackages,
  MappedPackages,
  purchasePackage,
  restorePurchases,
  FreeTrialInfo,
} from '../../services/revenueCatService';
import { logAnalyticsEvent } from '../../services/analyticsService';
import { createStyles, SELECTED_GRADIENT_COLORS } from './PremiumSubscribeSheet.styles';

export interface PremiumSubscribeSheetProps {
  visible: boolean;
  onClose: () => void;
  onPurchaseSuccess?: () => void;
  source?: string;
}

const SCREEN_HEIGHT = Dimensions.get('window').height;

/* ── Plan definitions ──────────────────────────────────────── */
type PlanId = 'monthly' | 'threeMonth' | 'sixMonth' | 'yearly' | 'lifetime';

interface Plan {
  id: PlanId;
  labelKey: string;
  fallbackPrice: string;
  perKey?: string;
  fallbackPerMonthPrice?: string;
  perMonthKey?: string;
  badgeKey?: string;
  badgeStyle?: 'yellow' | 'solid';
}

const PLANS: Plan[] = [
  {
    id: 'monthly',
    labelKey: 'premiumSheets.plans.monthlyLabel',
    fallbackPrice: '€3.99',
    perKey: 'premiumSheets.plans.monthlyPer',
  },
  {
    id: 'threeMonth',
    labelKey: 'premiumSheets.plans.threeMonthLabel',
    fallbackPrice: '€8.99',
    fallbackPerMonthPrice: '€3.00',
    perMonthKey: 'premiumSheets.plans.perMonth',
    badgeKey: 'premiumSheets.plans.popularBadge',
    badgeStyle: 'yellow',
  },
  {
    id: 'sixMonth',
    labelKey: 'premiumSheets.plans.sixMonthLabel',
    fallbackPrice: '€14.99',
    fallbackPerMonthPrice: '€2.50',
    perMonthKey: 'premiumSheets.plans.perMonth',
    badgeKey: 'premiumSheets.plans.bestValueBadge',
    badgeStyle: 'solid',
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
  {
    key: 'naturalVoice',
    icon: <FontAwesome5 name="volume-up" size={18} color={colors.white} />,
    bgColor: colors.featureBadges.pink,
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
  const styles = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();

  const [translateY] = useState(() => new Animated.Value(SCREEN_HEIGHT));
  const [overlayOpacity] = useState(() => new Animated.Value(0));
  const sheetHeightRef = useRef(SCREEN_HEIGHT);
  const isClosing = useRef(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanId>('threeMonth');
  const [packages, setPackages] = useState<MappedPackages | null>(null);
  const [isLoadingPackages, setIsLoadingPackages] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);

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
      resumeTimer.current = setTimeout(startScrollAnimation, 1000);
      return;
    }

    const duration = distance * 60;

    animationRef.current = Animated.timing(autoScrollValue, {
      toValue: target,
      duration,
      useNativeDriver: true,
      delay: currentScrollX.current === 0 || currentScrollX.current === maxScroll ? 1000 : 0,
    });

    animationRef.current.start(result => {
      if (result.finished) {
        isMovingForward.current = !isMovingForward.current;
        resumeTimer.current = setTimeout(startScrollAnimation, 1000);
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
      setSelectedPlan('threeMonth');
      setIsPurchasing(false);
      loadPackages();

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
      animationRef.current?.stop();
      autoScrollValue.setValue(0);
      currentScrollX.current = 0;
    }
  }, [visible, overlayOpacity, translateY, loadPackages, autoScrollValue, source]);

  const animateClose = () => {
    if (isClosing.current || isPurchasing) {
      return;
    }
    isClosing.current = true;
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
      if (!packages) {
        return plan.fallbackPrice;
      }
      const mapped = packages[plan.id];
      return mapped?.priceString ?? plan.fallbackPrice;
    },
    [packages],
  );

  const getPerMonthPrice = (plan: Plan): string | undefined => {
    if (plan.id === 'monthly' || plan.id === 'lifetime') {
      return undefined;
    }
    const mapped = packages?.[plan.id];
    if (mapped?.monthlyPriceString) {
      return mapped.monthlyPriceString;
    }
    return plan.fallbackPerMonthPrice;
  };

  const getTrialInfo = useCallback(
    (plan: Plan): FreeTrialInfo | undefined => {
      if (!packages) {
        return undefined;
      }
      const mapped = packages[plan.id];
      return mapped?.freeTrialInfo;
    },
    [packages],
  );

  const getTrialBadgeKey = (unit: FreeTrialInfo['unit']): string => {
    const keys: Record<FreeTrialInfo['unit'], string> = {
      day: 'premiumSheets.freeTrialDays',
      week: 'premiumSheets.freeTrialWeeks',
      month: 'premiumSheets.freeTrialMonths',
      year: 'premiumSheets.freeTrialYears',
    };
    return keys[unit];
  };

  /* ── Handle purchase ─────────────────────────────────── */
  const handlePurchase = async () => {
    const selectedPackage = packages?.[selectedPlan]?.pkg;
    if (!selectedPackage) {
      Alert.alert(
        intl.formatMessage({ id: 'premiumSheets.errorTitle' }),
        intl.formatMessage({ id: 'premiumSheets.errorUnavailable' }),
      );
      return;
    }

    setIsPurchasing(true);
    try {
      const success = await purchasePackage(selectedPackage);
      if (success) {
        logAnalyticsEvent('quiz_completed', {
          verb_infinitive: 'premium_purchase_complete',
          score: 100,
          total_questions: 1,
          time_spent_seconds: 0,
        });
        onPurchaseSuccess?.();
        animateClose();
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
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
    setIsPurchasing(true);
    try {
      const restored = await restorePurchases();
      if (restored) {
        Alert.alert(
          intl.formatMessage({ id: 'premiumSheets.restoreSuccessTitle' }),
          intl.formatMessage({ id: 'premiumSheets.restoreSuccessMessage' }),
        );
        onPurchaseSuccess?.();
        animateClose();
      } else {
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
    () => PLANS.find(plan => plan.id === selectedPlan) || PLANS[1],
    [selectedPlan],
  );

  const ctaButtonText = useMemo(() => {
    if (selectedPlan === 'lifetime') {
      return intl.formatMessage({ id: 'premiumSheets.buyNow' });
    }
    return intl.formatMessage({ id: 'premiumSheets.subscribeNow' });
  }, [intl, selectedPlan]);

  const disclaimerText = useMemo(() => {
    if (selectedPlan === 'lifetime') {
      return intl.formatMessage({ id: 'premiumSheets.disclaimerOneTime' });
    }

    const trialInfo = getTrialInfo(selectedPlanConfig);
    const planPrice = getPriceForPlan(selectedPlanConfig);
    const getPeriodId = (id: PlanId): string => {
      switch (id) {
        case 'monthly':
          return 'premiumSheets.periodMonth';
        case 'threeMonth':
          return 'premiumSheets.period3Months';
        case 'sixMonth':
          return 'premiumSheets.period6Months';
        case 'yearly':
          return 'premiumSheets.periodYear';
        default:
          return 'premiumSheets.periodMonth';
      }
    };
    const periodString = intl.formatMessage({ id: getPeriodId(selectedPlan) });

    if (trialInfo) {
      const trialUnitString = intl.formatMessage({
        id: `premiumSheets.trialUnit.${trialInfo.unit}`,
      });
      return intl.formatMessage(
        { id: 'premiumSheets.disclaimerAutoRenewTrial' },
        {
          trialDuration: `${trialInfo.count}\u00A0${trialUnitString}`,
          price: planPrice,
          period: periodString,
        },
      );
    }

    return intl.formatMessage(
      { id: 'premiumSheets.disclaimerAutoRenew' },
      {
        price: planPrice,
        period: periodString,
      },
    );
  }, [intl, selectedPlan, selectedPlanConfig, getPriceForPlan, getTrialInfo]);

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
          onLayout={e => {
            sheetHeightRef.current = e.nativeEvent.layout.height;
          }}
          testID="premium-subscribe-sheet"
        >
          <LinearGradient
            colors={colors.premiumGradient}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={[
              styles.gradient,
              insets.bottom > 0 ? { paddingBottom: insets.bottom + 12 } : null,
            ]}
          >
            {/* Close button */}
            <CloseIconButton
              onPress={animateClose}
              style={styles.closeButton}
              iconColor="rgba(255, 255, 255, 0.85)"
              backgroundColor="rgba(255, 255, 255, 0.16)"
              size={16}
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
              scrollEnabled={sheetHeightRef.current > SCREEN_HEIGHT * 0.9}
              style={{ maxHeight: SCREEN_HEIGHT * 0.95 }}
            >
              {/* Diamond icon */}
              <View style={styles.diamondContainer}>
                <FontAwesome5 name="gem" size={42} color={colors.premiumDiamond} />
              </View>

              {/* Title & subtitle */}
              <Text style={styles.title}>
                {intl.formatMessage({ id: 'premiumSheets.subscribeTitle' })}
              </Text>
              <Text style={styles.subtitle}>
                {intl.formatMessage({ id: 'premiumSheets.subscribeSubtitle' })}
              </Text>

              {/* ── Pricing cards ─────────────────────────── */}
              <View style={styles.plansRow}>
                {PLANS.map(plan => {
                  const isSelected = selectedPlan === plan.id;
                  const price = getPriceForPlan(plan);
                  const perMonthPrice = getPerMonthPrice(plan);
                  const trialInfo = getTrialInfo(plan);
                  const isLongCurrency = price.replace(/[0-9\s.,]/g, '').length > 2;

                  return (
                    <TouchableOpacity
                      key={plan.id}
                      style={[
                        styles.planCard,
                        plan.id === 'threeMonth' && styles.planCardFeatured,
                        isSelected && styles.planCardSelected,
                      ]}
                      activeOpacity={0.8}
                      onPress={() => setSelectedPlan(plan.id)}
                    >
                      {isSelected && (
                        <LinearGradient
                          colors={SELECTED_GRADIENT_COLORS}
                          start={{ x: 0.5, y: 0 }}
                          end={{ x: 0.5, y: 1 }}
                          style={styles.planCardGradient}
                        />
                      )}

                      {plan.badgeKey && (
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
                            {intl.formatMessage({ id: plan.badgeKey })}
                          </Text>
                        </View>
                      )}

                      <Text style={[styles.planLabel, isSelected && styles.planLabelSelected]}>
                        {intl.formatMessage({ id: plan.labelKey })}
                      </Text>

                      <Text
                        style={[
                          styles.planPrice,
                          isSelected && styles.planPriceSelected,
                          isLongCurrency && styles.planPriceSmall,
                        ]}
                      >
                        {isLoadingPackages ? '...' : price}
                      </Text>

                      {perMonthPrice && plan.perMonthKey && (
                        <Text style={[styles.planPer, isSelected && styles.planPerSelected]}>
                          {intl.formatMessage(
                            { id: plan.perMonthKey },
                            { price: isLoadingPackages ? '...' : perMonthPrice },
                          )}
                        </Text>
                      )}

                      {plan.perKey && (
                        <Text style={styles.planPer}>
                          {intl.formatMessage({ id: plan.perKey })}
                        </Text>
                      )}

                      {trialInfo && (
                        <View style={styles.trialBadge}>
                          <Text style={styles.trialBadgeText}>
                            {intl
                              .formatMessage(
                                { id: getTrialBadgeKey(trialInfo.unit) },
                                { count: trialInfo.count },
                              )
                              .replace(/(\d+)\s+/g, '$1\u00A0')}
                          </Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* ── Premium Features (horizontal marquee) ─── */}
              <Text style={styles.featuresSectionTitle}>
                {intl.formatMessage({ id: 'premiumSheets.premiumFeaturesLabel' })}
              </Text>

              <View
                style={styles.featuresMarqueeContainer}
                onLayout={e => {
                  containerWidth.current = e.nativeEvent.layout.width;
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
                  onLayout={e => {
                    contentWidth.current = e.nativeEvent.layout.width;
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

              {/* ── Subscribe CTA ──────────────────────────── */}
              <TouchableOpacity
                style={[styles.ctaButton, isPurchasing ? styles.ctaButtonDisabled : undefined]}
                activeOpacity={0.9}
                onPress={handlePurchase}
                disabled={isPurchasing}
              >
                {isPurchasing ? (
                  <ActivityIndicator size="small" color={colors.premiumSecondarySurface} />
                ) : (
                  <>
                    <Text style={styles.ctaText}>{ctaButtonText}</Text>
                    <FontAwesome5
                      name="arrow-right"
                      size={16}
                      color={colors.premiumHighlightText}
                      style={styles.ctaArrow}
                    />
                  </>
                )}
              </TouchableOpacity>

              {/* ── Disclaimer ─────────────────────────────── */}
              <Text style={styles.disclaimer}>{disclaimerText}</Text>

              {/* ── Footer links ───────────────────────────── */}
              <View style={styles.footerLinks}>
                <View style={styles.footerRow}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() =>
                      Linking.openURL('https://das-verb.yapps.studio/legal/terms-of-service.html')
                    }
                  >
                    <Text style={styles.footerLinkText}>
                      {intl.formatMessage({ id: 'premiumSheets.termsOfService' })}
                    </Text>
                  </TouchableOpacity>
                  <Text style={styles.footerDot}>·</Text>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() =>
                      Linking.openURL('https://das-verb.yapps.studio/legal/privacy-policy.html')
                    }
                  >
                    <Text style={styles.footerLinkText}>
                      {intl.formatMessage({ id: 'premiumSheets.privacyPolicy' })}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
}
