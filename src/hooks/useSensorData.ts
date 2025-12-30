import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import type { SensorData, SensorHistory, DashboardStats, SensorMaxValue } from '../types/sensor';
import type { SettingsConfig } from './useSettings';
import { getSensorStatusWithSettings } from './useSettings';
import { generateMockSensorData, resetMockData } from '../utils/mockData';

const HISTORY_STORAGE_KEY = 'smoke-sensor-history';
const SENSOR_MAX_STORAGE_KEY = 'smoke-sensor-max-values';
const SENSOR_HISTORY_KEY = 'smoke-sensor-individual-history';
const SENSOR_DATA_KEY = 'smoke-sensor-current-data';
const SENSOR_BROADCAST_CHANNEL = 'smoke-sensor-sync';

const GRAPH_RETENTION_MS = 30 * 60 * 1000; // 30 minutes
const GRAPH_UPDATE_INTERVAL_MS = 60 * 1000; // 1 minute

// Sound alert
const playAlertSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    gainNode.gain.value = 0.3;
    
    oscillator.start();
    
    // Beep pattern: beep-beep-beep
    setTimeout(() => { gainNode.gain.value = 0; }, 150);
    setTimeout(() => { gainNode.gain.value = 0.3; }, 250);
    setTimeout(() => { gainNode.gain.value = 0; }, 400);
    setTimeout(() => { gainNode.gain.value = 0.3; }, 500);
    setTimeout(() => { gainNode.gain.value = 0; }, 650);
    setTimeout(() => { 
      oscillator.stop();
      audioContext.close();
    }, 700);
  } catch (e) {
    console.error('Error playing alert sound:', e);
  }
};

// Browser notification
const showNotification = (title: string, body: string) => {
  if (!('Notification' in window)) return;
  
  if (Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: '/logo.jpg',
      badge: '/logo.jpg',
      tag: 'smoke-alert',
      requireInteraction: true,
    });
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        new Notification(title, {
          body,
          icon: '/logo.jpg',
          badge: '/logo.jpg',
          tag: 'smoke-alert',
          requireInteraction: true,
        });
      }
    });
  }
};

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

// Save/Load current sensor data for cross-tab sync
const saveSensorDataToStorage = (sensors: SensorData[]) => {
  try {
    localStorage.setItem(SENSOR_DATA_KEY, JSON.stringify({
      sensors,
      timestamp: Date.now()
    }));
  } catch (e) {
    console.error('Error saving sensor data:', e);
  }
};

