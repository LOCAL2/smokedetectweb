import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Activity, Wifi, WifiOff, Clock } from 'lucide-react';
import type { SensorData } from '../../types/sensor';
import { useTheme } from '../../context/ThemeContext';

interface StatusEvent {
  sensorId: string;
  sensorName: string;
  status: 'online' | 'offline';
  timestamp: number;
}

interface SensorStatusHistoryProps {
  sensors: SensorData[];
}

export const SensorStatusHistory = ({ sensors }: SensorStatusHistoryProps) => {
  const [history, setHistory] = useState<StatusEvent[]>(() => {
    const saved = localStorage.getItem('sensor-status-history');
    return saved ? JSON.parse(saved) : [];
  });
  const prevStatusRef = useRef<Map<string, boolean>>(new Map());
  const isFirstRender = useRef(true);
  const { isDark } = useTheme();

  useEffect(() => {
    
    if (isFirstRender.current) {
      
      sensors.forEach(sensor => {
        prevStatusRef.current.set(sensor.id, sensor.isOnline ?? true);
      });
      isFirstRender.current = false;
      return;
    }

    const now = Date.now();
    const newEvents: StatusEvent[] = [];

    
    sensors.forEach(sensor => {
      const currentOnline = sensor.isOnline ?? true;
      const prevOnline = prevStatusRef.current.get(sensor.id);

      
      if (prevOnline !== undefined && prevOnline !== currentOnline) {
        newEvents.push({
          sensorId: sensor.id,
          sensorName: sensor.location || sensor.id,
          status: currentOnline ? 'online' : 'offline',
          timestamp: now,
        });
      }

      
      prevStatusRef.current.set(sensor.id, currentOnline);
    });

    if (newEvents.length > 0) {
      const updated = [...newEvents, ...history].slice(0, 50);
      setHistory(updated);
      localStorage.setItem('sensor-status-history', JSON.stringify(updated));
    }
  }, [sensors]);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - timestamp;

    if (diff < 60000) return 'เมื่อสักครู่';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} นาทีที่แล้ว`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} ชั่วโมงที่แล้ว`;
    return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('sensor-status-history');
  };

  
  const cardBg = isDark
    ? 'rgba(30, 41, 59, 0.5)'
    : 'rgba(255, 255, 255, 0.8)';

  const borderColor = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)';
  const textColor = isDark ? '#F8FAFC' : '#0F172A';
  const textSecondary = isDark ? '#94A3B8' : '#64748B';
  const itemBg = isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)';
  const iconBg = isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: cardBg,
        borderRadius: '16px',
        overflow: 'hidden',
        border: `1px solid ${borderColor}`,
        backdropFilter: 'blur(10px)',
        boxShadow: isDark ? 'none' : '0 4px 15px rgba(0, 0, 0, 0.05)',
      }}
    >
      {}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px',
        borderBottom: `1px solid ${borderColor}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: iconBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Activity size={16} color="#10B981" />
          </div>
          <div>
            <h3 style={{ color: textColor, fontSize: '14px', fontWeight: 600, margin: 0 }}>
              ประวัติสถานะ Sensor
            </h3>
            <p style={{ color: textSecondary, fontSize: '11px', margin: 0 }}>
              Online / Offline
            </p>
          </div>
        </div>
        {history.length > 0 && (
          <button
            onClick={clearHistory}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#F87171',
              fontSize: '11px',
              cursor: 'pointer',
            }}
          >
            ล้างประวัติ
          </button>
        )}
      </div>

      {}
      <div style={{ padding: '12px', minHeight: '200px', maxHeight: '250px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {history.length === 0 ? (
          <div style={{ 
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '180px',
          }}>
            <Clock size={40} color={textSecondary} style={{ marginBottom: '16px', opacity: 0.4 }} />
            <p style={{ color: textSecondary, fontSize: '13px', margin: 0 }}>
              ยังไม่มีประวัติการเปลี่ยนสถานะ
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {history.slice(0, 10).map((event, index) => (
              <motion.div
                key={`${event.sensorId}-${event.timestamp}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  background: itemBg,
                }}
              >
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  background: event.status === 'online'
                    ? 'rgba(16, 185, 129, 0.15)'
                    : 'rgba(239, 68, 68, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {event.status === 'online' ? (
                    <Wifi size={14} color="#10B981" />
                  ) : (
                    <WifiOff size={14} color="#EF4444" />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ color: textColor, fontSize: '13px', margin: 0, fontWeight: 500 }}>
                    {event.sensorName}
                  </p>
                  <p style={{
                    color: event.status === 'online' ? '#10B981' : '#EF4444',
                    fontSize: '11px',
                    margin: 0
                  }}>
                    {event.status === 'online' ? 'เชื่อมต่อแล้ว' : 'ขาดการเชื่อมต่อ'}
                  </p>
                </div>
                <span style={{ color: textSecondary, fontSize: '11px' }}>
                  {formatTime(event.timestamp)}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};
