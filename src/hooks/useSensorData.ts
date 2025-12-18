import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import type { SensorData, SensorHistory, DashboardStats, SensorMaxValue } from '../types/sensor';
import type { SettingsConfig } from './useSettings';
import { getSensorStatusWithSettings } from './useSettings';

const HISTORY_STORAGE_KEY = 'smoke-sensor-history';
const SENSOR_MAX_STORAGE_KEY = 'smoke-sensor-max-values';
const SENSOR_HISTORY_KEY = 'smoke-sensor-individual-history';

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

// แปลง HTTP URL เป็น WebSocket URL
const httpToWsUrl = (httpUrl: string): string => {
  try {
    // ถ้าเว็บโหลดผ่าน HTTPS แต่ API เป็น HTTP จะไม่สามารถใช้ ws:// ได้ (Mixed Content)
    const isPageHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
    const url = new URL(httpUrl);
    const isApiHttp = url.protocol === 'http:';
    
    // ถ้าเว็บเป็น HTTPS แต่ API เป็น HTTP ให้ return empty เพื่อ fallback ไป HTTP polling
    if (isPageHttps && isApiHttp) {
      console.log('HTTPS page cannot connect to ws:// - using HTTP polling instead');
      return '';
    }
    
    const wsProtocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
    // ESP32 ใช้ port 81 สำหรับ WebSocket
    const wsPort = url.port === '3000' ? '3000' : '81';
    return `${wsProtocol}//${url.hostname}:${wsPort}/`;
  } catch {
    return '';
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
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  
  const intervalRef = useRef<number | null>(null);
  const historyRef = useRef<SensorHistory[]>(loadHistoryFromStorage());
  const sensorHistoryRef = useRef<SensorHistoryMap>(loadSensorHistoryFromStorage());
  const sensorMaxRef = useRef<Map<string, StoredSensorMax>>(loadSensorMaxFromStorage());
  const wsRef = useRef<Map<string, WebSocket>>(new Map());
  const sensorsRef = useRef<Map<string, SensorData>>(new Map());

  // Process incoming sensor data (shared between HTTP and WebSocket)
  const processSensorData = useCallback((allData: SensorData[]) => {
    if (allData.length === 0) return;

    setSensors(allData);

    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    
    allData.forEach(sensor => {
      const locationKey = sensor.location || sensor.id;
      
      // Update max values
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

      // Update individual sensor history
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
        ].slice(-500);
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
    const lastHistEntry = historyRef.current[historyRef.current.length - 1];
    const shouldAddEntry = !lastHistEntry || 
      (historyNow.getTime() - new Date(lastHistEntry.timestamp).getTime()) >= GRAPH_UPDATE_INTERVAL_MS;
    
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
    setIsLoading(false);
  }, [settings.warningThreshold, settings.dangerThreshold]);


  // Track if we've fallen back to HTTP (stop trying WebSocket)
  const usingHttpFallbackRef = useRef(false);
  const wsReconnectTimeoutRef = useRef<Map<string, number>>(new Map());

  // Connect to WebSocket endpoint with fallback to HTTP
  const connectWebSocket = useCallback((endpoint: { id: string; url: string; name: string; enabled: boolean }, onFallback: () => void) => {
    // Don't try WebSocket if already using HTTP fallback
    if (usingHttpFallbackRef.current) {
      return;
    }

    const wsUrl = httpToWsUrl(endpoint.url);
    if (!wsUrl) {
      onFallback();
      return;
    }

    // Close existing connection
    const existingWs = wsRef.current.get(endpoint.id);
    if (existingWs) {
      existingWs.close();
    }

    // Clear any pending reconnect
    const existingTimeout = wsReconnectTimeoutRef.current.get(endpoint.id);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    console.log(`Connecting WebSocket to ${wsUrl}`);
    const ws = new WebSocket(wsUrl);
    let hasConnected = false;

    ws.onopen = () => {
      hasConnected = true;
      console.log(`WebSocket connected: ${endpoint.name}`);
      setConnectionStatus('connected');
      setError(null);
    };

    ws.onmessage = (event) => {
      try {
        const rawData = JSON.parse(event.data);
        const dataArray = Array.isArray(rawData) ? rawData : [rawData];
        
        // Update sensors map (without triggering re-render)
        dataArray.forEach((sensor: SensorData) => {
          const sensorId = `${endpoint.id}-${sensor.id || 'default'}`;
          sensorsRef.current.set(sensorId, {
            ...sensor,
            id: sensorId,
            location: sensor.location || endpoint.name,
          });
        });

        // Process immediately - no throttle
        const allSensors = Array.from(sensorsRef.current.values());
        processSensorData(allSensors);
      } catch (err) {
        console.error('WebSocket message error:', err);
      }
    };

    ws.onerror = () => {
      // Silent - onclose will handle fallback
    };

    ws.onclose = () => {
      console.log(`WebSocket closed: ${endpoint.name}`);
      wsRef.current.delete(endpoint.id);
      
      // Don't do anything if already using HTTP fallback
      if (usingHttpFallbackRef.current) {
        return;
      }
      
      // If never connected, fallback to HTTP permanently
      if (!hasConnected) {
        console.log(`WebSocket failed for ${endpoint.name}, switching to HTTP polling`);
        usingHttpFallbackRef.current = true;
        setConnectionStatus('disconnected');
        onFallback();
      } else {
        // Was connected before, try to reconnect after 3 seconds
        setConnectionStatus('disconnected');
        const timeoutId = window.setTimeout(() => {
          if (endpoint.enabled && !usingHttpFallbackRef.current) {
            connectWebSocket(endpoint, onFallback);
          }
        }, 3000);
        wsReconnectTimeoutRef.current.set(endpoint.id, timeoutId);
      }
    };

    wsRef.current.set(endpoint.id, ws);
  }, [processSensorData]);

  // Fetch via HTTP (only for endpoints not connected via WebSocket)
  const fetchSensorData = useCallback(async () => {
    try {
      const enabledEndpoints = settings.apiEndpoints.filter(ep => ep.enabled);
      
      if (enabledEndpoints.length === 0) {
        setError('ไม่มี API endpoint ที่เปิดใช้งาน');
        setIsLoading(false);
        return;
      }

      // Only fetch from endpoints that don't have active WebSocket
      const endpointsToFetch = enabledEndpoints.filter(ep => !wsRef.current.has(ep.id));
      
      for (const endpoint of endpointsToFetch) {
        try {
          const response = await axios.get(endpoint.url, {
            headers: endpoint.apiKey ? { 'Authorization': `Bearer ${endpoint.apiKey}` } : {},
          });
          
          let rawData: SensorData[] = [];
          
          // Handle different response formats
          if (Array.isArray(response.data)) {
            // Normal array format
            rawData = response.data;
          } else if (response.data && typeof response.data === 'object') {
            // Firebase format: { "sensor-001": {...}, "sensor-002": {...} }
            // Or single object format
            if (response.data.id || response.data.value !== undefined) {
              // Single sensor object
              rawData = [response.data];
            } else {
              // Firebase object format - convert to array
              rawData = Object.values(response.data).filter(
                (item): item is SensorData => item !== null && typeof item === 'object'
              );
            }
          }
          
          // Update sensorsRef (merge with existing)
          rawData.forEach((sensor: SensorData, index: number) => {
            const sensorId = `${endpoint.id}-${sensor.id || index}`;
            sensorsRef.current.set(sensorId, {
              ...sensor,
              id: sensorId,
              location: sensor.location || endpoint.name,
            });
          });
        } catch (err) {
          console.error(`Error fetching from ${endpoint.name}:`, err);
        }
      }

      // Process all sensors from ref
      const allSensors = Array.from(sensorsRef.current.values());
      
      if (allSensors.length === 0) {
        setError('ไม่สามารถเชื่อมต่อกับเซ็นเซอร์ได้');
        setIsLoading(false);
        return;
      }

      processSensorData(allSensors);
    } catch (err) {
      setError('ไม่สามารถเชื่อมต่อกับเซ็นเซอร์ได้');
      console.error('Fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [settings.apiEndpoints, processSensorData]);


  // Start HTTP polling for specific endpoints or all
  const startHttpPolling = useCallback(() => {
    // Initial fetch
    fetchSensorData();
    
    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // Start polling
    intervalRef.current = window.setInterval(fetchSensorData, settings.pollingInterval);
  }, [fetchSensorData, settings.pollingInterval]);

  // Setup connections based on settings
  useEffect(() => {
    const enabledEndpoints = settings.apiEndpoints.filter(ep => ep.enabled);
    
    if (enabledEndpoints.length === 0) {
      setError('ไม่มี API endpoint ที่เปิดใช้งาน');
      setIsLoading(false);
      return;
    }

    // Reset fallback tracking on settings change
    usingHttpFallbackRef.current = false;

    // Check if using WebSocket mode
    if (settings.useWebSocket) {
      let fallbackStarted = false;
      
      // Try WebSocket first, fallback to HTTP if fails
      const startFallback = () => {
        if (!fallbackStarted) {
          fallbackStarted = true;
          console.log('Falling back to HTTP polling');
          startHttpPolling();
        }
      };

      // Connect via WebSocket
      enabledEndpoints.forEach(endpoint => {
        connectWebSocket(endpoint, startFallback);
      });

      return () => {
        // Cleanup WebSocket connections
        wsRef.current.forEach(ws => ws.close());
        wsRef.current.clear();
        sensorsRef.current.clear();
        wsReconnectTimeoutRef.current.forEach(timeout => clearTimeout(timeout));
        wsReconnectTimeoutRef.current.clear();
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    } else {
      // Use HTTP polling directly
      startHttpPolling();
      
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    }
  }, [settings.apiEndpoints, settings.useWebSocket, settings.pollingInterval, connectWebSocket, startHttpPolling, processSensorData]);

  return { 
    sensors, 
    history, 
    sensorHistory, 
    stats, 
    sensorMaxValues, 
    isLoading, 
    error, 
    connectionStatus,
    refetch: fetchSensorData 
  };
};
