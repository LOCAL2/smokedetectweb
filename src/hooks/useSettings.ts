import { useState, useCallback, useEffect } from 'react';

export interface ApiEndpoint {
  id: string;
  name: string;
  url: string;
  apiKey?: string;
  enabled: boolean;
}

export interface SensorCoordinates {
  sensorId: string;
  lat: number;
  lng: number;
  address?: string;
}

export interface MqttSettings {
  enabled: boolean;
  broker: string;
  topics: string[];
}

export interface LineNotifySettings {
  enabled: boolean;
  channelAccessToken: string;
  notifyOnWarning: boolean;
  notifyOnDanger: boolean;
  cooldownMinutes: number; 
  lastNotifyTime?: number;
}

export type DashboardComponent = 'statusCards' | 'chart' | 'ranking' | 'pinnedSensors' | 'miniMap' | 'comparisonChart' | 'statusHistory' | 'trendAnalysis';

export type LayoutPosition = 'top' | 'middleLeft' | 'middleRight' | 'bottom' | 'bottomLeft' | 'bottomMiddle' | 'bottomRight' | 'trendPanel';

export interface LayoutSettings {
  positions: Record<LayoutPosition, DashboardComponent | null>;
}

export interface SensorGroup {
  id: string;
  name: string;
  color: string;
}

export interface SettingsConfig {
  warningThreshold: number;
  dangerThreshold: number;
  pollingInterval: number;
  enableSoundAlert: boolean;
  enableNotification: boolean;
  apiEndpoints: ApiEndpoint[];
  mqtt: MqttSettings;
  pinnedSensors: string[];
  sensorCoordinates: SensorCoordinates[];
  lineNotify: LineNotifySettings;
  demoMode: boolean;
  dashboardLayout: LayoutSettings;
  sensorGroups: SensorGroup[];
  sensorAssignments: Record<string, string>; 
  groqApiKey?: string; 
}

const STORAGE_KEY = 'smoke-detection-settings';
const SETTINGS_BROADCAST_CHANNEL = 'smoke-settings-sync';


let settingsBroadcastChannel: BroadcastChannel | null = null;
try {
  settingsBroadcastChannel = new BroadcastChannel(SETTINGS_BROADCAST_CHANNEL);
} catch (e) {
  console.log('BroadcastChannel not supported for settings');
}

const getDefaultSettings = (): SettingsConfig => ({
  warningThreshold: Number(import.meta.env.VITE_THRESHOLD_WARNING) || 50,
  dangerThreshold: Number(import.meta.env.VITE_THRESHOLD_DANGER) || 200,
  pollingInterval: Number(import.meta.env.VITE_POLLING_INTERVAL) || 500,
  enableSoundAlert: false,
  enableNotification: import.meta.env.VITE_ENABLE_NOTIFICATION === 'true',
  apiEndpoints: [{
    id: 'default',
    name: 'สถานที่หลัก',
    url: import.meta.env.VITE_API_BASE_URL || '',
    apiKey: import.meta.env.VITE_API_KEY || '',
    enabled: false,
  }],
  mqtt: {
    enabled: true,
    broker: 'wss://broker.hivemq.com:8884/mqtt',
    topics: ['mq2/sensor001/data'],
  },
  pinnedSensors: [],
  sensorCoordinates: [],
  lineNotify: {
    enabled: false,
    channelAccessToken: '',
    notifyOnWarning: false,
    notifyOnDanger: true,
    cooldownMinutes: 5,
  },
  demoMode: false,
  dashboardLayout: {
    positions: {
      top: 'statusCards',
      middleLeft: 'chart',
      middleRight: 'ranking',
      bottom: 'pinnedSensors',
      bottomLeft: 'miniMap',
      bottomMiddle: 'comparisonChart',
      bottomRight: 'statusHistory',
      trendPanel: 'trendAnalysis',
    },
  },
  sensorGroups: [],
  sensorAssignments: {},
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
      
      if (settingsBroadcastChannel) {
        settingsBroadcastChannel.postMessage({ type: 'settings-update', settings: updated });
      }
      return updated;
    });
  }, []);

  const resetSettings = useCallback(() => {
    const defaults = getDefaultSettings();
    localStorage.removeItem(STORAGE_KEY);
    setSettings(defaults);
    
    if (settingsBroadcastChannel) {
      settingsBroadcastChannel.postMessage({ type: 'settings-update', settings: defaults });
    }
  }, []);

  
  useEffect(() => {
    const autoDemoMode = import.meta.env.VITE_AUTO_DEMO_MODE === 'true';
    if (autoDemoMode) {
      const hasEnabledEndpoints = settings.apiEndpoints.some(ep => ep.enabled && ep.url);
      if (!hasEnabledEndpoints && !settings.demoMode) {
        
        updateSettings({ demoMode: true });
      }
    }
  }, [settings.apiEndpoints, settings.demoMode, updateSettings]);

  
  useEffect(() => {
    const handleBroadcastMessage = (event: MessageEvent) => {
      if (event.data?.type === 'settings-update' && event.data?.settings) {
        setSettings(event.data.settings);
      }
    };

    if (settingsBroadcastChannel) {
      settingsBroadcastChannel.addEventListener('message', handleBroadcastMessage);
    }

    
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY && event.newValue) {
        try {
          const newSettings = { ...getDefaultSettings(), ...JSON.parse(event.newValue) };
          setSettings(newSettings);
        } catch (e) {
          console.error('Error parsing settings:', e);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      if (settingsBroadcastChannel) {
        settingsBroadcastChannel.removeEventListener('message', handleBroadcastMessage);
      }
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return { settings, updateSettings, resetSettings };
};


export const getSensorStatusWithSettings = (
  value: number,
  warningThreshold: number,
  dangerThreshold: number
): 'safe' | 'warning' | 'danger' => {
  if (value >= dangerThreshold) return 'danger';
  if (value >= warningThreshold) return 'warning';
  return 'safe';
};
