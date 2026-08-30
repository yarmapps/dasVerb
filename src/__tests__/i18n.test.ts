import fs from 'fs';
import path from 'path';
import { getMessages } from '../services/intlService';
import { SupportedLocales } from '../types/intl';

const LOCALES: SupportedLocales[] = [
  'en',
  'es',
  'fr',
  'it',
  'pl',
  'pt',
  'ru',
  'tr',
  'uk',
  'ar',
  'fa',
];

describe('i18n and react-intl Compliance Suite', () => {
  it('should have complete and non-empty messages for all supported locales', () => {
    const baseMessages = getMessages('en');
    const baseKeys = Object.keys(baseMessages);

    expect(baseKeys.length).toBeGreaterThan(0);

    LOCALES.forEach(locale => {
      const messages = getMessages(locale);
      baseKeys.forEach(key => {
        expect(messages[key]).toBeDefined();
        expect(typeof messages[key]).toBe('string');
        expect(messages[key].trim().length).toBeGreaterThan(0);
      });
    });
  });

  it('STRICT RULE: should ensure NO "defaultMessage" is used anywhere in src/ codebase', () => {
    const srcDir = path.resolve(__dirname, '..');
    const violations: string[] = [];

    function scanDirectory(dir: string) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          if (entry.name !== '__tests__' && entry.name !== 'node_modules') {
            scanDirectory(fullPath);
          }
        } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
          const content = fs.readFileSync(fullPath, 'utf-8');
          if (content.includes('defaultMessage')) {
            violations.push(fullPath);
          }
        }
      }
    }

    scanDirectory(srcDir);

    expect(violations).toEqual([]);
  });
});
