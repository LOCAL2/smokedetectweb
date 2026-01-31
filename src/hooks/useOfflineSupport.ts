import { useState, useEffect, useCallback } from 'react';
import type { SensorData } from '../types/sensor';

interface CachedData {
  sensors: SensorData[];
  timestamp: number;
  stats: {
    totalSensors: number;
    averageValue: number;
    maxValue: number;
    minValue: number;
  };
}

const CACHE_KEY = 'offline-sensor-cache';
const CACHE_DURATION = 24 * 60 * 60 * 1000; 

export const useOfflineSupport = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [cachedData, setCachedData] = useState<CachedData | null>(() => {
    const saved = localStorage.getItem(CACHE_KEY);
    if (saved) {
      const data = JSON.parse(saved) as CachedData;
      
      if (Date.now() - data.timestamp < CACHE_DURATION) {
        return data;
      }
    }
    return null;
  });

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const cacheData = useCallback((sensors: SensorData[]) => {
    if (sensors.length === 0) return;

    const values = sensors.map(s => s.value);
    const data: CachedData = {
      sensors,
      timestamp: Date.now(),
      stats: {
        totalSensors: sensors.length,
        averageValue: values.reduce((a, b) => a + b, 0) / values.length,
        maxValue: Math.max(...values),
        minValue: Math.min(...values),
      },
    };

    setCachedData(data);
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  }, []);

  const getCachedData = useCallback((): CachedData | null => {
    return cachedData;
  }, [cachedData]);

  const clearCache = useCallback(() => {
    setCachedData(null);
    localStorage.removeItem(CACHE_KEY);
  }, []);

  const formatCacheAge = useCallback(() => {
    if (!cachedData) return null;
    
    const age = Date.now() - cachedData.timestamp;
    const minutes = Math.floor(age / 60000);
    const hours = Math.floor(age / 3600000);
    
    if (minutes < 1) return 'เมื่อสักครู่';
    if (minutes < 60) return `${minutes} นาทีที่แล้ว`;
    if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`;
    return 'มากกว่า 24 ชั่วโมง';
  }, [cachedData]);

  return {
    isOnline,
    cachedData,
    cacheData,
    getCachedData,
    clearCache,
    formatCacheAge,
    hasCachedData: cachedData !== null,
  };
};


