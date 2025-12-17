import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import type { SensorData, SensorHistory, DashboardStats, SensorMaxValue } from '../types/sensor';
import type { SettingsConfig } from './useSettings';
import { getSensorStatusWithSettings } from './useSettings';

const HISTORY_STORAGE_KEY = 'smoke-sensor-history';
const SENSOR_MAX_STORAGE_KEY = 'smoke-sensor-max-values';
const SENSOR_HISTORY_KEY = 'smoke-sensor-individual-history';

// โหลด history จาก localStorage
const GRAPH_RETENTION_MS = 30 * 60 * 1000; // 30 minutes
const GRAPH_UPDATE_INTERVAL_MS = 60 * 1000; // 1 minute

// โหลด history จาก localStorage
const loadHistoryFromStorage = (): SensorHistory[] => {
  try {
    const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      const cutoffTime = Date.now() - GRAPH_RETENTION_MS;
      return data.filter((item: SensorHistory) => new Date(item.timestamp).getTime() > cutoffTime);
    }
  } catch (e) {
    console.error('Error loading history:', e);
  }
  return [];
};

const saveHistoryToStorage = (history: SensorHistory[]) => {
  try {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
  } catch (e) {
    console.error('Error saving history:', e);
  }
};

// โหลด sensor individual history
interface SensorHistoryMap {
  [sensorId: string]: SensorHistory[];
}

const loadSensorHistoryFromStorage = (): SensorHistoryMap => {
  try {
    const saved = localStorage.getItem(SENSOR_HISTORY_KEY);
    if (saved) {
      const data: SensorHistoryMap = JSON.parse(saved);
      const cutoffTime = Date.now() - GRAPH_RETENTION_MS;
      const filtered: SensorHistoryMap = {};
      Object.keys(data).forEach(sensorId => {
        filtered[sensorId] = data[sensorId].filter(
          item => new Date(item.timestamp).getTime() > cutoffTime
        );
      });
      return filtered;
    }
  } catch (e) {
    console.error('Error loading sensor history:', e);
  }
  return {};
};

const saveSensorHistoryToStorage = (history: SensorHistoryMap) => {
  try {
    localStorage.setItem(SENSOR_HISTORY_KEY, JSON.stringify(history));
  } catch (e) {
    console.error('Error saving sensor history:', e);
  }
};

// โหลด sensor max values
interface StoredSensorMax {
  id: string;
  name: string;
  location: string;
  maxValue: number;
  timestamp: number;
}

const loadSensorMaxFromStorage = (): Map<string, StoredSensorMax> => {
  try {
    const saved = localStorage.getItem(SENSOR_MAX_STORAGE_KEY);
    if (saved) {
      const data: StoredSensorMax[] = JSON.parse(saved);
      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
      const map = new Map<string, StoredSensorMax>();
      data.forEach(item => {
        if (item.timestamp > oneDayAgo) {
          map.set(item.id, item);
        }
      });
      return map;
    }
  } catch (e) {
    console.error('Error loading sensor max:', e);
  }
  return new Map();
};

const saveSensorMaxToStorage = (maxMap: Map<string, StoredSensorMax>) => {
  try {
    localStorage.setItem(SENSOR_MAX_STORAGE_KEY, JSON.stringify(Array.from(maxMap.values())));
  } catch (e) {
    console.error('Error saving sensor max:', e);
  }
};

