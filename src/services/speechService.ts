import type { Voice } from 'expo-speech';
import { Platform } from 'react-native';
import { getSettings } from './settingsService';
import { createStorage } from './storageService';

const voiceCache = createStorage('app-speech-voice-cache');
const RESOLVED_MALE_VOICE_KEY = 'resolved-male-de-de';

const GERMAN_MALE_NAMES = ['martin', 'markus', 'yannick', 'viktor', 'daniel', 'stefan', 'niko'];
const GERMAN_FEMALE_NAMES = ['anna', 'helena', 'petra', 'elena', 'katja', 'steffi', 'marlene'];

const IOS_FEMALE_VOICE_ID = 'com.apple.voice.compact.de-DE.Anna';

const ANDROID_FEMALE_HINTS = ['-x-dec-', '-x-dee-', '-x-deg-'];
const ANDROID_MALE_HINTS = ['-x-deb-', '-x-ded-', '-x-def-'];

function getSpeechModule(): typeof import('expo-speech') | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('expo-speech');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('[SpeechService] Native ExpoSpeech module is not available:', error);
    return null;
  }
}

class SpeechService {
  private isSpeaking = false;
  private cachedVoices: Voice[] | null = null;

  private async getGermanVoiceIdentifier(
    gender: 'male' | 'female',
  ): Promise<{ identifier: string | undefined; isExactGenderMatch: boolean }> {
    if (Platform.OS === 'ios' && gender === 'female') {
      return { identifier: IOS_FEMALE_VOICE_ID, isExactGenderMatch: true };
    }

    if (Platform.OS === 'ios' && gender === 'male') {
      const cached = voiceCache.getString(RESOLVED_MALE_VOICE_KEY);
      if (cached !== undefined) {
        if (cached === '') {
          return { identifier: IOS_FEMALE_VOICE_ID, isExactGenderMatch: false };
        }
        return { identifier: cached, isExactGenderMatch: true };
      }
    }

    const iosFallback =
      Platform.OS === 'ios'
        ? { identifier: IOS_FEMALE_VOICE_ID, isExactGenderMatch: false }
        : { identifier: undefined, isExactGenderMatch: false };

    const result = await this.enumerateAndMatchGermanVoice(gender, iosFallback);

    if (Platform.OS === 'ios' && gender === 'male') {
      const toStore = result.isExactGenderMatch ? (result.identifier ?? '') : '';
      voiceCache.set(RESOLVED_MALE_VOICE_KEY, toStore);
    }

    return result;
  }

  private async enumerateAndMatchGermanVoice(
    gender: 'male' | 'female',
    iosFallback: { identifier: string | undefined; isExactGenderMatch: boolean },
  ): Promise<{ identifier: string | undefined; isExactGenderMatch: boolean }> {
    try {
      const speech = getSpeechModule();
      if (!speech) {
        return iosFallback;
      }

      if (!this.cachedVoices || this.cachedVoices.length === 0) {
        this.cachedVoices = await speech.getAvailableVoicesAsync();
      }

      const germanVoices = this.cachedVoices.filter(v => v.language.startsWith('de'));
      if (germanVoices.length === 0) {
        return iosFallback;
      }

      const knownNames = gender === 'male' ? GERMAN_MALE_NAMES : GERMAN_FEMALE_NAMES;

      const genderMatch = germanVoices.find(
        v => (v as unknown as { gender?: string }).gender === gender,
      );
      if (genderMatch) return { identifier: genderMatch.identifier, isExactGenderMatch: true };

      const knownMatch = germanVoices.find(v =>
        knownNames.some(name => v.name.toLowerCase().includes(name)),
      );
      if (knownMatch) return { identifier: knownMatch.identifier, isExactGenderMatch: true };

      const idMatch = germanVoices.find(v =>
        knownNames.some(name => v.identifier.toLowerCase().includes(name)),
      );
      if (idMatch) return { identifier: idMatch.identifier, isExactGenderMatch: true };

      const keyword = gender === 'male' ? 'male' : 'female';
      const keywordMatch = germanVoices.find(
        v => v.name.toLowerCase().includes(keyword) || v.identifier.toLowerCase().includes(keyword),
      );
      if (keywordMatch) return { identifier: keywordMatch.identifier, isExactGenderMatch: true };

      const hints = gender === 'female' ? ANDROID_FEMALE_HINTS : ANDROID_MALE_HINTS;
      const hintMatch = germanVoices.find(v =>
        hints.some(hint => v.identifier.toLowerCase().includes(hint)),
      );
      if (hintMatch) return { identifier: hintMatch.identifier, isExactGenderMatch: true };

      if (Platform.OS === 'ios') return iosFallback;
      return { identifier: germanVoices[0].identifier, isExactGenderMatch: false };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('[SpeechService] Failed to resolve German voice:', error);
      return iosFallback;
    }
  }

  async speak(text: string, onComplete?: () => void): Promise<void> {
    try {
      const speech = getSpeechModule();
      if (!speech) {
        this.isSpeaking = false;
        onComplete?.();
        return;
      }

      if (this.isSpeaking) {
        await speech.stop();
      }

      this.isSpeaking = true;
      const settings = getSettings();
      const gender = settings.ttsVoiceGender || 'female';

      const { identifier: voiceId, isExactGenderMatch } =
        await this.getGermanVoiceIdentifier(gender);

      if (!this.isSpeaking) {
        return;
      }

      let pitch: number;
      let rate: number;
      if (isExactGenderMatch) {
        pitch = gender === 'female' ? 1.05 : 0.95;
        rate = 0.85;
      } else {
        pitch = gender === 'female' ? 1.3 : 0.5;
        rate = gender === 'female' ? 0.85 : 0.78;
      }

      speech.speak(text, {
        language: 'de-DE',
        ...(voiceId ? { voice: voiceId } : {}),
        pitch,
        rate,
        onDone: () => {
          this.isSpeaking = false;
          onComplete?.();
        },
        onStopped: () => {
          this.isSpeaking = false;
        },
        onError: () => {
          this.isSpeaking = false;
          onComplete?.();
        },
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('Failed to speak text:', error);
      this.isSpeaking = false;
      onComplete?.();
    }
  }

  async stop(): Promise<void> {
    try {
      this.isSpeaking = false;
      const speech = getSpeechModule();
      if (speech) {
        await speech.stop();
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('Failed to stop speech:', error);
    }
  }

  getIsSpeaking(): boolean {
    return this.isSpeaking;
  }

  async hasMaleVoiceAvailable(): Promise<boolean> {
    if (Platform.OS === 'ios') {
      this.cachedVoices = null;
      const result = await this.enumerateAndMatchGermanVoice('male', {
        identifier: IOS_FEMALE_VOICE_ID,
        isExactGenderMatch: false,
      });
      voiceCache.set(
        RESOLVED_MALE_VOICE_KEY,
        result.isExactGenderMatch ? (result.identifier ?? '') : '',
      );
      return result.isExactGenderMatch;
    }
    const { isExactGenderMatch } = await this.getGermanVoiceIdentifier('male');
    return isExactGenderMatch;
  }
}

export const speechService = new SpeechService();
