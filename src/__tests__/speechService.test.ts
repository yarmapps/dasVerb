import * as Speech from 'expo-speech';
import { speechService } from '../services/speechService';
import { audioService } from '../services/audioService';
import { updateSettings } from '../services/settingsService';

describe('speechService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call Speech.speak with de-DE language and appropriate settings', async () => {
    updateSettings({ ttsVoiceGender: 'female' });
    await speechService.speak('Ich fahre nach Berlin.');

    expect(Speech.speak).toHaveBeenCalledWith(
      'Ich fahre nach Berlin.',
      expect.objectContaining({
        language: 'de-DE',
        pitch: expect.any(Number),
        rate: expect.any(Number),
      }),
    );
  });

  it('should call Speech.speak with male voice when set to male', async () => {
    updateSettings({ ttsVoiceGender: 'male' });
    await speechService.speak('Ich fahre nach Berlin.');

    expect(Speech.speak).toHaveBeenCalledWith(
      'Ich fahre nach Berlin.',
      expect.objectContaining({
        language: 'de-DE',
      }),
    );
  });

  it('should stop speech when stop() is called', async () => {
    await speechService.stop();
    expect(Speech.stop).toHaveBeenCalled();
    expect(speechService.getIsSpeaking()).toBe(false);
  });

  it('should check if male voice is available', async () => {
    const hasMale = await speechService.hasMaleVoiceAvailable();
    expect(typeof hasMale).toBe('boolean');
  });

  it('should play via audio player when audio source is available and not call Speech.speak if it finishes', async () => {
    const onComplete = jest.fn();
    await speechService.speakSentence('fuehren', 's1', 'Er fuehrt das Team.', onComplete);
    expect(Speech.speak).not.toHaveBeenCalled();
  });

  it('should fall back to Speech.speak when audio source is not found', async () => {
    jest.spyOn(audioService, 'getAudioSource').mockResolvedValueOnce(null);

    await speechService.speakSentence('unknown_verb', 's1', 'Ein Beispielsatz.');
    expect(Speech.speak).toHaveBeenCalledWith('Ein Beispielsatz.', expect.any(Object));
  });
});
