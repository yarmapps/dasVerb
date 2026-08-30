import AsyncStorage from '@react-native-async-storage/async-storage';

export interface StorageInterface {
  getString(key: string): string | undefined;
  set(key: string, value: string): void;
  delete(key: string): void;
}

interface MMKVInstance {
  getString(key: string): string | undefined;
  set(key: string, value: string): void;
  delete(key: string): void;
}

class UniversalStorage implements StorageInterface {
  private mmkv: MMKVInstance | null = null;
  private memoryStore = new Map<string, string>();
  private prefix: string;

  constructor(id: string) {
    this.prefix = id;
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { MMKV } = require('react-native-mmkv');
      this.mmkv = new MMKV({ id });
    } catch {
      // Fallback for Expo Go where native MMKV is not bundled
      this.mmkv = null;
      this.hydrateFromAsyncStorage();
    }
  }

  private async hydrateFromAsyncStorage(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const prefixKey = `${this.prefix}:`;
      const filteredKeys = keys.filter(k => k.startsWith(prefixKey));
      const pairs = await AsyncStorage.multiGet(filteredKeys);
      pairs.forEach(([key, value]) => {
        if (value !== null) {
          const rawKey = key.slice(prefixKey.length);
          this.memoryStore.set(rawKey, value);
        }
      });
    } catch {
      // Ignore fallback errors
    }
  }

  getString(key: string): string | undefined {
    if (this.mmkv) {
      try {
        return this.mmkv.getString(key);
      } catch {
        // Fallback to memory
      }
    }
    return this.memoryStore.get(key);
  }

  set(key: string, value: string): void {
    if (this.mmkv) {
      try {
        this.mmkv.set(key, value);
        return;
      } catch {
        // Fallback to memory
      }
    }
    this.memoryStore.set(key, value);
    AsyncStorage.setItem(`${this.prefix}:${key}`, value).catch(() => {});
  }

  delete(key: string): void {
    if (this.mmkv) {
      try {
        this.mmkv.delete(key);
        return;
      } catch {
        // Fallback to memory
      }
    }
    this.memoryStore.delete(key);
    AsyncStorage.removeItem(`${this.prefix}:${key}`).catch(() => {});
  }
}

export function createStorage(id: string): StorageInterface {
  return new UniversalStorage(id);
}
