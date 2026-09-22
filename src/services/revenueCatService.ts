import { Platform, Linking } from 'react-native';
import Purchases, {
  LOG_LEVEL,
  PurchasesPackage,
  CustomerInfo,
  PurchasesOfferings,
  PACKAGE_TYPE,
} from 'react-native-purchases';
import { setPremiumEnabled, isPremiumEnabled } from './premiumAccessService';
import { setTrialStartDate, getTrialStartDate } from './usageService';
import { scheduleTrialReminder } from './notificationService';
import { isFeatureEnabled } from './featuresService';

/* ── API keys ──────────────────────────────────────────────── */
const API_KEYS = {
  ios: process.env.EXPO_PUBLIC_REVENUE_CAT_IOS_KEY || 'test_XaREDugSrXVhJcPAWsIWRfDkgLd',
  android: process.env.EXPO_PUBLIC_REVENUE_CAT_ANDROID_KEY || 'test_XaREDugSrXVhJcPAWsIWRfDkgLd',
};

/* ── Entitlement identifier (matches RevenueCat dashboard) ─ */
export const PREMIUM_ENTITLEMENT = 'premium';

/* ── Helpers ───────────────────────────────────────────────── */
function updatePremiumFromCustomerInfo(info: CustomerInfo): void {
  const isPremium = info.entitlements.active[PREMIUM_ENTITLEMENT] !== undefined;
  if (__DEV__) {
    console.log('[RevenueCat] updatePremiumFromCustomerInfo:', {
      isPremium,
      activeEntitlements: Object.keys(info.entitlements.active),
      allEntitlements: Object.keys(info.entitlements.all),
    });
  }
  setPremiumEnabled(isPremium);
}

