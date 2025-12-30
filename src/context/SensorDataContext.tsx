import { createContext, useContext, type ReactNode } from 'react';
import { useSensorData } from '../hooks/useSensorData';
import { useSettingsContext } from './SettingsContext';
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
