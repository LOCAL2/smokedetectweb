import { useEffect, useState, useRef, useCallback } from 'react';
import mqtt, { MqttClient } from 'mqtt';
import type { SensorData } from '../types/sensor';

interface MqttConfig {
  broker: string;
  topics: string[];
  enabled: boolean;
}

interface UseMqttReturn {
  sensors: Map<string, SensorData>;
  connected: boolean;
  error: string | null;
  client: MqttClient | null;
}

export const useMqtt = (config: MqttConfig): UseMqttReturn => {
  const [sensors, setSensors] = useState<Map<string, SensorData>>(new Map());
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [client, setClient] = useState<MqttClient | null>(null);
  
  const sensorsRef = useRef<Map<string, SensorData>>(new Map());
  const lastUpdateRef = useRef<Map<string, number>>(new Map());

  const updateSensor = useCallback((sensorData: SensorData) => {
    const now = Date.now();
    const lastUpdate = lastUpdateRef.current.get(sensorData.id) || 0;
    
    // Update immediately (no throttle for real-time data)
    if (now - lastUpdate < 50) return;
    
    sensorsRef.current.set(sensorData.id, sensorData);
    lastUpdateRef.current.set(sensorData.id, now);
    setSensors(new Map(sensorsRef.current));
  }, []);

  useEffect(() => {
    if (!config.enabled || config.topics.length === 0) {
      setConnected(false);
      setError(null);
      setSensors(new Map());
      return;
    }

    // Validate and fix broker URL
    let brokerUrl = config.broker.trim();
    
    // Check if broker URL has protocol
    if (!brokerUrl.startsWith('ws://') && !brokerUrl.startsWith('wss://')) {
      // Add default protocol based on current page protocol
      const defaultProtocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
      brokerUrl = defaultProtocol + brokerUrl;
      console.warn('⚠️ MQTT broker URL missing protocol, added:', defaultProtocol);
    }
    
    // Determine broker URL based on protocol
    if (window.location.protocol === 'https:') {
      brokerUrl = brokerUrl.replace('ws://', 'wss://').replace(':8083', ':8884');
    }

    const mqttClient = mqtt.connect(brokerUrl, {
      clientId: 'web_' + Math.random().toString(16).substr(2, 8),
      clean: true,
      reconnectPeriod: 1000,
      connectTimeout: 30000,
      keepalive: 60,
    });

    mqttClient.on('connect', () => {
      setConnected(true);
      setError(null);
      
      // Subscribe ทันทีหลัง connect
      config.topics.forEach(topic => {
        mqttClient.subscribe(topic, { qos: 0 }, (err) => {
          if (err) {
            setError(`ไม่สามารถ subscribe ${topic}`);
          }
        });
      });
    });

    mqttClient.on('message', (_topic, message) => {
      try {
        const data = JSON.parse(message.toString()) as SensorData;
        
        // Validate required fields
        if (!data.id || data.value === undefined) {
          return;
        }

        // Ensure all required fields exist
        const sensorData: SensorData = {
          id: data.id,
          name: data.name || data.id,
          location: data.location || 'Unknown',
          value: data.value,
          unit: data.unit || 'ADC',
          timestamp: data.timestamp || new Date().toISOString(),
          isOnline: data.isOnline !== undefined ? data.isOnline : true,
        };

        updateSensor(sensorData);
      } catch (_err) {
        // Ignore invalid messages silently
      }
    });

    mqttClient.on('error', () => {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ MQTT');
      setConnected(false);
    });

    mqttClient.on('offline', () => {
      setConnected(false);
    });

    mqttClient.on('reconnect', () => {
      setError(null);
    });

    setClient(mqttClient);

    return () => {
      mqttClient.end();
      setClient(null);
      sensorsRef.current.clear();
      lastUpdateRef.current.clear();
    };
  }, [config.broker, config.topics, config.enabled, updateSensor]);

  return { sensors, connected, error, client };
};
