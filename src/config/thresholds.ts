
export interface ThresholdConfig {
  warning: number;
  danger: number;
}

export const THRESHOLDS: ThresholdConfig = {
  warning: Number(import.meta.env.VITE_THRESHOLD_WARNING) || 70,
  danger: Number(import.meta.env.VITE_THRESHOLD_DANGER) || 150,
};

export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || '',
  apiKey: import.meta.env.VITE_API_KEY || '',
  pollingInterval: Number(import.meta.env.VITE_POLLING_INTERVAL) || 5000,
};

export const ALERT_CONFIG = {
  enableSound: import.meta.env.VITE_ENABLE_SOUND_ALERT === 'true',
  enableNotification: import.meta.env.VITE_ENABLE_NOTIFICATION === 'true',
};

export type SensorStatus = 'safe' | 'warning' | 'danger';

export const getSensorStatus = (value: number): SensorStatus => {
  if (value >= THRESHOLDS.danger) return 'danger';
  if (value >= THRESHOLDS.warning) return 'warning';
  return 'safe';
};

export const STATUS_COLORS = {
  safe: {
    primary: '#10B981',
    bg: 'rgba(16, 185, 129, 0.1)',
    glow: '0 0 30px rgba(16, 185, 129, 0.4)',
  },
  warning: {
    primary: '#F59E0B',
    bg: 'rgba(245, 158, 11, 0.1)',
    glow: '0 0 30px rgba(245, 158, 11, 0.4)',
  },
  danger: {
    primary: '#EF4444',
    bg: 'rgba(239, 68, 68, 0.1)',
    glow: '0 0 30px rgba(239, 68, 68, 0.6)',
  },
};

export const STATUS_LABELS = {
  safe: 'ปลอดภัย',
  warning: 'เฝ้าระวัง',
  danger: 'อันตราย',
};
