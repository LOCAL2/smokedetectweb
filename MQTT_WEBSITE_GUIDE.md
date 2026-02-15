# คู่มือเชื่อมต่อ Website กับ MQTT

สำหรับเพิ่มฟีเจอร์ real-time ใน website ที่มีอยู่แล้ว

## 📦 ติดตั้ง Library

```bash
npm install mqtt
# หรือ
yarn add mqtt
```

## 🔌 เชื่อมต่อ MQTT (React/Next.js)

### วิธีที่ 1: ใช้ใน Component

```typescript
'use client'; // สำหรับ Next.js App Router

import { useEffect, useState } from 'react';
import mqtt from 'mqtt';

interface SensorData {
  id: string;
  name: string;
  location: string;
  value: number;
  unit: string;
  timestamp: string;
  isOnline: boolean;
}

export default function SensorMonitor() {
  const [data, setData] = useState<SensorData | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // เชื่อมต่อ MQTT
    const client = mqtt.connect('wss://broker.hivemq.com:8884/mqtt', {
      clientId: 'web_' + Math.random().toString(16).substr(2, 8),
      clean: true,
      reconnectPeriod: 1000,
    });

    client.on('connect', () => {
      console.log('MQTT Connected');
      setConnected(true);
      client.subscribe('mq2/sensor001/data');
    });

    client.on('message', (topic, message) => {
      const sensorData = JSON.parse(message.toString());
      setData(sensorData);
    });

    client.on('error', (error) => {
      console.error('MQTT Error:', error);
      setConnected(false);
    });

    return () => {
      client.end();
    };
  }, []);

  return (
    <div>
      <h2>Sensor Status: {connected ? '🟢 Connected' : '🔴 Disconnected'}</h2>
      {data && (
        <div>
          <p>Value: {data.value} {data.unit}</p>
          <p>Time: {data.timestamp}</p>
        </div>
      )}
    </div>
  );
}
```

### วิธีที่ 2: สร้าง Custom Hook (แนะนำ)

**hooks/useMqttSensor.ts**
```typescript
import { useEffect, useState } from 'react';
import mqtt, { MqttClient } from 'mqtt';

interface SensorData {
  id: string;
  name: string;
  location: string;
  value: number;
  unit: string;
  timestamp: string;
  isOnline: boolean;
}

export function useMqttSensor(topic: string) {
  const [data, setData] = useState<SensorData | null>(null);
  const [connected, setConnected] = useState(false);
  const [client, setClient] = useState<MqttClient | null>(null);

  useEffect(() => {
    const mqttClient = mqtt.connect('wss://broker.hivemq.com:8884/mqtt', {
      clientId: 'web_' + Math.random().toString(16).substr(2, 8),
      clean: true,
      reconnectPeriod: 1000,
    });

    mqttClient.on('connect', () => {
      setConnected(true);
      mqttClient.subscribe(topic);
    });

    mqttClient.on('message', (receivedTopic, message) => {
      if (receivedTopic === topic) {
        try {
          const parsed = JSON.parse(message.toString());
          setData(parsed);
        } catch (error) {
          console.error('Parse error:', error);
        }
      }
    });

    mqttClient.on('error', () => setConnected(false));
    mqttClient.on('offline', () => setConnected(false));

    setClient(mqttClient);

    return () => {
      mqttClient.end();
    };
  }, [topic]);

  return { data, connected, client };
}
```

**ใช้งาน:**
```typescript
export default function Dashboard() {
  const { data, connected } = useMqttSensor('mq2/sensor001/data');

  return (
    <div>
      <p>Status: {connected ? 'Online' : 'Offline'}</p>
      <p>Value: {data?.value}</p>
    </div>
  );
}
```

## 🎯 สำหรับ Vanilla JavaScript

