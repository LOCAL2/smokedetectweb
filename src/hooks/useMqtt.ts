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
    
    // Update only if more than 100ms has passed (prevent too frequent updates)
    if (now - lastUpdate < 100) return;
    
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

    // Determine broker URL based on protocol
    const brokerUrl = window.location.protocol === 'https:' 
      ? config.broker.replace('ws://', 'wss://').replace(':8083', ':8884')
      : config.broker;

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
      
      // รอให้ connection stable และเช็คสถานะก่อน subscribe
      setTimeout(() => {
        if (mqttClient.connected) {
          config.topics.forEach(topic => {
            mqttClient.subscribe(topic, { qos: 0 }, (err) => {
              if (err) {
                console.error(`Failed to subscribe to ${topic}:`, err);
              }
            });
          });
        }
      }, 200);
    });

    mqttClient.on('message', (_topic, message) => {
      try {
        const data = JSON.parse(message.toString()) as SensorData;
        
        // Validate required fields
        if (!data.id || data.value === undefined) {
          console.warn('Invalid sensor data received:', data);
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
      } catch (err) {
        console.error('Error parsing MQTT message:', err);
      }
    });

    mqttClient.on('error', (err) => {
      console.error('MQTT Error:', err);
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
