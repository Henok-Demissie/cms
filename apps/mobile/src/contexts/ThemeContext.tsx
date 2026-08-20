import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { palettes, type Palette, type ThemeMode } from '../theme';

const STORAGE_KEY = 'abetbay.theme';

type ThemeContextType = {
  mode: ThemeMode;
  palette: Palette;
  toggle: () => void;
  setMode: (mode: ThemeMode) => void;
  /** Whether the user has pinned a mode, as opposed to following the OS. */
  isExplicit: boolean;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const systemScheme = useColorScheme();
  // null means "follow the OS"; a mode means the user picked one explicitly.
  const [override, setOverride] = useState<ThemeMode | null>(null);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (cancelled) return;
        if (saved === 'dark' || saved === 'light') setOverride(saved);
      })
      .catch(() => {
        // A missing or unreadable store just means we stay on the OS setting.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Default to dark when the OS reports no preference, matching how the app shipped.
  const mode: ThemeMode = override ?? (systemScheme === 'light' ? 'light' : 'dark');

  const setMode = useCallback((next: ThemeMode) => {
    setOverride(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
  }, []);

  const toggle = useCallback(() => {
    setMode(mode === 'dark' ? 'light' : 'dark');
  }, [mode, setMode]);

  const value = useMemo(
    () => ({ mode, palette: palettes[mode], toggle, setMode, isExplicit: override !== null }),
    [mode, override, setMode, toggle],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};

/**
 * StyleSheet.create runs once at module load, so themed styles have to be built
 * per render. Pass a module-level factory so the memo key stays stable:
 *
 *   const makeStyles = (p: Palette) => StyleSheet.create({ ... })
 *   const styles = useThemedStyles(makeStyles)
 */
export function useThemedStyles<T>(factory: (palette: Palette) => T): T {
  const { palette } = useTheme();
  return useMemo(() => factory(palette), [factory, palette]);
}
