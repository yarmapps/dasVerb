import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import { IntlProvider } from 'react-intl';
import { SupportedLocales, Translation } from '../types/intl';
import { getTranslations, getMessages, getDefaultLocale } from '../services/intlService';
import {
  getNativeLanguage,
  getIsLanguageSelected,
  updateLanguageSettings,
} from '../services/settingsService';

export interface LocaleContextType {
  locale: SupportedLocales;
  setLocale: (locale: SupportedLocales) => void;
  translations: Translation;
  hasSelectedLanguage: boolean;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export const LocaleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<SupportedLocales>(() => {
    return getNativeLanguage() || getDefaultLocale();
  });
  const [hasSelectedLanguage, setHasSelectedLanguage] = useState<boolean>(() => {
    return getIsLanguageSelected();
  });

  const setLocale = (newLocale: SupportedLocales) => {
    setLocaleState(newLocale);
    setHasSelectedLanguage(true);
    updateLanguageSettings(true, newLocale);
  };

  const translations = useMemo(() => getTranslations(locale), [locale]);
  const messages = useMemo(() => getMessages(locale), [locale]);

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      translations,
      hasSelectedLanguage,
    }),
    [locale, translations, hasSelectedLanguage],
  );

  return (
    <LocaleContext.Provider value={value}>
      <IntlProvider locale={locale} messages={messages}>
        {children}
      </IntlProvider>
    </LocaleContext.Provider>
  );
};

export const useLocale = (): LocaleContextType => {
  const context = useContext(LocaleContext);
  if (context === undefined) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
};
