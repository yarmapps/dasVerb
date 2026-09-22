import { Platform } from 'react-native';
import mobileAds, { AdsConsent, AdsConsentStatus } from 'react-native-google-mobile-ads';
import * as TrackingTransparency from 'expo-tracking-transparency';
import { ENABLE_ADS } from './adConfig';

/**
 * Service to handle Google UMP (User Messaging Platform) consent
 * Required for showing personalized ads in EEA, UK, and Switzerland,
 * and handles Apple iOS App Tracking Transparency (ATT) sequentially.
 */
class AdConsentService {
  private isInitialized = false;

  /**
   * Initializes the consent flow, handles GDPR UMP form and iOS ATT sequentially,
   * then initializes Google Mobile Ads SDK.
   */
  async initialize(): Promise<void> {
    if (this.isInitialized || !ENABLE_ADS) {
      return;
    }

    try {
      // 1. Request consent info update from Google UMP (GDPR)
      // This checks if consent is required based on user's location
      const consentInfo = await AdsConsent.requestInfoUpdate();

      // 2. Load and show GDPR consent form first if required (EEA / UK / Switzerland)
      if (consentInfo.isConsentFormAvailable && consentInfo.status === AdsConsentStatus.REQUIRED) {
        await AdsConsent.loadAndShowConsentFormIfRequired();
      }

      // 3. Handle iOS Tracking Transparency AFTER GDPR prompt is completed/dismissed
      // Apple Review Guideline 5.1.1(iv): If the user denied tracking on GDPR, do NOT show ATT again.
      // Only request ATT if consent was obtained or not required for this region.
      if (Platform.OS === 'ios') {
        const currentStatus = await AdsConsent.requestInfoUpdate();
        const canRequestTracking =
          currentStatus.status === AdsConsentStatus.OBTAINED ||
          currentStatus.status === AdsConsentStatus.NOT_REQUIRED;

        if (canRequestTracking) {
          await TrackingTransparency.requestTrackingPermissionsAsync();
        }
      }

      // 4. Initialize Mobile Ads SDK
      // We initialize even if consent was denied, as it will just show non-personalized ads
      await mobileAds().initialize();

      this.isInitialized = true;
    } catch {
      // Attempt to initialize ads even if consent flow fails
      try {
        await mobileAds().initialize();
      } catch {
        // Ignore initialization errors here
      }
    }
  }

  /**
   * Shows the consent form to allow users to change their privacy options.
   * This is required by Google for GDPR compliance.
   */
  async showPrivacyOptions(): Promise<unknown> {
    if (!ENABLE_ADS) {
      return null;
    }
    await AdsConsent.requestInfoUpdate();
    return await AdsConsent.showPrivacyOptionsForm();
  }

  /**
   * Resets the consent state (useful for debugging/testing)
   */
  async reset(): Promise<void> {
    try {
      await AdsConsent.reset();
      this.isInitialized = false;
    } catch {
      // Ignore reset error in non-native or dev environments
    }
  }
}

export const adConsentService = new AdConsentService();