export const useSensorData = (settings: SettingsConfig) => {
  const [sensors, setSensors] = useState<SensorData[]>([]);
  const [history, setHistory] = useState<SensorHistory[]>(loadHistoryFromStorage);
  const [sensorHistory, setSensorHistory] = useState<SensorHistoryMap>(loadSensorHistoryFromStorage);
  const [sensorMaxValues, setSensorMaxValues] = useState<SensorMaxValue[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalSensors: 0,
    onlineSensors: 0,
    averageValue: 0,
    maxValue: 0,
    alertCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<number | null>(null);
  const historyRef = useRef<SensorHistory[]>(loadHistoryFromStorage());
  const sensorHistoryRef = useRef<SensorHistoryMap>(loadSensorHistoryFromStorage());
  const sensorMaxRef = useRef<Map<string, StoredSensorMax>>(loadSensorMaxFromStorage());

  const fetchSensorData = useCallback(async () => {
    try {
      const enabledEndpoints = settings.apiEndpoints.filter(ep => ep.enabled);
      
      if (enabledEndpoints.length === 0) {
        setError('ไม่มี API endpoint ที่เปิดใช้งาน');
        setIsLoading(false);
        return;
      }

      // ดึงข้อมูลจากทุก endpoint
      const allData: SensorData[] = [];
      
      for (const endpoint of enabledEndpoints) {
        try {
          // ใช้ URL ตรงๆ ไม่ต่อ /sensor อัตโนมัติ
          const response = await axios.get(endpoint.url, {
            headers: endpoint.apiKey ? { 'Authorization': `Bearer ${endpoint.apiKey}` } : {},
          });
          
          // รองรับทั้ง array และ object เดี่ยว
          const rawData = Array.isArray(response.data) ? response.data : [response.data];
          
          const data: SensorData[] = rawData.map((sensor: SensorData) => ({
            ...sensor,
            id: `${endpoint.id}-${sensor.id}`,
            location: sensor.location || endpoint.name,
          }));
          
          allData.push(...data);
        } catch (err) {
          console.error(`Error fetching from ${endpoint.name}:`, err);
        }
      }

      if (allData.length === 0) {
        setError('ไม่สามารถเชื่อมต่อกับเซ็นเซอร์ได้');
        setIsLoading(false);
        return;
      }

      setSensors(allData);

      // อัพเดท max values และ individual history
      const now = Date.now();
      const oneDayAgo = now - 24 * 60 * 60 * 1000;
      
      allData.forEach(sensor => {
        // ใช้ location เป็น key เพื่อไม่ให้ซ้ำ
        const locationKey = sensor.location || sensor.id;
        
        // Update max values - ใช้ location เป็น key
        const existing = sensorMaxRef.current.get(locationKey);
        if (!existing || existing.timestamp < oneDayAgo || sensor.value > existing.maxValue) {
          sensorMaxRef.current.set(locationKey, {
            id: locationKey,
            name: sensor.name,
            location: sensor.location,
            maxValue: existing && existing.timestamp > oneDayAgo 
              ? Math.max(existing.maxValue, sensor.value) 
              : sensor.value,
            timestamp: now,
          });
        }

        // Update individual sensor history - ใช้ location เป็น key
        if (!sensorHistoryRef.current[locationKey]) {
          sensorHistoryRef.current[locationKey] = [];
        }
        
        const sensorHist = sensorHistoryRef.current[locationKey];
        const lastEntry = sensorHist[sensorHist.length - 1];
        const shouldAdd = !lastEntry || (now - new Date(lastEntry.timestamp).getTime()) >= GRAPH_UPDATE_INTERVAL_MS;
        const cutoffTime = now - GRAPH_RETENTION_MS;
        
        if (shouldAdd) {
          sensorHistoryRef.current[locationKey] = [
            ...sensorHist.filter(h => new Date(h.timestamp).getTime() > cutoffTime),
            {
              timestamp: new Date(now).toISOString(),
              value: sensor.value,
              sensorId: locationKey,
              sensorName: sensor.name,
              location: sensor.location,
            }
          ].slice(-500); // Keep max 500 entries per sensor
        }
      });
      
      // Clean old max values
      sensorMaxRef.current.forEach((value, key) => {
        if (value.timestamp < oneDayAgo) {
          sensorMaxRef.current.delete(key);
        }
      });
      
      saveSensorMaxToStorage(sensorMaxRef.current);
      saveSensorHistoryToStorage(sensorHistoryRef.current);
      setSensorHistory({ ...sensorHistoryRef.current });
      
      // Sort max values
      const sortedMaxValues: SensorMaxValue[] = Array.from(sensorMaxRef.current.values())
        .map(item => ({
          id: item.id,
          name: item.name,
          location: item.location,
          maxValue: item.maxValue,
        }))
        .sort((a, b) => b.maxValue - a.maxValue);
      
      setSensorMaxValues(sortedMaxValues);

      // Calculate stats
      const onlineSensors = allData.filter(s => s.isOnline);
      const values = onlineSensors.map(s => s.value);
      const avgValue = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
      const maxValue = values.length > 0 ? Math.max(...values) : 0;
      const alertCount = allData.filter(s => 
        getSensorStatusWithSettings(s.value, settings.warningThreshold, settings.dangerThreshold) !== 'safe'
      ).length;

      setStats({
        totalSensors: allData.length,
        onlineSensors: onlineSensors.length,
        averageValue: Math.round(avgValue),
        maxValue,
        alertCount,
      });

      // Save average history
      const historyNow = new Date();
      const lastEntry = historyRef.current[historyRef.current.length - 1];
      const shouldAddEntry = !lastEntry || 
        (historyNow.getTime() - new Date(lastEntry.timestamp).getTime()) >= GRAPH_UPDATE_INTERVAL_MS;
      
      if (shouldAddEntry && avgValue > 0) {
        const newHistoryPoint: SensorHistory = {
          timestamp: historyNow.toISOString(),
          value: Math.round(avgValue),
        };
        
        const cutoffTime = historyNow.getTime() - GRAPH_RETENTION_MS;
        const filteredHistory = historyRef.current.filter(
          item => new Date(item.timestamp).getTime() > cutoffTime
        );
        
        historyRef.current = [...filteredHistory, newHistoryPoint];
        setHistory(historyRef.current);
        saveHistoryToStorage(historyRef.current);
      }

      setError(null);
    } catch (err) {
      setError('ไม่สามารถเชื่อมต่อกับเซ็นเซอร์ได้');
      console.error('Fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [settings.apiEndpoints, settings.warningThreshold, settings.dangerThreshold]);

  useEffect(() => {
    fetchSensorData();
  }, [fetchSensorData]);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = window.setInterval(fetchSensorData, settings.pollingInterval);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchSensorData, settings.pollingInterval]);

  return { sensors, history, sensorHistory, stats, sensorMaxValues, isLoading, error, refetch: fetchSensorData };
};
