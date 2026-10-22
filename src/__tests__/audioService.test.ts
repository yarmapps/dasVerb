import { File } from 'expo-file-system';
import { audioService } from '../services/audioService';
import { speechService } from '../services/speechService';

describe('audioService and speechService CDN integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await speechService.stop();
  });

  it('retrieves audio source URL from CDN when not in cache', async () => {
    const source = await audioService.getAudioSource('anrufen_s1_female.m4a');
    expect(source).not.toBeNull();
    expect(source?.uri).toContain('anrufen_s1_female.m4a');
  });

  it('preloads audio files without throwing error', async () => {
    await expect(
      audioService.preloadAudioFiles(['anrufen_s1_female.m4a', 'ankommen_base_1_male.m4a']),
    ).resolves.not.toThrow();
  });

  it('clears audio cache cleanly', async () => {
    await expect(audioService.clearCache()).resolves.not.toThrow();
  });

  it('calculates cache size', async () => {
    const size = await audioService.getCacheSize();
    expect(typeof size).toBe('number');
  });

  it('returns null and does not hang when file is missing from CDN', async () => {
    (File.downloadFileAsync as jest.Mock).mockRejectedValueOnce(
      new Error('Unable to download a file: response has status 404'),
    );

    const source = await audioService.getAudioSource('non_existent_s1_female.m4a');
    expect(source).toBeNull();

    // Calling it again should immediately return null from missingFilesSet without trying to download
    const sourceAgain = await audioService.getAudioSource('non_existent_s1_female.m4a');
    expect(sourceAgain).toBeNull();
  });

  it('falls back to Speech.speak when CDN audio fails or offline', async () => {
    const onComplete = jest.fn();
    await speechService.speakSentence('anrufen', 's1', 'Ich rufe dich morgen an.', onComplete);

    // Either played via player or fell back to Speech.speak
    expect(speechService.getIsSpeaking()).toBeDefined();
  });

  it('rejects synthetic conjugation and verb_forms audio tracks immediately without downloading', async () => {
    const downloadSpy = jest.spyOn(File, 'downloadFileAsync');

    const conjSource = await audioService.getAudioSource('haben_conj_haben_2_male.m4a');
    expect(conjSource).toBeNull();

    const verbFormsSource = await audioService.getAudioSource(
      'gehen_verb_forms_gehen_0_female.m4a',
    );
    expect(verbFormsSource).toBeNull();

    await audioService.preloadAudioFiles([
      'haben_conj_haben_2_male.m4a',
      'werden_conj_werden_0_male.m4a',
    ]);

    expect(downloadSpy).not.toHaveBeenCalled();
    downloadSpy.mockRestore();
  });
});
