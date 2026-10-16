import AsyncStorage from '@react-native-async-storage/async-storage';

export interface StorageInterface {
  getString(key: string): string | undefined;
  set(key: string, value: string): void;
  delete(key: string): void;
  clearAll(): void;
  getAllKeys(): string[];
  getAll(): Record<string, string>;
}

interface MMKVInstance {
  getString(key: string): string | undefined;
  set(key: string, value: string): void;
  remove?(key: string): boolean;
  delete?(key: string): void;
  clearAll?(): void;
  getAllKeys?(): string[];
}

const storageRegistry = new Set<UniversalStorage>();

class UniversalStorage implements StorageInterface {
  private mmkv: MMKVInstance | null = null;
  private memoryStore = new Map<string, string>();
  private prefix: string;

  constructor(id: string) {
    this.prefix = id;
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const mmkvModule = require('react-native-mmkv');
      if (typeof mmkvModule.createMMKV === 'function') {
        this.mmkv = mmkvModule.createMMKV({ id });
      } else if (typeof mmkvModule.MMKV === 'function') {
        this.mmkv = new mmkvModule.MMKV({ id });
      }
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
        if (typeof this.mmkv.remove === 'function') {
          this.mmkv.remove(key);
        } else if (typeof this.mmkv.delete === 'function') {
          this.mmkv.delete(key);
        }
        return;
      } catch {
        // Fallback to memory
      }
    }
    this.memoryStore.delete(key);
    AsyncStorage.removeItem(`${this.prefix}:${key}`).catch(() => {});
  }

  clearAll(): void {
    if (this.mmkv) {
      try {
        this.mmkv.clearAll?.();
      } catch {
        // Fallback to memory
      }
    }
    this.memoryStore.clear();
    AsyncStorage.getAllKeys()
      .then(keys => {
        const prefixKey = `${this.prefix}:`;
        const filteredKeys = keys.filter(k => k.startsWith(prefixKey));
        return AsyncStorage.multiRemove(filteredKeys);
      })
      .catch(() => {});
  }

  getAllKeys(): string[] {
    if (this.mmkv) {
      try {
        if (typeof this.mmkv.getAllKeys === 'function') {
          return this.mmkv.getAllKeys();
        }
      } catch {
        // Fallback to memory
      }
    }
    return Array.from(this.memoryStore.keys());
  }

  getAll(): Record<string, string> {
    const keys = this.getAllKeys();
    const result: Record<string, string> = {};
    for (const key of keys) {
      const value = this.getString(key);
      if (value !== undefined) {
        result[key] = value;
      }
    }
    return result;
  }
}

export function createStorage(id: string): StorageInterface {
  const storage = new UniversalStorage(id);
  storageRegistry.add(storage);
  return storage;
}

export function resetAllStorages(): void {
  storageRegistry.forEach(storage => {
    storage.clearAll();
  });
}