const loadSensorDataFromStorage = (): { sensors: SensorData[]; timestamp: number } | null => {
  try {
    const saved = localStorage.getItem(SENSOR_DATA_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Error loading sensor data:', e);
  }
  return null;
};

// BroadcastChannel for real-time cross-tab sync
let broadcastChannel: BroadcastChannel | null = null;
try {
  broadcastChannel = new BroadcastChannel(SENSOR_BROADCAST_CHANNEL);
} catch (e) {
  console.log('BroadcastChannel not supported, using localStorage fallback');
}

// Primary tab management - only one tab should fetch/generate data
const PRIMARY_TAB_KEY = 'smoke-sensor-primary-tab';
const TAB_ID = `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const claimPrimaryTab = (): boolean => {
  const existing = localStorage.getItem(PRIMARY_TAB_KEY);
  if (existing) {
    try {
      const data = JSON.parse(existing);
      // If existing primary tab is still alive (heartbeat within 3 seconds), don't claim
      if (Date.now() - data.heartbeat < 3000) {
        return false;
      }
    } catch (e) {}
  }
  // Claim as primary
  localStorage.setItem(PRIMARY_TAB_KEY, JSON.stringify({ tabId: TAB_ID, heartbeat: Date.now() }));
  return true;
};

const updateHeartbeat = () => {
  const existing = localStorage.getItem(PRIMARY_TAB_KEY);
  if (existing) {
    try {
      const data = JSON.parse(existing);
      if (data.tabId === TAB_ID) {
        localStorage.setItem(PRIMARY_TAB_KEY, JSON.stringify({ tabId: TAB_ID, heartbeat: Date.now() }));
      }
    } catch (e) {}
  }
};

const releasePrimaryTab = () => {
  const existing = localStorage.getItem(PRIMARY_TAB_KEY);
  if (existing) {
    try {
      const data = JSON.parse(existing);
      if (data.tabId === TAB_ID) {
        localStorage.removeItem(PRIMARY_TAB_KEY);
      }
    } catch (e) {}
  }
};

// โหลด sensor stats (max, min, sum, count สำหรับ 24 ชั่วโมง)
interface StoredSensorMax {
  id: string;
  name: string;
  location: string;
  maxValue: number;
  minValue: number;
  sumValue: number;
  count: number;
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
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  
  const intervalRef = useRef<number | null>(null);
  const heartbeatRef = useRef<number | null>(null);
  const historyRef = useRef<SensorHistory[]>(loadHistoryFromStorage());
  const sensorHistoryRef = useRef<SensorHistoryMap>(loadSensorHistoryFromStorage());
  const sensorMaxRef = useRef<Map<string, StoredSensorMax>>(loadSensorMaxFromStorage());
  const sensorsRef = useRef<Map<string, SensorData>>(new Map());
  const lastAlertTimeRef = useRef<number>(0);
  const wasInDangerRef = useRef<boolean>(false);
  const isPrimaryTabRef = useRef<boolean>(false);

  // Process incoming sensor data
  const processSensorData = useCallback((allData: SensorData[], fromBroadcast = false) => {
    if (allData.length === 0) return;

    setSensors(allData);
    
    // Save to localStorage and broadcast to other tabs (only if this is the source)
    if (!fromBroadcast) {
      saveSensorDataToStorage(allData);
      if (broadcastChannel) {
        broadcastChannel.postMessage({ type: 'sensor-update', sensors: allData });
      }
    }

    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    
    allData.forEach(sensor => {
      const locationKey = sensor.location || sensor.id;
      
      // Update stats (max, min, avg)
      const existing = sensorMaxRef.current.get(locationKey);
      if (!existing || existing.timestamp < oneDayAgo) {
        sensorMaxRef.current.set(locationKey, {
          id: locationKey,
          name: sensor.name,
          location: sensor.location,
          maxValue: sensor.value,
          minValue: sensor.value,
          sumValue: sensor.value,
          count: 1,
          timestamp: now,
        });
      } else {
        sensorMaxRef.current.set(locationKey, {
          ...existing,
          maxValue: Math.max(existing.maxValue, sensor.value),
          minValue: Math.min(existing.minValue, sensor.value),
          sumValue: existing.sumValue + sensor.value,
          count: existing.count + 1,
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
    
    // Sort max values with min/avg
    const sortedMaxValues: SensorMaxValue[] = Array.from(sensorMaxRef.current.values())
      .map(item => ({
        id: item.id,
        name: item.name,
        location: item.location,
        maxValue: item.maxValue,
        minValue: item.minValue,
        avgValue: item.count > 0 ? Math.round(item.sumValue / item.count) : 0,
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

    // Check for danger alerts and trigger notifications
    const dangerSensors = allData.filter(s => 
      getSensorStatusWithSettings(s.value, settings.warningThreshold, settings.dangerThreshold) === 'danger'
    );
    
    const isInDanger = dangerSensors.length > 0;
    const timeSinceLastAlert = now - lastAlertTimeRef.current;
    const alertCooldown = 30000; // 30 seconds between alerts
    
    // Only alert when entering danger state (not continuously)
    if (isInDanger && !wasInDangerRef.current && timeSinceLastAlert > alertCooldown) {
      lastAlertTimeRef.current = now;
      
      // Play sound alert
      if (settings.enableSoundAlert) {
        playAlertSound();
      }
      
      // Show browser notification
      if (settings.enableNotification) {
        const sensorNames = dangerSensors.map(s => s.location || s.name || s.id).join(', ');
        const maxDangerValue = Math.max(...dangerSensors.map(s => s.value));
        showNotification(
          'ตรวจพบควันระดับอันตราย!',
          `${sensorNames} - ค่าสูงสุด ${maxDangerValue.toFixed(0)} PPM`
        );
      }
    }
    
    wasInDangerRef.current = isInDanger;

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

  // Fetch via HTTP
  const fetchSensorData = useCallback(async () => {
    try {
      const enabledEndpoints = settings.apiEndpoints.filter(ep => ep.enabled);
      
      if (enabledEndpoints.length === 0) {
        setError('ไม่มี API endpoint ที่เปิดใช้งาน');
        setIsLoading(false);
        return;
      }

      // Clear old sensors and rebuild from fresh data each fetch
      const newSensorsMap = new Map<string, SensorData>();

      for (const endpoint of enabledEndpoints) {
        try {
          const response = await axios.get(endpoint.url, {
            headers: endpoint.apiKey ? { 'Authorization': `Bearer ${endpoint.apiKey}` } : {},
          });
          
          let rawData: SensorData[] = [];
          
          // Handle different response formats
          if (Array.isArray(response.data)) {
            rawData = response.data;
          } else if (response.data && typeof response.data === 'object') {
            if (response.data.id || response.data.value !== undefined) {
              rawData = [response.data];
            } else {
              rawData = Object.values(response.data).filter(
                (item): item is SensorData => item !== null && typeof item === 'object'
              );
            }
          }
          
          // Add to new sensors map (only sensors that responded)
          rawData.forEach((sensor: SensorData, index: number) => {
            const sensorId = `${endpoint.id}-${sensor.id || index}`;
            newSensorsMap.set(sensorId, {
              ...sensor,
              id: sensorId,
              location: sensor.location || endpoint.name,
            });
          });

          setConnectionStatus('connected');
        } catch (err) {
          console.error(`Error fetching from ${endpoint.name}:`, err);
          setConnectionStatus('disconnected');
        }
      }

      // Replace sensorsRef with only the sensors that responded
      sensorsRef.current = newSensorsMap;
      const allSensors = Array.from(newSensorsMap.values());
      
      if (allSensors.length === 0) {
        // Clear sensors state when no data
        setSensors([]);
        setError('ไม่สามารถเชื่อมต่อกับเซ็นเซอร์ได้');
        setIsLoading(false);
        return;
      }

      processSensorData(allSensors);
    } catch (err) {
      setError('ไม่สามารถเชื่อมต่อกับเซ็นเซอร์ได้');
      setConnectionStatus('disconnected');
      console.error('Fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [settings.apiEndpoints, processSensorData]);

  // Start HTTP polling
  const startHttpPolling = useCallback(() => {
    fetchSensorData();
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = window.setInterval(fetchSensorData, settings.pollingInterval);
  }, [fetchSensorData, settings.pollingInterval]);

  // Demo mode: generate mock data
  const startDemoMode = useCallback(() => {
    console.log('🎮 Demo Mode: Starting with mock sensor data');
    resetMockData();
    setConnectionStatus('connected');
    setError(null);
    
    const updateMockData = () => {
      const mockSensors = generateMockSensorData();
      // Clear and rebuild sensorsRef for demo mode too
      sensorsRef.current.clear();
      mockSensors.forEach(sensor => {
        sensorsRef.current.set(sensor.id, sensor);
      });
      processSensorData(mockSensors);
    };
    
    updateMockData();
    setIsLoading(false);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = window.setInterval(updateMockData, settings.pollingInterval);
  }, [processSensorData, settings.pollingInterval]);

  // Setup connections based on settings
  useEffect(() => {
    // Listen for cross-tab updates via BroadcastChannel
    const handleBroadcastMessage = (event: MessageEvent) => {
      if (event.data?.type === 'sensor-update' && event.data?.sensors) {
        processSensorData(event.data.sensors, true);
        setConnectionStatus('connected');
        setIsLoading(false);
      }
    };
    
    if (broadcastChannel) {
      broadcastChannel.addEventListener('message', handleBroadcastMessage);
    }
    
    // Check if another tab already has data (load from localStorage on mount)
    const existingData = loadSensorDataFromStorage();
    if (existingData && existingData.sensors.length > 0) {
      const dataAge = Date.now() - existingData.timestamp;
      // Use existing data if it's less than 2x polling interval old
      if (dataAge < settings.pollingInterval * 2) {
        processSensorData(existingData.sensors, true);
        setConnectionStatus('connected');
        setIsLoading(false);
      }
    }

    // Try to become primary tab
    isPrimaryTabRef.current = claimPrimaryTab();
    
    // Start heartbeat if primary
    if (isPrimaryTabRef.current) {
      heartbeatRef.current = window.setInterval(() => {
        updateHeartbeat();
      }, 1000);
    }
    
    // If not primary, try to claim periodically (in case primary tab closes)
    const tryClaimInterval = !isPrimaryTabRef.current ? window.setInterval(() => {
      if (!isPrimaryTabRef.current && claimPrimaryTab()) {
        isPrimaryTabRef.current = true;
        // Start heartbeat
        if (!heartbeatRef.current) {
          heartbeatRef.current = window.setInterval(() => {
            updateHeartbeat();
          }, 1000);
        }
        // Start data fetching
        if (settings.demoMode) {
          startDemoMode();
        } else {
          startHttpPolling();
        }
      }
    }, 2000) : null;

    // Only primary tab fetches/generates data
    if (isPrimaryTabRef.current) {
      if (settings.demoMode) {
        sensorsRef.current.clear();
        startDemoMode();
      } else {
        const enabledEndpoints = settings.apiEndpoints.filter(ep => ep.enabled);
        if (enabledEndpoints.length === 0) {
          setError('ไม่มี API endpoint ที่เปิดใช้งาน');
          setIsLoading(false);
        } else {
          startHttpPolling();
        }
      }
    } else {
      // Non-primary tab just waits for broadcasts
      setIsLoading(false);
      if (existingData && existingData.sensors.length > 0) {
        setConnectionStatus('connected');
      }
    }

    return () => {
      sensorsRef.current.clear();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
        heartbeatRef.current = null;
      }
      if (tryClaimInterval) {
        clearInterval(tryClaimInterval);
      }
      if (broadcastChannel) {
        broadcastChannel.removeEventListener('message', handleBroadcastMessage);
      }
      // Release primary tab on unmount
      releasePrimaryTab();
    };
  }, [settings.apiEndpoints, settings.pollingInterval, settings.demoMode, startHttpPolling, startDemoMode, processSensorData]);

  return {
    sensors,
    history,
    sensorHistory,
    stats,
    sensorMaxValues,
    isLoading,
    error,
    connectionStatus,
    refetch: fetchSensorData,
  };
};