```html
<!DOCTYPE html>
<html>
<head>
  <title>MQ-2 Monitor</title>
  <script src="https://unpkg.com/mqtt/dist/mqtt.min.js"></script>
</head>
<body>
  <h1>Sensor Value: <span id="value">--</span></h1>
  <p>Status: <span id="status">Connecting...</span></p>

  <script>
    const client = mqtt.connect('wss://broker.hivemq.com:8884/mqtt');

    client.on('connect', () => {
      document.getElementById('status').textContent = 'Connected';
      client.subscribe('mq2/sensor001/data');
    });

    client.on('message', (topic, message) => {
      const data = JSON.parse(message.toString());
      document.getElementById('value').textContent = data.value;
    });

    client.on('error', () => {
      document.getElementById('status').textContent = 'Disconnected';
    });
  </script>
</body>
</html>
```

## 🔐 Environment Variables (แนะนำ)

สร้างไฟล์ `.env.local`:

```env
NEXT_PUBLIC_MQTT_BROKER=wss://broker.hivemq.com:8884/mqtt
NEXT_PUBLIC_MQTT_TOPIC=mq2/sensor001/data
```

ใช้ใน code:
```typescript
const broker = process.env.NEXT_PUBLIC_MQTT_BROKER;
const topic = process.env.NEXT_PUBLIC_MQTT_TOPIC;
```

## 📊 ตัวอย่าง UI Component

```typescript
export default function SensorCard() {
  const { data, connected } = useMqttSensor('mq2/sensor001/data');

  const getStatusColor = (value: number) => {
    if (value < 50) return 'green';
    if (value <= 250) return 'yellow';
    return 'red';
  };

  return (
    <div className="sensor-card">
      <div className="status">
        <span className={connected ? 'online' : 'offline'}>
          {connected ? '● Online' : '○ Offline'}
        </span>
      </div>
      
      {data && (
        <>
          <div className="value" style={{ color: getStatusColor(data.value) }}>
            {data.value}
            <span className="unit">{data.unit}</span>
          </div>
          
          <div className="info">
            <p>{data.name}</p>
            <p>{data.location}</p>
            <p className="timestamp">{data.timestamp}</p>
          </div>
        </>
      )}
    </div>
  );
}
```

## 🚀 Deploy บน Vercel

1. Push code ไปยัง GitHub
2. เชื่อมต่อ Vercel กับ repository
3. ตั้งค่า Environment Variables (ถ้ามี)
4. Deploy

**ไม่ต้องตั้งค่าอะไรเพิ่มเติม** - MQTT over WebSocket ทำงานได้ทันทีบน Vercel

## 🔧 Troubleshooting

### WebSocket Connection Failed

ตรวจสอบว่าใช้ `wss://` (secure) สำหรับ production:
```typescript
const broker = window.location.protocol === 'https:' 
  ? 'wss://broker.hivemq.com:8884/mqtt'
  : 'ws://broker.hivemq.com:8083/mqtt';
```

### ข้อมูลไม่อัปเดต

1. เปิด Browser DevTools → Console
2. ดู MQTT connection logs
3. ตรวจสอบว่า topic ตรงกับ ESP32

### Memory Leak

ใช้ cleanup function ใน useEffect:
```typescript
useEffect(() => {
  const client = mqtt.connect(/* ... */);
  
  return () => {
    client.end(); // สำคัญ!
  };
}, []);
```

## 📱 Mobile Responsive

MQTT ทำงานได้ดีบน mobile browser โดยไม่ต้องแก้ไขอะไร

## ⚡ Performance Tips

1. ใช้ `reconnectPeriod: 1000` เพื่อ auto-reconnect
2. ตั้ง `clean: true` เพื่อไม่เก็บ session
3. Unsubscribe เมื่อ component unmount
4. ใช้ `useMemo` สำหรับ computed values

```typescript
const status = useMemo(() => {
  if (!data) return 'No data';
  if (data.value < 50) return 'Normal';
  if (data.value <= 250) return 'Warning';
  return 'Danger';
}, [data]);
```
