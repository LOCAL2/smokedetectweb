import { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, ArrowRightLeft } from 'lucide-react';
import type { SensorData } from '../../types/sensor';
import { useSettingsContext } from '../../context/SettingsContext';
import { useTheme } from '../../context/ThemeContext';

interface ComparisonChartProps {
  sensors: SensorData[];
}

export const ComparisonChart = ({ sensors }: ComparisonChartProps) => {
  const { settings } = useSettingsContext();
  const { isDark } = useTheme();

  // State for selected sensors
  const [selectedId1, setSelectedId1] = useState<string>('');
  const [selectedId2, setSelectedId2] = useState<string>('');

  // Initialize defaults when sensors load
  useEffect(() => {
    if (sensors.length >= 2 && !selectedId1 && !selectedId2) {
      // Default to top 2 sensors by value, or just first 2
      const sorted = [...sensors].sort((a, b) => b.value - a.value);
      setSelectedId1(sorted[0]?.id || '');
      setSelectedId2(sorted[1]?.id || '');
    } else if (sensors.length === 1 && !selectedId1) {
      setSelectedId1(sensors[0].id);
    }
  }, [sensors, selectedId1, selectedId2]);

  const selectedSensor1 = sensors.find(s => s.id === selectedId1);
  const selectedSensor2 = sensors.find(s => s.id === selectedId2);

  const displaySensors = useMemo(() => {
    const list = [];
    if (selectedSensor1) list.push(selectedSensor1);
    if (selectedSensor2) list.push(selectedSensor2);
    return list;
  }, [selectedSensor1, selectedSensor2]);

  const maxValue = useMemo(() => {
    if (displaySensors.length === 0) return 100;
    const maxVal = Math.max(...displaySensors.map(s => s.value), settings.dangerThreshold);
    return maxVal > 0 ? maxVal : 100; // Prevent division by zero
  }, [displaySensors, settings.dangerThreshold]);

  const getBarColor = (value: number) => {
    if (value >= settings.dangerThreshold) return 'linear-gradient(135deg, #EF4444, #DC2626)';
    if (value >= settings.warningThreshold) return 'linear-gradient(135deg, #F59E0B, #D97706)';
    return 'linear-gradient(135deg, #10B981, #059669)';
  };

  const getStatusText = (value: number) => {
    if (value >= settings.dangerThreshold) return 'อันตราย';
    if (value >= settings.warningThreshold) return 'เฝ้าระวัง';
    return 'ปกติ';
  };

  // Theme colors
  const cardBg = isDark
    ? 'rgba(30, 41, 59, 0.5)'
    : 'rgba(255, 255, 255, 0.8)';

  const borderColor = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)';
  const textColor = isDark ? '#F8FAFC' : '#0F172A';
  const textSecondary = isDark ? '#94A3B8' : '#64748B';
  const barBg = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
  const iconBg = isDark ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.1)';
  const inputBg = isDark ? 'rgba(15, 23, 42, 0.6)' : '#F1F5F9';
  const inputBorder = isDark ? 'rgba(255, 255, 255, 0.1)' : '#E2E8F0';

  if (sensors.length === 0) {
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
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '16px',
          borderBottom: `1px solid ${borderColor}`,
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: iconBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <ArrowRightLeft size={16} color="#8B5CF6" />
          </div>
          <div>
            <h3 style={{ color: textColor, fontSize: '14px', fontWeight: 600, margin: 0 }}>
              เปรียบเทียบค่า Sensor
            </h3>
            <p style={{ color: textSecondary, fontSize: '11px', margin: 0 }}>
              เลือกจุดตรวจวัดเพื่อเปรียบเทียบ
            </p>
          </div>
        </div>

        {/* Empty State */}
        <div style={{
          padding: '40px 24px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <BarChart3 size={32} color={textSecondary} style={{ marginBottom: '12px', opacity: 0.5 }} />
          <p style={{ color: textSecondary, fontSize: '14px', margin: 0 }}>
            ยังไม่มีข้อมูล Sensor
          </p>
        </div>
      </motion.div>
    );
  }

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
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '16px',
        borderBottom: `1px solid ${borderColor}`,
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          background: iconBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <ArrowRightLeft size={16} color="#8B5CF6" />
        </div>
        <div>
          <h3 style={{ color: textColor, fontSize: '14px', fontWeight: 600, margin: 0 }}>
            เปรียบเทียบค่า Sensor
          </h3>
          <p style={{ color: textSecondary, fontSize: '11px', margin: 0 }}>
            เลือกจุดตรวจวัดเพื่อเปรียบเทียบ
          </p>
        </div>
      </div>

      <div style={{ padding: '16px' }}>
        {/* Selectors */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', color: textSecondary, fontSize: '11px', marginBottom: '4px' }}>Sensor 1</label>
            <select
              value={selectedId1}
              onChange={(e) => setSelectedId1(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '8px',
                background: inputBg,
                border: `1px solid ${inputBorder}`,
                color: textColor,
                fontSize: '13px',
                outline: 'none',
              }}
            >
              <option value="" disabled>เลือก Sensor</option>
              {sensors.map(s => (
                <option key={`s1-${s.id}`} value={s.id}>
                  {s.location || s.id}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', color: textSecondary, fontSize: '11px', marginBottom: '4px' }}>Sensor 2</label>
            <select
              value={selectedId2}
              onChange={(e) => setSelectedId2(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '8px',
                background: inputBg,
                border: `1px solid ${inputBorder}`,
                color: textColor,
                fontSize: '13px',
                outline: 'none',
              }}
            >
              <option value="" disabled>เลือก Sensor</option>
              {sensors.map(s => (
                <option key={`s2-${s.id}`} value={s.id}>
                  {s.location || s.id}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Chart */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {displaySensors.map((sensor, index) => {
            const percentage = (sensor.value / maxValue) * 100;
            return (
              <motion.div
                transition={{ delay: index * 0.1 }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '8px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '6px',
                      background: index === 0 ? 'rgba(59, 130, 246, 0.1)' : 'rgba(139, 92, 246, 0.1)',
                      color: index === 0 ? '#3B82F6' : '#8B5CF6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 700
                    }}>
                      {index + 1}
                    </div>
                    <span style={{ color: textColor, fontSize: '14px', fontWeight: 500 }}>
                      {sensor.location || sensor.id}
                    </span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{
                      color: sensor.value >= settings.dangerThreshold ? '#EF4444' :
                        sensor.value >= settings.warningThreshold ? '#F59E0B' : '#10B981',
                      fontSize: '16px',
                      fontWeight: 700,
                      display: 'block',
                      lineHeight: 1
                    }}>
                      {sensor.value.toFixed(1)} <span style={{ fontSize: '11px', fontWeight: 400, color: textSecondary }}>PPM</span>
                    </span>
                    <span style={{ fontSize: '11px', color: textSecondary }}>
                      {getStatusText(sensor.value)}
                    </span>
                  </div>
                </div>

                <div style={{
                  height: '12px',
                  background: barBg,
                  borderRadius: '6px',
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                  {/* Threshold Markers inside bar track */}
                  <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${(settings.warningThreshold / maxValue) * 100}%`, width: '2px', background: 'rgba(245, 158, 11, 0.3)', zIndex: 1 }} />
                  <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${(settings.dangerThreshold / maxValue) * 100}%`, width: '2px', background: 'rgba(239, 68, 68, 0.3)', zIndex: 1 }} />

                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, type: "spring" }}
                    style={{
                      height: '100%',
                      background: getBarColor(sensor.value),
                      borderRadius: '6px',
                      position: 'relative',
                      zIndex: 2
                    }}
                  />
                </div>
              </motion.div>
            );
          })}

          {displaySensors.length === 0 && (
            <div style={{ textAlign: 'center', padding: '20px 0', color: textSecondary, fontSize: '13px' }}>
              กรุณาเลือก Sensor เพื่อเริ่มต้นเปรียบเทียบ
            </div>
          )}
        </div>

        {/* Legend */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '16px',
          marginTop: '20px',
          paddingTop: '16px',
          borderTop: `1px solid ${borderColor}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444' }} />
            <span style={{ color: textSecondary, fontSize: '11px' }}>อันตราย ({settings.dangerThreshold}+)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B' }} />
            <span style={{ color: textSecondary, fontSize: '11px' }}>เฝ้าระวัง ({settings.warningThreshold}+)</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
