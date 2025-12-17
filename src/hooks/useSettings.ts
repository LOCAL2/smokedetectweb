import { useState, useCallback } from 'react';

export interface ApiEndpoint {
  id: string;
  name: string;
  url: string;
  apiKey?: string;
  enabled: boolean;
}

export interface SettingsConfig {
  warningThreshold: number;
  dangerThreshold: number;
  pollingInterval: number;
  enableSoundAlert: boolean;
  enableNotification: boolean;
  apiEndpoints: ApiEndpoint[];
  pinnedSensors: string[];
}

const STORAGE_KEY = 'smoke-detection-settings';

const getDefaultSettings = (): SettingsConfig => ({
  warningThreshold: Number(import.meta.env.VITE_THRESHOLD_WARNING) || 50,
  dangerThreshold: Number(import.meta.env.VITE_THRESHOLD_DANGER) || 200,
  pollingInterval: Number(import.meta.env.VITE_POLLING_INTERVAL) || 30000,
  enableSoundAlert: false,
  enableNotification: import.meta.env.VITE_ENABLE_NOTIFICATION === 'true',
  apiEndpoints: [{
    id: 'default',
    name: 'สถานที่หลัก',
    url: import.meta.env.VITE_API_BASE_URL || 'http://118.173.113.78:3000/api/sensor',
    apiKey: import.meta.env.VITE_API_KEY || '',
    enabled: true,
  }],
  pinnedSensors: [],
});

export const useSettings = () => {
  const [settings, setSettings] = useState<SettingsConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return { ...getDefaultSettings(), ...JSON.parse(saved) };
      } catch {
        return getDefaultSettings();
      }
    }
    return getDefaultSettings();
  });

  const updateSettings = useCallback((newSettings: Partial<SettingsConfig>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const resetSettings = useCallback(() => {
    const defaults = getDefaultSettings();
    localStorage.removeItem(STORAGE_KEY);
    setSettings(defaults);
  }, []);

  return { settings, updateSettings, resetSettings };
};

// Helper function to get sensor status based on current settings
export const getSensorStatusWithSettings = (
  value: number,
  warningThreshold: number,
  dangerThreshold: number
): 'safe' | 'warning' | 'danger' => {
  if (value >= dangerThreshold) return 'danger';
  if (value >= warningThreshold) return 'warning';
  return 'safe';
};
