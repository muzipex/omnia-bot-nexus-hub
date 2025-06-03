
import { createContext, useContext, useState, useEffect } from 'react';

export type ThemeVariant = 'default' | 'tradingview' | 'cyberpunk' | 'minimal' | 'forest';

interface ThemeContextType {
  theme: ThemeVariant;
  setTheme: (theme: ThemeVariant) => void;
  themes: { id: ThemeVariant; name: string; description: string }[];
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const themes = [
  {
    id: 'default' as const,
    name: 'Tech Blue',
    description: 'Original dark theme with blue accents'
  },
  {
    id: 'tradingview' as const,
    name: 'TradingView',
    description: 'Professional trading platform style'
  },
  {
    id: 'cyberpunk' as const,
    name: 'Cyberpunk',
    description: 'Neon colors with futuristic design'
  },
  {
    id: 'minimal' as const,
    name: 'Minimal Dark',
    description: 'Clean and minimal dark interface'
  },
  {
    id: 'forest' as const,
    name: 'Forest',
    description: 'Nature-inspired green theme'
  }
];

export const useThemeSystem = () => {
  const [theme, setThemeState] = useState<ThemeVariant>('default');

  useEffect(() => {
    const savedTheme = localStorage.getItem('omnia-theme') as ThemeVariant;
    if (savedTheme && themes.find(t => t.id === savedTheme)) {
      setThemeState(savedTheme);
    }
  }, []);

  useEffect(() => {
    // Remove all theme classes
    document.documentElement.classList.remove('theme-tradingview', 'theme-cyberpunk', 'theme-minimal', 'theme-forest');
    
    // Add current theme class
    if (theme !== 'default') {
      document.documentElement.classList.add(`theme-${theme}`);
    }
  }, [theme]);

  const setTheme = (newTheme: ThemeVariant) => {
    setThemeState(newTheme);
    localStorage.setItem('omnia-theme', newTheme);
  };

  return {
    theme,
    setTheme,
    themes
  };
};
