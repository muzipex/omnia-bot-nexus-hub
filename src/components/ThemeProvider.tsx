
import React from 'react';
import { ThemeContext, useThemeSystem } from '@/hooks/use-theme-system';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const themeSystem = useThemeSystem();

  return (
    <ThemeContext.Provider value={themeSystem}>
      {children}
    </ThemeContext.Provider>
  );
};