function formatPrice(amount: number, currencyCode: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currencyCode} ${amount.toFixed(2)}`;
  }
}

/* ── Public API ────────────────────────────────────────────── */

/**
 * Call once at app startup (before any purchase-related UI).
 */
export async function initRevenueCat(): Promise<void> {
  if (!isFeatureEnabled('ENABLE_PREMIUM')) {
    if (__DEV__) {
      console.log('[RevenueCat] ENABLE_PREMIUM is false, skipping initialization');
    }
    return;
  }

  const apiKey = Platform.OS === 'ios' ? API_KEYS.ios : API_KEYS.android;

  if (!apiKey) {
    if (__DEV__) {
      console.log('[RevenueCat] No API key provided for platform', Platform.OS);
    }
    return;
  }

  // Guard against using test_ keys in non-dev builds where native billing might throw
  if (!__DEV__ && apiKey.startsWith('test_')) {
    console.warn(
      '[RevenueCat] Skipping Purchases.configure: test keys cannot be used in release builds',
    );
    return;
  }

  try {
    if (__DEV__) {
      Purchases.setLogLevel(LOG_LEVEL.VERBOSE);
    }

    Purchases.configure({ apiKey });

    // Listen for subscription status changes (renewals, cancellations, etc.)
    Purchases.addCustomerInfoUpdateListener(updatePremiumFromCustomerInfo);

    // Sync current status on launch
    await checkPremiumStatus();
  } catch (error) {
    if (__DEV__) {
      console.warn('[RevenueCat] Purchases.configure failed:', error);
    }
  }
}

/**
 * Check current entitlement status and update the local flag.
 */
export async function checkPremiumStatus(): Promise<boolean> {
  if (!isFeatureEnabled('ENABLE_PREMIUM')) {
    return isPremiumEnabled();
  }

  try {
    const customerInfo = await Purchases.getCustomerInfo();
    const isPremium = customerInfo.entitlements.active[PREMIUM_ENTITLEMENT] !== undefined;
    setPremiumEnabled(isPremium);
    return isPremium;
  } catch (error) {
    if (__DEV__) {
      console.warn('[RevenueCat] Failed to check premium status:', error);
    }
    return false;
  }
}

/**
 * Get the current RevenueCat App User ID.
 */
export async function getRevenueCatAppUserID(): Promise<string | null> {
  try {
    return await Purchases.getAppUserID();
  } catch (error) {
    if (__DEV__) {
      console.warn('[RevenueCat] Failed to get App User ID:', error);
    }
    return null;
  }
}

/**
 * Fetch the current offerings (packages with localised prices).
 * Returns `null` when offerings are unavailable.
 */
export async function getOfferings(): Promise<PurchasesOfferings | null> {
  try {
    const offerings = await Purchases.getOfferings();
    if (__DEV__) {
      console.log('[RevenueCat] getOfferings raw result:', {
        hasCurrent: offerings.current !== null,
        currentPackages: offerings.current?.availablePackages?.map(p => ({
          identifier: p.identifier,
          packageType: p.packageType,
          productId: p.product?.identifier,
          priceString: p.product?.priceString,
        })),
        allOfferingKeys: Object.keys(offerings.all || {}),
      });
    }
    if (offerings.current !== null && offerings.current.availablePackages.length > 0) {
      return offerings;
    }

    // Fallback to first available offering in offerings.all if current is not explicitly set as default
    const allKeys = Object.keys(offerings.all || {});
    if (allKeys.length > 0) {
      const firstKey = allKeys[0];
      const fallbackOffering = offerings.all[firstKey];
      if (fallbackOffering && fallbackOffering.availablePackages.length > 0) {
        if (__DEV__) {
          console.log('[RevenueCat] Using first offering as fallback:', firstKey);
        }
        return {
          ...offerings,
          current: fallbackOffering,
        };
      }
    }

    return null;
  } catch (error) {
    if (__DEV__) {
      console.warn('[RevenueCat] Failed to fetch offerings:', error);
    }
    return null;
  }
}

export interface FreeTrialInfo {
  count: number;
  unit: 'day' | 'week' | 'month' | 'year';
}

export interface MappedPackage {
  pkg: PurchasesPackage;
  priceString: string;
  /** Price per month string (only for annual) */
  monthlyPriceString?: string;
  /** Free trial info */
  freeTrialInfo?: FreeTrialInfo;
}

export type MappedPackages = {
  monthly: MappedPackage | null;
  threeMonth: MappedPackage | null;
  sixMonth: MappedPackage | null;
  yearly: MappedPackage | null;
  lifetime: MappedPackage | null;
};

/**
 * Map the current offering into a typed record keyed by plan id.
 * Returns `null` when the offering cannot be loaded.
 */
export async function getMappedPackages(): Promise<MappedPackages | null> {
  const offerings = await getOfferings();

  if (offerings?.current && offerings.current.availablePackages.length > 0) {
    const packagesList = offerings.current.availablePackages;

    const findPackage = (
      packageType: PACKAGE_TYPE,
      identifiers: string[],
      productIdentifiers: string[],
    ): PurchasesPackage | undefined =>
      packagesList.find(
        p =>
          p.packageType === packageType ||
          identifiers.includes(p.identifier?.toLowerCase()) ||
          productIdentifiers.some(
            id =>
              p.product?.identifier?.toLowerCase() === id ||
              p.product?.identifier?.toLowerCase().startsWith(`${id}:`),
          ),
      );

    const monthlyPackage = findPackage(
      PACKAGE_TYPE.MONTHLY,
      ['$rc_monthly', 'monthly', 'month', 'premium_monthly', '1month', 'dasverb_premium_monthly'],
      ['premium_monthly', 'monthly', 'dasverb_monthly', 'dasverb_premium_monthly'],
    );
    const threeMonthPackage = findPackage(
      PACKAGE_TYPE.THREE_MONTH,
      [
        '$rc_three_month',
        'three_month',
        '3months',
        '3month',
        'premium_3months',
        'dasverb_premium_3months',
      ],
      ['premium_3months', 'three_month', 'dasverb_3months', 'dasverb_premium_3months'],
    );
    const sixMonthPackage = findPackage(
      PACKAGE_TYPE.SIX_MONTH,
      [
        '$rc_six_month',
        'six_month',
        '6months',
        '6month',
        'premium_6months',
        'dasverb_premium_6months',
      ],
      ['premium_6months', 'six_month', 'dasverb_6months', 'dasverb_premium_6months'],
    );
    const annualPackage = findPackage(
      PACKAGE_TYPE.ANNUAL,
      [
        '$rc_annual',
        '$rc_yearly',
        'annual',
        'yearly',
        'year',
        'premium_yearly',
        '12months',
        '1year',
        'dasverb_premium_yearly',
      ],
      ['premium_yearly', 'yearly', 'annual', 'dasverb_yearly', 'dasverb_premium_yearly'],
    );
    const lifetimePackage = findPackage(
      PACKAGE_TYPE.LIFETIME,
      [
        '$rc_lifetime',
        'lifetime',
        'forever',
        'premium_lifetime',
        'onetime',
        'dasverb_premium_lifetime',
      ],
      ['premium_lifetime', 'lifetime', 'dasverb_lifetime', 'dasverb_premium_lifetime'],
    );

    const userHadTrial = getTrialStartDate() !== null;

    const buildMapped = (pkg: PurchasesPackage | undefined): MappedPackage | null => {
      if (!pkg) {
        return null;
      }

      const mapped: MappedPackage = {
        pkg,
        priceString: pkg.product?.priceString || '$4.99',
      };

      // Extract free trial info from introPrice only if user has not activated a trial previously
      if (!userHadTrial) {
        const intro = pkg.product?.introPrice;
        if (intro && intro.price === 0 && intro.periodNumberOfUnits > 0) {
          const unit = intro.periodUnit?.toLowerCase() as FreeTrialInfo['unit'];
          mapped.freeTrialInfo = { count: intro.periodNumberOfUnits, unit: unit || 'day' };
        }
      }

      return mapped;
    };

    const threeMonthMapped = buildMapped(threeMonthPackage);
    if (threeMonthMapped && threeMonthPackage?.product?.price) {
      const { price, currencyCode } = threeMonthPackage.product;
      const monthlyPrice = price / 3;
      threeMonthMapped.monthlyPriceString = formatPrice(monthlyPrice, currencyCode || 'USD');
    }

    const sixMonthMapped = buildMapped(sixMonthPackage);
    if (sixMonthMapped && sixMonthPackage?.product?.price) {
      const { price, currencyCode } = sixMonthPackage.product;
      const monthlyPrice = price / 6;
      sixMonthMapped.monthlyPriceString = formatPrice(monthlyPrice, currencyCode || 'USD');
    }

    const annualMapped = buildMapped(annualPackage);
    if (annualMapped && annualPackage?.product?.price) {
      const { price, currencyCode } = annualPackage.product;
      const monthlyPrice = price / 12;
      annualMapped.monthlyPriceString = formatPrice(monthlyPrice, currencyCode || 'USD');
    }

    if (
      monthlyPackage ||
      threeMonthPackage ||
      sixMonthPackage ||
      annualPackage ||
      lifetimePackage
    ) {
      return {
        monthly: buildMapped(monthlyPackage),
        threeMonth: threeMonthMapped,
        sixMonth: sixMonthMapped,
        yearly: annualMapped,
        lifetime: buildMapped(lifetimePackage),
      };
    }
  }

  // In DEV, if RevenueCat Dashboard is not fully configured yet, return fallback mock packages for seamless testing
  if (__DEV__) {
    console.log('[RevenueCat] DEV mode: Using mock packages for local UI/flow testing');
    const userHadTrial = getTrialStartDate() !== null;
    return {
      monthly: {
        pkg: {
          identifier: '$rc_monthly',
          packageType: PACKAGE_TYPE.MONTHLY,
          product: {
            identifier: 'dasverb_premium_monthly',
            priceString: '€3.99',
            price: 3.99,
            currencyCode: 'EUR',
          },
        } as unknown as PurchasesPackage,
        priceString: '€3.99',
      },
      threeMonth: {
        pkg: {
          identifier: '$rc_three_month',
          packageType: PACKAGE_TYPE.THREE_MONTH,
          product: {
            identifier: 'dasverb_premium_3months',
            priceString: '€8.99',
            price: 8.99,
            currencyCode: 'EUR',
            introPrice: {
              price: 0,
              periodNumberOfUnits: 3,
              periodUnit: 'DAY',
            },
          },
        } as unknown as PurchasesPackage,
        priceString: '€8.99',
        monthlyPriceString: '€3.00',
        freeTrialInfo: userHadTrial ? undefined : { count: 3, unit: 'day' },
      },
      sixMonth: {
        pkg: {
          identifier: '$rc_six_month',
          packageType: PACKAGE_TYPE.SIX_MONTH,
          product: {
            identifier: 'dasverb_premium_6months',
            priceString: '€14.99',
            price: 14.99,
            currencyCode: 'EUR',
          },
        } as unknown as PurchasesPackage,
        priceString: '€14.99',
        monthlyPriceString: '€2.50',
      },
      yearly: null,
      lifetime: null,
    };
  }

  return null;
}

/**
 * Purchase a package. Returns `true` on success, `false` on user cancellation.
 * Throws on unexpected errors.
 */
export async function purchasePackage(pkg: PurchasesPackage): Promise<boolean> {
  try {
    if (__DEV__) {
      console.log('[RevenueCat] Purchasing package:', pkg.identifier, pkg.packageType);
    }
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    updatePremiumFromCustomerInfo(customerInfo);
    const hasPremium = customerInfo.entitlements.active[PREMIUM_ENTITLEMENT] !== undefined;

    if (hasPremium) {
      const intro = pkg.product?.introPrice;
      if (intro && intro.price === 0 && intro.periodNumberOfUnits > 0) {
        const nowMs = Date.now();
        setTrialStartDate(nowMs);
        scheduleTrialReminder(nowMs).catch(() => {});
      }
    }

    return hasPremium;
  } catch (error: unknown) {
    const errorRecord = error as { userCancelled?: boolean; message?: string };
    if (errorRecord.userCancelled) {
      if (__DEV__) {
        console.log('[RevenueCat] User cancelled purchase');
      }
      return false;
    }

    // In DEV: if StoreKit/Sandbox in simulator fails due to test key or mock package, activate premium for testing
    if (__DEV__) {
      console.warn('[RevenueCat] DEV purchase error (simulating activation):', error);
      setPremiumEnabled(true);
      return true;
    }

    throw error;
  }
}

/**
 * Restore previous purchases (e.g. after reinstall or device switch).
 * Returns `true` if premium entitlement was restored.
 */
export async function restorePurchases(): Promise<boolean> {
  try {
    const customerInfo = await Purchases.restorePurchases();
    updatePremiumFromCustomerInfo(customerInfo);
    return customerInfo.entitlements.active[PREMIUM_ENTITLEMENT] !== undefined;
  } catch (error) {
    if (__DEV__) {
      console.warn('[RevenueCat] Restore failed:', error);
    }
    throw error;
  }
}

/**
 * Open native subscription management UI (Google Play / App Store).
 */
export async function openManageSubscriptions(): Promise<void> {
  try {
    await Purchases.showManageSubscriptions();
  } catch (error) {
    if (__DEV__) {
      console.warn(
        '[RevenueCat] Native showManageSubscriptions failed, falling back to URL:',
        error,
      );
    }
    try {
      if (Platform.OS === 'ios') {
        await Linking.openURL('https://apps.apple.com/account/subscriptions');
      } else {
        await Linking.openURL('https://play.google.com/store/account/subscriptions');
      }
    } catch (fallbackError) {
      if (__DEV__) {
        console.warn('[RevenueCat] Failed to open fallback subscription URL:', fallbackError);
      }
    }
  }
}
