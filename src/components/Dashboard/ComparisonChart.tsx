import { useMemo, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, ArrowRightLeft, ChevronDown, Check } from 'lucide-react';
import type { SensorData } from '../../types/sensor';
import { useSettingsContext } from '../../context/SettingsContext';
import { useTheme } from '../../context/ThemeContext';

interface ComparisonChartProps {
  sensors: SensorData[];
}

// Custom Dropdown Component
const SensorDropdown = ({
  label,
  value,
  sensors,
  onChange,
  excludeId,
  accentColor,
}: {
  label: string;
  value: string;
  sensors: SensorData[];
  onChange: (id: string) => void;
  excludeId?: string;
  accentColor: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { isDark } = useTheme();
  const { settings } = useSettingsContext();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedSensor = sensors.find(s => s.id === value);
  const availableSensors = sensors.filter(s => s.id !== excludeId);

  const getStatusColor = (val: number) => {
    if (val >= settings.dangerThreshold) return '#EF4444';
    if (val >= settings.warningThreshold) return '#F59E0B';
    return '#10B981';
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const bgColor = isDark ? '#1E293B' : '#FFFFFF';
  const borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
  const textColor = isDark ? '#F8FAFC' : '#0F172A';
  const textSecondary = isDark ? '#94A3B8' : '#64748B';
  const hoverBg = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)';
  const inputBg = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)';

  return (
    <div style={{ width: '100%' }}>
      <label style={{ 
        display: 'block', 
        fontSize: '11px', 
        color: accentColor, 
        fontWeight: 600, 
        marginBottom: '6px',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
      }}>
        {label}
      </label>
      <div ref={dropdownRef} style={{ position: 'relative' }}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 12px',
            background: inputBg,
            border: `1px solid ${isOpen ? accentColor : borderColor}`,
            borderRadius: '10px',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {selectedSensor ? (
            <>
              <div style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: getStatusColor(selectedSensor.value),
                boxShadow: `0 0 6px ${getStatusColor(selectedSensor.value)}60`,
              }} />
              <span style={{ 
                flex: 1, 
                textAlign: 'left', 
                fontSize: '13px', 
                fontWeight: 500, 
                color: textColor,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                minWidth: 0,
              }}>
                {selectedSensor.location || selectedSensor.id}
              </span>
              <span style={{
                fontSize: '12px',
                fontWeight: 600,
                color: getStatusColor(selectedSensor.value),
                background: `${getStatusColor(selectedSensor.value)}15`,
                padding: '2px 8px',
                borderRadius: '6px',
                flexShrink: 0,
              }}>
                {selectedSensor.value.toFixed(0)}
              </span>
            </>
          ) : (
            <span style={{ flex: 1, textAlign: 'left', fontSize: '13px', color: textSecondary }}>
              เลือก Sensor...
            </span>
          )}
          <ChevronDown 
            size={16} 
            color={textSecondary}
            style={{ 
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s',
            }} 
          />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                marginTop: '6px',
                background: bgColor,
                border: `1px solid ${borderColor}`,
                borderRadius: '12px',
                boxShadow: isDark 
                  ? '0 20px 50px rgba(0,0,0,0.5)' 
                  : '0 20px 50px rgba(0,0,0,0.15)',
                zIndex: 100,
                overflow: 'hidden',
                maxHeight: '180px',
                overflowY: 'auto',
              }}
            >
              {availableSensors.map((sensor) => {
                const statusColor = getStatusColor(sensor.value);
                const isSelected = sensor.id === value;
                
                return (
                  <div
                    key={sensor.id}
                    onClick={() => { onChange(sensor.id); setIsOpen(false); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 12px',
                      cursor: 'pointer',
                      background: isSelected ? `${accentColor}15` : 'transparent',
                      borderLeft: isSelected ? `3px solid ${accentColor}` : '3px solid transparent',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.background = hoverBg;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = isSelected ? `${accentColor}15` : 'transparent';
                    }}
                  >
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: statusColor,
                    }} />
                    <span style={{ 
                      flex: 1, 
                      fontSize: '13px', 
                      color: textColor,
                      fontWeight: isSelected ? 600 : 400,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      minWidth: 0,
                    }}>
                      {sensor.location || sensor.id}
                    </span>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      color: statusColor,
                      flexShrink: 0,
                    }}>
                      {sensor.value.toFixed(0)} PPM
                    </span>
                    {isSelected && <Check size={14} color={accentColor} strokeWidth={3} />}
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export const ComparisonChart = ({ sensors }: ComparisonChartProps) => {
  const { settings } = useSettingsContext();
  const { isDark } = useTheme();
  const [sensor1Id, setSensor1Id] = useState<string>('');
  const [sensor2Id, setSensor2Id] = useState<string>('');

  // Initialize defaults
  useEffect(() => {
    if (sensors.length >= 2 && !sensor1Id && !sensor2Id) {
      const sorted = [...sensors].sort((a, b) => b.value - a.value);
      setSensor1Id(sorted[0]?.id || '');
      setSensor2Id(sorted[1]?.id || '');
    } else if (sensors.length === 1 && !sensor1Id) {
      setSensor1Id(sensors[0].id);
    }
  }, [sensors, sensor1Id, sensor2Id]);

  const sensor1 = sensors.find(s => s.id === sensor1Id);
  const sensor2 = sensors.find(s => s.id === sensor2Id);
  const displaySensors = [sensor1, sensor2].filter(Boolean) as SensorData[];

  const maxValue = useMemo(() => {
    if (displaySensors.length === 0) return 100;
    return Math.max(...displaySensors.map(s => s.value), settings.dangerThreshold) || 100;
  }, [displaySensors, settings.dangerThreshold]);

  const getBarColor = (value: number) => {
    if (value >= settings.dangerThreshold) return 'linear-gradient(90deg, #EF4444, #F87171)';
    if (value >= settings.warningThreshold) return 'linear-gradient(90deg, #F59E0B, #FBBF24)';
    return 'linear-gradient(90deg, #10B981, #34D399)';
  };

  const getStatusText = (value: number) => {
    if (value >= settings.dangerThreshold) return 'อันตราย';
    if (value >= settings.warningThreshold) return 'เฝ้าระวัง';
    return 'ปกติ';
  };

  const getStatusColor = (value: number) => {
    if (value >= settings.dangerThreshold) return '#EF4444';
    if (value >= settings.warningThreshold) return '#F59E0B';
    return '#10B981';
  };

  const cardBg = isDark ? 'rgba(30, 41, 59, 0.5)' : 'rgba(255, 255, 255, 0.8)';
  const borderColor = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)';
  const textColor = isDark ? '#F8FAFC' : '#0F172A';
  const textSecondary = isDark ? '#94A3B8' : '#64748B';
  const barBg = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';
  const iconBg = isDark ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.1)';


  if (sensors.length === 0) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{
        background: cardBg, borderRadius: '16px', overflow: 'hidden', border: `1px solid ${borderColor}`,
        backdropFilter: 'blur(10px)', boxShadow: isDark ? 'none' : '0 4px 15px rgba(0, 0, 0, 0.05)',
        display: 'flex', flexDirection: 'column', height: '100%', minHeight: '300px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '16px', borderBottom: `1px solid ${borderColor}` }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ArrowRightLeft size={16} color="#8B5CF6" />
          </div>
          <div>
            <h3 style={{ color: textColor, fontSize: '14px', fontWeight: 600, margin: 0 }}>เปรียบเทียบค่า Sensor</h3>
            <p style={{ color: textSecondary, fontSize: '11px', margin: 0 }}>เลือก 2 จุดเพื่อเปรียบเทียบ</p>
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <BarChart3 size={32} color={textSecondary} style={{ marginBottom: '12px', opacity: 0.5 }} />
          <p style={{ color: textSecondary, fontSize: '14px', margin: 0 }}>ยังไม่มีข้อมูล Sensor</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{
      background: cardBg, borderRadius: '16px', overflow: 'visible', border: `1px solid ${borderColor}`,
      backdropFilter: 'blur(10px)', boxShadow: isDark ? 'none' : '0 4px 15px rgba(0, 0, 0, 0.05)',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '16px', borderBottom: `1px solid ${borderColor}` }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ArrowRightLeft size={16} color="#8B5CF6" />
        </div>
        <div>
          <h3 style={{ color: textColor, fontSize: '14px', fontWeight: 600, margin: 0 }}>เปรียบเทียบค่า Sensor</h3>
          <p style={{ color: textSecondary, fontSize: '11px', margin: 0 }}>เลือก 2 จุดเพื่อเปรียบเทียบ</p>
        </div>
      </div>

      <div style={{ padding: '16px' }}>
        {/* Dual Dropdowns - Vertical Layout */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
          <SensorDropdown
            label="Sensor 1"
            value={sensor1Id}
            sensors={sensors}
            onChange={setSensor1Id}
            excludeId={sensor2Id}
            accentColor="#3B82F6"
          />
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            padding: '4px 0',
          }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: isDark ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <ArrowRightLeft size={12} color="#8B5CF6" style={{ transform: 'rotate(90deg)' }} />
            </div>
          </div>
          <SensorDropdown
            label="Sensor 2"
            value={sensor2Id}
            sensors={sensors}
            onChange={setSensor2Id}
            excludeId={sensor1Id}
            accentColor="#8B5CF6"
          />
        </div>

        {/* Comparison Results */}
        <AnimatePresence mode="popLayout">
          {displaySensors.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {displaySensors.map((sensor, index) => {
                const percentage = (sensor.value / maxValue) * 100;
                const statusColor = getStatusColor(sensor.value);
                const accentColor = index === 0 ? '#3B82F6' : '#8B5CF6';
                
                return (
                  <motion.div 
                    key={sensor.id} 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: -10 }} 
                    transition={{ delay: index * 0.1 }}
                    style={{
                      padding: '14px',
                      background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                      borderRadius: '12px',
                      border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '32px', 
                          height: '32px', 
                          borderRadius: '10px', 
                          background: `${accentColor}15`,
                          border: `1px solid ${accentColor}30`,
                          color: accentColor, 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          fontSize: '14px', 
                          fontWeight: 700
                        }}>
                          {index + 1}
                        </div>
                        <div>
                          <span style={{ color: textColor, fontSize: '14px', fontWeight: 600, display: 'block' }}>
                            {sensor.location || sensor.id}
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: statusColor }} />
                            <span style={{ fontSize: '11px', color: statusColor, fontWeight: 500 }}>
                              {getStatusText(sensor.value)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ 
                          color: statusColor, 
                          fontSize: '28px', 
                          fontWeight: 700, 
                          display: 'block', 
                          lineHeight: 1,
                          letterSpacing: '-1px',
                        }}>
                          {sensor.value.toFixed(1)}
                        </span>
                        <span style={{ fontSize: '11px', fontWeight: 500, color: textSecondary }}>PPM</span>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div style={{ 
                      height: '8px', 
                      background: barBg, 
                      borderRadius: '4px', 
                      overflow: 'hidden', 
                      position: 'relative' 
                    }}>
                      <div style={{ 
                        position: 'absolute', 
                        top: 0, 
                        bottom: 0, 
                        left: `${(settings.warningThreshold / maxValue) * 100}%`, 
                        width: '2px', 
                        background: 'rgba(245, 158, 11, 0.3)', 
                        zIndex: 1 
                      }} />
                      <div style={{ 
                        position: 'absolute', 
                        top: 0, 
                        bottom: 0, 
                        left: `${(settings.dangerThreshold / maxValue) * 100}%`, 
                        width: '2px', 
                        background: 'rgba(239, 68, 68, 0.3)', 
                        zIndex: 1 
                      }} />
                      <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: `${percentage}%` }} 
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        style={{ 
                          height: '100%', 
                          background: getBarColor(sensor.value), 
                          borderRadius: '4px', 
                          position: 'relative', 
                          zIndex: 2,
                        }} 
                      />
                    </div>
                  </motion.div>
                );
              })}
              
              {/* Difference indicator */}
              {displaySensors.length === 2 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    padding: '12px',
                    background: isDark ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.05)',
                    borderRadius: '10px',
                    border: `1px solid ${isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.1)'}`,
                  }}
                >
                  <span style={{ fontSize: '12px', color: textSecondary }}>
                    ผลต่าง: {' '}
                    <span style={{ 
                      fontWeight: 700, 
                      color: '#8B5CF6',
                      fontSize: '14px',
                    }}>
                      {Math.abs(displaySensors[0].value - displaySensors[1].value).toFixed(1)} PPM
                    </span>
                  </span>
                </motion.div>
              )}
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ 
              textAlign: 'center', 
              padding: '40px 16px', 
              color: textSecondary,
              background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
              borderRadius: '12px',
            }}>
              <BarChart3 size={32} style={{ marginBottom: '12px', opacity: 0.3 }} />
              <p style={{ fontSize: '13px', margin: 0 }}>เลือก Sensor จาก dropdown ด้านบน</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Legend */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '16px', 
          marginTop: '16px', 
          paddingTop: '16px', 
          borderTop: `1px solid ${borderColor}`,
          flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#10B981' }} />
            <span style={{ color: textSecondary, fontSize: '10px' }}>ปกติ</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#F59E0B' }} />
            <span style={{ color: textSecondary, fontSize: '10px' }}>เฝ้าระวัง ({settings.warningThreshold}+)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#EF4444' }} />
            <span style={{ color: textSecondary, fontSize: '10px' }}>อันตราย ({settings.dangerThreshold}+)</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
