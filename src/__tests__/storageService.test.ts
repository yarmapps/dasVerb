import { createStorage, resetAllStorages } from '../services/storageService';

describe('storageService', () => {
  it('should create storage and perform CRUD operations with memory fallback', () => {
    const storage = createStorage('test_storage');

    expect(storage.getString('test_key')).toBeUndefined();

    storage.set('test_key', 'test_value');
    expect(storage.getString('test_key')).toBe('test_value');

    storage.set('test_key', 'updated_value');
    expect(storage.getString('test_key')).toBe('updated_value');

    storage.delete('test_key');
    expect(storage.getString('test_key')).toBeUndefined();
  });

  it('should support clearAll on single storage', () => {
    const storage = createStorage('test_clear_storage');
    storage.set('key1', 'val1');
    storage.set('key2', 'val2');

    expect(storage.getString('key1')).toBe('val1');
    expect(storage.getString('key2')).toBe('val2');

    storage.clearAll();

    expect(storage.getString('key1')).toBeUndefined();
    expect(storage.getString('key2')).toBeUndefined();
  });

  it('should reset all registered storages with resetAllStorages', () => {
    const storage1 = createStorage('storage_multi_1');
    const storage2 = createStorage('storage_multi_2');

    storage1.set('s1', 'v1');
    storage2.set('s2', 'v2');

    expect(storage1.getString('s1')).toBe('v1');
    expect(storage2.getString('s2')).toBe('v2');

    resetAllStorages();

    expect(storage1.getString('s1')).toBeUndefined();
    expect(storage2.getString('s2')).toBeUndefined();
  });
});
