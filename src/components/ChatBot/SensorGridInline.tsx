import { motion } from 'framer-motion';
import { Activity, AlertTriangle, Shield } from 'lucide-react';
import type { SensorData } from '../../types/sensor';
import type { SettingsConfig } from '../../hooks/useSettings';

interface SensorGridInlineProps {
  sensors: SensorData[];
  filteredSensors: SensorData[];
  settings: SettingsConfig;
  onSelectSensor: (sensor: SensorData) => void;
}

export const SensorGridInline = ({ 
  sensors, 
  filteredSensors, 
  settings, 
  onSelectSensor 
}: SensorGridInlineProps) => {
  const dangerCount = sensors.filter(s => s.value >= settings.dangerThreshold).length;
  const warningCount = sensors.filter(s => s.value >= settings.warningThreshold && s.value < settings.dangerThreshold).length;
  const safeCount = sensors.filter(s => s.value < settings.warningThreshold).length;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      style={{ 
        background: 'rgba(30, 41, 59, 0.6)',
        borderRadius: 16,
        padding: 16,
        border: '1px solid rgba(255,255,255,0.08)'
      }}
    >
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: 14,
        paddingBottom: 12,
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        flexWrap: 'wrap',
        gap: 8
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Activity size={16} color="#3B82F6" />
          <span style={{ color: '#F1F5F9', fontSize: 13, fontWeight: 600 }}>Sensor ทั้งหมด</span>
          <span style={{ 
            background: 'rgba(59, 130, 246, 0.2)', 
            color: '#60A5FA', 
            fontSize: 11, 
            padding: '2px 8px', 
            borderRadius: 10,
            fontWeight: 500
          }}>{filteredSensors.length} ตัว</span>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {dangerCount > 0 && (
            <span style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#F87171', fontSize: 10, padding: '2px 6px', borderRadius: 6, fontWeight: 500 }}>
              อันตราย {dangerCount}
            </span>
          )}
          {warningCount > 0 && (
            <span style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#FBBF24', fontSize: 10, padding: '2px 6px', borderRadius: 6, fontWeight: 500 }}>
              เฝ้าระวัง {warningCount}
            </span>
          )}
          {safeCount > 0 && (
            <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34D399', fontSize: 10, padding: '2px 6px', borderRadius: 6, fontWeight: 500 }}>
              ปลอดภัย {safeCount}
            </span>
          )}
        </div>
      </div>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', 
        gap: 10 
      }}>
        {[...filteredSensors].sort((a, b) => {
          const aVal = sensors.find(s => s.id === a.id)?.value || a.value;
          const bVal = sensors.find(s => s.id === b.id)?.value || b.value;
          return bVal - aVal;
        }).map((filteredSensor, index) => {
          const realTimeSensor = sensors.find(s => s.id === filteredSensor.id) || filteredSensor;
          const status = realTimeSensor.value >= settings.dangerThreshold ? 'danger' : realTimeSensor.value >= settings.warningThreshold ? 'warning' : 'safe';
          const statusColor = status === 'danger' ? '#EF4444' : status === 'warning' ? '#F59E0B' : '#10B981';
          const statusText = status === 'danger' ? 'อันตราย' : status === 'warning' ? 'เฝ้าระวัง' : 'ปลอดภัย';
          const StatusIcon = status === 'danger' ? AlertTriangle : status === 'warning' ? AlertTriangle : Shield;
          return (
            <motion.button 
              key={realTimeSensor.id} 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.03 }}
              whileHover={{ scale: 1.02, y: -2 }} 
              whileTap={{ scale: 0.98 }} 
              onClick={() => onSelectSensor(realTimeSensor)}
              style={{ 
                padding: '12px', 
                background: `linear-gradient(135deg, ${statusColor}10 0%, ${statusColor}05 100%)`, 
                border: `1px solid ${statusColor}30`, 
                borderRadius: 12, 
                cursor: 'pointer', 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {}
              {index < 3 && (
                <div style={{
                  position: 'absolute',
                  top: 6,
                  right: 6,
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  background: index === 0 ? '#EF4444' : index === 1 ? '#F59E0B' : '#3B82F6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 10,
                  fontWeight: 700,
                  color: '#FFF'
                }}>
                  {index + 1}
                </div>
              )}
              {}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <StatusIcon size={16} color={statusColor} />
                <div style={{ 
                  color: '#F1F5F9', 
                  fontSize: 12, 
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '100px'
                }}>
                  {realTimeSensor.location || realTimeSensor.id}
                </div>
              </div>
              {}
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  color: statusColor, 
                  fontSize: 20, 
                  fontWeight: 700,
                  lineHeight: 1
                }}>
                  {realTimeSensor.value.toFixed(1)}
                  <span style={{ fontSize: 11, fontWeight: 500, marginLeft: 2 }}>PPM</span>
                </div>
                <div style={{ 
                  color: statusColor, 
                  fontSize: 10, 
                  fontWeight: 500,
                  marginTop: 4,
                  opacity: 0.8
                }}>
                  {statusText}
                </div>
              </div>
              {}
              <div style={{ 
                width: '100%', 
                height: 3, 
                background: 'rgba(255,255,255,0.1)', 
                borderRadius: 2,
                overflow: 'hidden'
              }}>
                <div style={{ 
                  width: `${Math.min((realTimeSensor.value / settings.dangerThreshold) * 100, 100)}%`, 
                  height: '100%', 
                  background: statusColor,
                  borderRadius: 2,
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
};
