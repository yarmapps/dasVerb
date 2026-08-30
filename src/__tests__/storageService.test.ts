import { createStorage } from '../services/storageService';

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
});
