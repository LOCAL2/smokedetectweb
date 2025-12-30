import { createContext, useContext, useEffect, useRef, type ReactNode } from 'react';
import { useSensorData } from '../hooks/useSensorData';
import { useSettingsContext } from './SettingsContext';
import { useAnalyticsData } from '../hooks/useAnalyticsData';
import type { SensorData, SensorHistory, DashboardStats, SensorMaxValue } from '../types/sensor';

interface SensorHistoryMap {
  [sensorId: string]: SensorHistory[];
}

interface SensorDataContextType {
  sensors: SensorData[];
  history: SensorHistory[];
  sensorHistory: SensorHistoryMap;
  stats: DashboardStats;
  sensorMaxValues: SensorMaxValue[];
  isLoading: boolean;
  error: string | null;
  connectionStatus: 'connecting' | 'connected' | 'disconnected';
  refetch: () => void;
}

const SensorDataContext = createContext<SensorDataContextType | null>(null);

export const SensorDataProvider = ({ children }: { children: ReactNode }) => {
  const { settings } = useSettingsContext();
  const sensorData = useSensorData(settings);
  const { recordReading } = useAnalyticsData(settings.warningThreshold, settings.dangerThreshold);
  const lastRecordTime = useRef<number>(0);

  // Record sensor data to analytics (every 5 minutes to avoid too much data)
  useEffect(() => {
    const now = Date.now();
    const RECORD_INTERVAL = 5 * 60 * 1000; // 5 minutes
    
    if (sensorData.sensors.length > 0 && now - lastRecordTime.current > RECORD_INTERVAL) {
      lastRecordTime.current = now;
      
      sensorData.sensors.forEach(sensor => {
        const locationId = sensor.location || sensor.id;
        const locationName = sensor.location || sensor.name || sensor.id;
        recordReading(locationId, locationName, sensor.value);
      });
    }
  }, [sensorData.sensors, recordReading]);

  return (
    <SensorDataContext.Provider value={sensorData}>
      {children}
    </SensorDataContext.Provider>
  );
};

export const useSensorDataContext = () => {
  const context = useContext(SensorDataContext);
  if (!context) {
    throw new Error('useSensorDataContext must be used within SensorDataProvider');
  }
  return context;
};
