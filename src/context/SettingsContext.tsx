import { createContext, useContext, type ReactNode } from 'react';
import { useSettings, type SettingsConfig } from '../hooks/useSettings';

interface SettingsContextType {
  settings: SettingsConfig;
  updateSettings: (settings: Partial<SettingsConfig>) => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const { settings, updateSettings, resetSettings } = useSettings();

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettingsContext = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettingsContext must be used within SettingsProvider');
  }
  return context;
};
