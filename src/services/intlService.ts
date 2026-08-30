import { SupportedLocales, Translation } from '../types/intl';

import enTranslations from '../translations/en.json';
import esTranslations from '../translations/es.json';
import frTranslations from '../translations/fr.json';
import itTranslations from '../translations/it.json';
import plTranslations from '../translations/pl.json';
import ptTranslations from '../translations/pt.json';
import ruTranslations from '../translations/ru.json';
import trTranslations from '../translations/tr.json';
import ukTranslations from '../translations/uk.json';
import arTranslations from '../translations/ar.json';
import faTranslations from '../translations/fa.json';

const translations: Record<SupportedLocales, Translation> = {
  en: enTranslations as Translation,
  es: esTranslations as Translation,
  fr: frTranslations as Translation,
  it: itTranslations as Translation,
  pl: plTranslations as Translation,
  pt: ptTranslations as Translation,
  ru: ruTranslations as Translation,
  tr: trTranslations as Translation,
  uk: ukTranslations as Translation,
  ar: arTranslations as Translation,
  fa: faTranslations as Translation,
};

export function flattenMessages(
  nestedMessages: Record<string, unknown>,
  prefix = '',
): Record<string, string> {
  return Object.keys(nestedMessages).reduce((messages: Record<string, string>, key: string) => {
    const value = nestedMessages[key];
    const prefixedKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'string') {
      messages[prefixedKey] = value;
    } else if (typeof value === 'object' && value !== null) {
      Object.assign(messages, flattenMessages(value as Record<string, unknown>, prefixedKey));
    }

    return messages;
  }, {});
}

const flattenedMessagesCache: Partial<Record<SupportedLocales, Record<string, string>>> = {};

export const getMessages = (locale: SupportedLocales): Record<string, string> => {
  const targetLocale = translations[locale] ? locale : 'en';
  if (!flattenedMessagesCache[targetLocale]) {
    flattenedMessagesCache[targetLocale] = flattenMessages(
      translations[targetLocale] as unknown as Record<string, unknown>,
    );
  }
  return flattenedMessagesCache[targetLocale] || {};
};

export const getTranslations = (locale: SupportedLocales): Translation => {
  return translations[locale] || translations.en;
};

export const getDefaultLocale = (): SupportedLocales => {
  return 'en';
};
