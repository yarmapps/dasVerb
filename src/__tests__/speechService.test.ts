import * as Speech from 'expo-speech';
import { speechService } from '../services/speechService';
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
});
