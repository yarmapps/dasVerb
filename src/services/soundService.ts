import { createAudioPlayer, setAudioModeAsync, AudioPlayer } from 'expo-audio';
import { getSettings } from './settingsService';

export class SoundService {
  private correctSound: AudioPlayer | null = null;
  private incorrectSound: AudioPlayer | null = null;
  private tapSound: AudioPlayer | null = null;
  private levelFinishedSound: AudioPlayer | null = null;
  private isInitialized = false;
  private isMuted = false;

  setMuted(muted: boolean): void {
    this.isMuted = muted;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await setAudioModeAsync({
        playsInSilentMode: false,
        interruptionMode: 'mixWithOthers',
      });

      // Load sounds using expo-audio createAudioPlayer API with keepAudioSessionActive
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      this.correctSound = createAudioPlayer(require('../../assets/sounds/correct.mp3'), {
        keepAudioSessionActive: true,
      });
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      this.incorrectSound = createAudioPlayer(require('../../assets/sounds/incorrect.mp3'), {
        keepAudioSessionActive: true,
      });
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      this.tapSound = createAudioPlayer(require('../../assets/sounds/tap.mp3'), {
        keepAudioSessionActive: true,
      });
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      this.levelFinishedSound = createAudioPlayer(require('../../assets/sounds/level-finish.mp3'), {
        keepAudioSessionActive: true,
      });

      this.isInitialized = true;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('Failed to initialize sound service:', error);
    }
  }

  private canPlay(): boolean {
    if (this.isMuted) return false;
    const settings = getSettings();
    return settings.soundEffects;
  }

  async playCorrectSound(): Promise<void> {
    if (!this.canPlay()) return;
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      if (this.correctSound) {
        try {
          await this.correctSound.seekTo(0);
        } catch {
          // Ignore seek errors
        }
        this.correctSound.play();
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('Failed to play correct sound:', error);
    }
  }

  async playIncorrectSound(): Promise<void> {
    if (!this.canPlay()) return;
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      if (this.incorrectSound) {
        try {
          await this.incorrectSound.seekTo(0);
        } catch {
          // Ignore seek errors
        }
        this.incorrectSound.play();
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('Failed to play incorrect sound:', error);
    }
  }

  async playTapSound(): Promise<void> {
    if (!this.canPlay()) return;
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      if (this.tapSound) {
        try {
          await this.tapSound.seekTo(0);
        } catch {
          // Ignore seek errors
        }
        this.tapSound.play();
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('Failed to play tap sound:', error);
    }
  }

  async playLevelFinishedSound(): Promise<void> {
    if (!this.canPlay()) return;
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      if (this.levelFinishedSound) {
        try {
          await this.levelFinishedSound.seekTo(0);
        } catch {
          // Ignore seek errors
        }
        this.levelFinishedSound.play();
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('Failed to play level finished sound:', error);
    }
  }

  async unload(): Promise<void> {
    try {
      if (this.correctSound) {
        this.correctSound.remove();
        this.correctSound = null;
      }

      if (this.incorrectSound) {
        this.incorrectSound.remove();
        this.incorrectSound = null;
      }

      if (this.tapSound) {
        this.tapSound.remove();
        this.tapSound = null;
      }

      if (this.levelFinishedSound) {
        this.levelFinishedSound.remove();
        this.levelFinishedSound = null;
      }

      this.isInitialized = false;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('Failed to unload sounds:', error);
    }
  }
}

export const soundService = new SoundService();
