import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { ThemeColors, darkColors, lightColors } from '../styles/themeColors';
import { getSettings, updateSettings } from '../services/settingsService';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeContextType {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  colors: ThemeColors;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    const settings = getSettings();
    return settings.themeMode || 'system';
  });

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    updateSettings({ themeMode: mode });
  };

  const isDark = useMemo(() => {
    if (themeMode === 'system') {
      return systemColorScheme !== 'light';
    }
    return themeMode === 'dark';
  }, [themeMode, systemColorScheme]);

  const colors = isDark ? darkColors : lightColors;

  const value = useMemo(
    () => ({
      themeMode,
      setThemeMode,
      colors,
      isDark,
    }),
    [themeMode, colors, isDark],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useAppTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useAppTheme must be used within a ThemeProvider');
  }
  return context;
};
