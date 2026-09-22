import mobileAds, { AdsConsent, AdsConsentStatus } from 'react-native-google-mobile-ads';
import { ENABLE_ADS } from './adConfig';

/**
 * Service to handle Google UMP (User Messaging Platform) consent
 * Required for showing personalized ads in EEA, UK, and Switzerland.
 * UMP natively orchestrates both GDPR and iOS IDFA/ATT prompts via AdMob console configuration.
 */
class AdConsentService {
  private isInitialized = false;

  /**
   * Initializes the consent flow via Google UMP SDK,
   * then initializes Google Mobile Ads SDK.
   */
  async initialize(): Promise<void> {
    if (this.isInitialized || !ENABLE_ADS) {
      return;
    }

    try {
      // 1. Request consent info update from Google UMP (GDPR & IDFA)
      // This checks if consent is required based on user's location
      const consentInfo = await AdsConsent.requestInfoUpdate();

      // 2. Load and show consent form if required (handles GDPR and iOS IDFA automatically via UMP)
      if (consentInfo.isConsentFormAvailable && consentInfo.status === AdsConsentStatus.REQUIRED) {
        await AdsConsent.loadAndShowConsentFormIfRequired();
      }

      // 3. Initialize Mobile Ads SDK
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
