import { soundService, SoundService } from '../services/soundService';
import { updateSettings } from '../services/settingsService';

describe('SoundService', () => {
  beforeEach(async () => {
    updateSettings({ soundEffects: true });
    soundService.setMuted(false);
    await soundService.initialize();
  });

  afterEach(async () => {
    await soundService.unload();
  });

  it('should initialize and play correct sound', async () => {
    await expect(soundService.playCorrectSound()).resolves.not.toThrow();
  });

  it('should play incorrect sound', async () => {
    await expect(soundService.playIncorrectSound()).resolves.not.toThrow();
  });

  it('should play tap sound', async () => {
    await expect(soundService.playTapSound()).resolves.not.toThrow();
  });

  it('should play level finished sound', async () => {
    await expect(soundService.playLevelFinishedSound()).resolves.not.toThrow();
  });

  it('should not throw when muted', async () => {
    soundService.setMuted(true);
    await expect(soundService.playCorrectSound()).resolves.not.toThrow();
    await expect(soundService.playIncorrectSound()).resolves.not.toThrow();
    await expect(soundService.playTapSound()).resolves.not.toThrow();
    await expect(soundService.playLevelFinishedSound()).resolves.not.toThrow();
  });

  it('should not throw when soundEffects is disabled in settings', async () => {
    updateSettings({ soundEffects: false });
    await expect(soundService.playCorrectSound()).resolves.not.toThrow();
    await expect(soundService.playIncorrectSound()).resolves.not.toThrow();
  });

  it('should create new instances of SoundService', () => {
    const customService = new SoundService();
    expect(customService).toBeInstanceOf(SoundService);
  });
});
