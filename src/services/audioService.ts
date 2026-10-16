import { File, Directory, Paths } from 'expo-file-system';

// Endpoint where the CDN hosts audio files
const REMOTE_AUDIO_BASE_URL = 'https://das-verb.yapps.studio/audio/';
const audioCacheDir = new Directory(Paths.cache, 'audio');

const ensureCacheDirectory = () => {
  try {
    if (!audioCacheDir.exists) {
      audioCacheDir.create({ intermediates: true, idempotent: true });
    }
  } catch (error) {
    if (!audioCacheDir.exists) {
      // eslint-disable-next-line no-console
      console.warn('[AudioService] Failed to ensure audio cache directory:', error);
    }
  }
};

// Track files that are known to not exist on CDN (e.g. returned 404)
const missingAudioFiles = new Set<string>();

export const audioService = {
  /**
   * Retrieves an audio source (checks local cache first, then downloads from CDN).
   * Returns null immediately if file is known to be missing or failed to download.
   *
   * @param fileName - e.g. "anrufen_s1_female.m4a"
   */
  async getAudioSource(fileName: string): Promise<{ uri: string } | null> {
    try {
      if (missingAudioFiles.has(fileName)) {
        return null;
      }

      ensureCacheDirectory();
      const file = new File(audioCacheDir, fileName);

      // 1. Check if cached locally
      if (file.exists) {
        return { uri: file.uri };
      }

      // 2. Download directly to local cache
      const localUri = await this.downloadAndCacheAudio(fileName);
      if (localUri) {
        return { uri: localUri };
      }

      // If download failed or file does not exist, return null so caller falls back immediately to TTS
      return null;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('[AudioService] Error getting audio source:', error);
      return null;
    }
  },

  /**
   * Preloads a batch of audio files into local cache in background.
   */
  async preloadAudioFiles(fileNames: string[]): Promise<void> {
    try {
      ensureCacheDirectory();
      await Promise.all(
        fileNames.map(async fileName => {
          try {
            const file = new File(audioCacheDir, fileName);
            if (!file.exists) {
              await this.downloadAndCacheAudio(fileName);
            }
          } catch {
            // Preload is best effort
          }
        }),
      );
    } catch {
      // Preload is best effort
    }
  },

  /**
   * Downloads an audio file from the CDN into local cache.
   */
  async downloadAndCacheAudio(fileName: string): Promise<string | null> {
    try {
      ensureCacheDirectory();
      const remoteUrl = `${REMOTE_AUDIO_BASE_URL}${fileName}`;
      const file = new File(audioCacheDir, fileName);

      await File.downloadFileAsync(remoteUrl, file, {
        idempotent: true,
      });

      if (file.exists) {
        return file.uri;
      }
      return null;
    } catch (error) {
      missingAudioFiles.add(fileName);
      // eslint-disable-next-line no-console
      console.warn(`[AudioService] Failed to download audio ${fileName}:`, error);
      const file = new File(audioCacheDir, fileName);
      if (file.exists) {
        try {
          file.delete();
        } catch {
          // ignore error
        }
      }
      return null;
    }
  },

  /**
   * Clears the audio cache directory.
   */
  async clearCache(): Promise<void> {
    try {
      if (audioCacheDir.exists) {
        audioCacheDir.delete();
      }
      ensureCacheDirectory();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[AudioService] Error clearing audio cache:', error);
    }
  },

  /**
   * Returns total cache size in bytes.
   */
  async getCacheSize(): Promise<number> {
    try {
      if (!audioCacheDir.exists) return 0;
      const contents = audioCacheDir.list();
      let totalSize = 0;
      for (const item of contents) {
        if (item instanceof File) {
          totalSize += item.size;
        }
      }
      return totalSize;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('[AudioService] Error calculating audio cache size:', error);
      return 0;
    }
  },
};
