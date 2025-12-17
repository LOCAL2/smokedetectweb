export interface SensorData {
  id: string;
  name: string;
  location: string;
  value: number;
  unit: string;
  timestamp: string;
  isOnline: boolean;
}

export interface SensorHistory {
  timestamp: string;
  value: number;
  sensorId?: string;
  sensorName?: string;
  location?: string;
}

export interface DashboardStats {
  totalSensors: number;
  onlineSensors: number;
  averageValue: number;
  maxValue: number;
  alertCount: number;
}

export interface SensorMaxValue {
  id: string;
  name: string;
  location: string;
  maxValue: number;
}
