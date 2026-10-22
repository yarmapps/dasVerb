import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { getSettings } from './settingsService';

export class HapticService {
  private isEnabled(): boolean {
    const { haptics } = getSettings();
    return haptics ?? true;
  }

  /**
   * Tactile feedback for button taps and UI selections.
   * Uses Medium intensity to deliver a clear, crisp feedback on both Android and iOS.
   */
  async impactTap(): Promise<void> {
    if (!this.isEnabled()) return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      // Ignore errors on devices without haptic engines
    }
  }

  async impactLight(): Promise<void> {
    if (!this.isEnabled()) return;
    try {
      const style =
        Platform.OS === 'android'
          ? Haptics.ImpactFeedbackStyle.Medium
          : Haptics.ImpactFeedbackStyle.Light;
      await Haptics.impactAsync(style);
    } catch {
      // Ignore errors on devices without haptic engines
    }
  }

  async impactMedium(): Promise<void> {
    if (!this.isEnabled()) return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      // Ignore
    }
  }

  async notificationSuccess(): Promise<void> {
    if (!this.isEnabled()) return;
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      // Ignore
    }
  }

  async notificationError(): Promise<void> {
    if (!this.isEnabled()) return;
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch {
      // Ignore
    }
  }

  /**
   * Dual head-shake error haptic feedback for incorrect quiz answers ("no-no" head shake).
   */
  async errorHeadShake(): Promise<void> {
    if (!this.isEnabled()) return;
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setTimeout(async () => {
        if (!this.isEnabled()) return;
        try {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } catch {
          // Ignore
        }
      }, 150);
    } catch {
      // Ignore
    }
  }
}

export const hapticService = new HapticService();
