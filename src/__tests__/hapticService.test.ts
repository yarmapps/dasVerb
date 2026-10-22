import * as Haptics from 'expo-haptics';
import { hapticService, HapticService } from '../services/hapticService';
import { updateSettings } from '../services/settingsService';

describe('HapticService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    updateSettings({ haptics: true });
  });

  it('should trigger tap impact with Medium intensity when haptics is enabled', async () => {
    await hapticService.impactTap();
    expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Medium);
  });

  it('should trigger light impact when haptics is enabled', async () => {
    await hapticService.impactLight();
    expect(Haptics.impactAsync).toHaveBeenCalled();
  });

  it('should trigger medium impact when haptics is enabled', async () => {
    await hapticService.impactMedium();
    expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Medium);
  });

  it('should trigger notificationSuccess when haptics is enabled', async () => {
    await hapticService.notificationSuccess();
    expect(Haptics.notificationAsync).toHaveBeenCalledWith(
      Haptics.NotificationFeedbackType.Success,
    );
  });

  it('should trigger notificationError when haptics is enabled', async () => {
    await hapticService.notificationError();
    expect(Haptics.notificationAsync).toHaveBeenCalledWith(Haptics.NotificationFeedbackType.Error);
  });

  it('should trigger dual head-shake error haptics when incorrect answer is given', async () => {
    jest.useFakeTimers();
    await hapticService.errorHeadShake();
    expect(Haptics.notificationAsync).toHaveBeenCalledTimes(1);
    expect(Haptics.notificationAsync).toHaveBeenCalledWith(Haptics.NotificationFeedbackType.Error);

    jest.advanceTimersByTime(160);
    expect(Haptics.notificationAsync).toHaveBeenCalledTimes(2);
    jest.useRealTimers();
  });

  it('should not trigger any haptics when disabled in settings', async () => {
    updateSettings({ haptics: false });

    await hapticService.impactTap();
    await hapticService.impactLight();
    await hapticService.impactMedium();
    await hapticService.notificationSuccess();
    await hapticService.notificationError();
    await hapticService.errorHeadShake();

    expect(Haptics.impactAsync).not.toHaveBeenCalled();
    expect(Haptics.notificationAsync).not.toHaveBeenCalled();
  });

  it('should create new instances of HapticService', () => {
    const customService = new HapticService();
    expect(customService).toBeInstanceOf(HapticService);
  });
});
