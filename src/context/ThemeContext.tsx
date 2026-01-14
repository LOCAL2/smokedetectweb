import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isDark: boolean;
  colors: {
    bg: string;
    bgSecondary: string;
    bgCard: string;
    text: string;
    textSecondary: string;
    border: string;
    borderLight: string;
  };
}

const ThemeContext = createContext<ThemeContextType | null>(null);

const darkColors = {
  bg: '#0B0F1A',
  bgSecondary: '#0F172A',
  bgCard: 'rgba(30, 41, 59, 0.5)',
  text: '#F8FAFC',
  textSecondary: '#94A3B8',
  border: 'rgba(255, 255, 255, 0.1)',
  borderLight: 'rgba(255, 255, 255, 0.06)',
};

const lightColors = {
  bg: '#F8FAFC',
  bgSecondary: '#FFFFFF',
  bgCard: 'rgba(241, 245, 249, 0.8)',
  text: '#0F172A',
  textSecondary: '#64748B',
  border: 'rgba(0, 0, 0, 0.1)',
  borderLight: 'rgba(0, 0, 0, 0.06)',
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as Theme) || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const colors = theme === 'dark' ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === 'dark', colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
