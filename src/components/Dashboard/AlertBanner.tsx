import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, MapPin, Clock, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { SensorData } from '../../types/sensor';
import type { SettingsConfig } from '../../hooks/useSettings';
import { getSensorStatusWithSettings } from '../../hooks/useSettings';
import { formatNumber } from '../../utils/format';

interface AlertBannerProps {
  sensors: SensorData[];
  settings: SettingsConfig;
}

export const AlertBanner = ({ sensors, settings }: AlertBannerProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  const dangerSensors = sensors.filter(
    (s) =>
      getSensorStatusWithSettings(
        s.value,
        settings.warningThreshold,
        settings.dangerThreshold
      ) === 'danger'
  );

  useEffect(() => {
    if (dangerSensors.length > 0) {
      setIsVisible(true);
    }
  }, [dangerSensors.length]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (dangerSensors.length === 0 || !isVisible) return null;

  const maxValue = Math.max(...dangerSensors.map((s) => s.value));

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        style={{
          background: 'linear-gradient(135deg, rgba(127, 29, 29, 0.95) 0%, rgba(153, 27, 27, 0.9) 50%, rgba(127, 29, 29, 0.95) 100%)',
          borderRadius: '20px',
          marginBottom: '24px',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(239, 68, 68, 0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
        }}
      >
        <div style={{ padding: '20px 24px' }}>
          {/* Main Alert Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <motion.div
                animate={{ 
                  scale: [1, 1.15, 1],
                  boxShadow: [
                    '0 0 0 0 rgba(239, 68, 68, 0.4)',
                    '0 0 0 12px rgba(239, 68, 68, 0)',
                    '0 0 0 0 rgba(239, 68, 68, 0)'
                  ]
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  borderRadius: '14px',
                  padding: '14px',
                  display: 'flex',
                }}
              >
                <AlertTriangle size={26} color="#fff" />
              </motion.div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                  <span style={{
                    background: '#fff',
                    color: '#991B1B',
                    fontSize: '11px',
                    fontWeight: 800,
                    padding: '4px 10px',
                    borderRadius: '6px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>
                    อันตราย
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={13} color="rgba(255,255,255,0.7)" />
                    <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>
                      {currentTime.toLocaleTimeString('th-TH')}
                    </span>
                  </div>
                </div>
                <h4 style={{
                  color: '#fff',
                  fontSize: '17px',
                  fontWeight: 600,
                  margin: 0,
                }}>
                  ตรวจพบค่าควันเกินระดับอันตราย {dangerSensors.length} จุด
                </h4>
              </div>
            </div>

            <button
              onClick={() => setIsVisible(false)}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                borderRadius: '10px',
                padding: '10px',
                cursor: 'pointer',
                display: 'flex',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
            >
              <X size={18} color="#fff" />
            </button>
          </div>

          {/* Sensor Cards - Horizontal Scroll */}
          <div style={{
            display: 'flex',
            gap: '12px',
            overflowX: 'auto',
            paddingBottom: '8px',
            marginBottom: '16px',
          }}>
            {dangerSensors.map((sensor) => (
              <motion.div
                key={sensor.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  background: sensor.value === maxValue 
                    ? 'rgba(255, 255, 255, 0.2)' 
                    : 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '14px',
                  padding: '16px 20px',
                  minWidth: '180px',
                  flexShrink: 0,
                  border: sensor.value === maxValue 
                    ? '2px solid rgba(255, 255, 255, 0.4)' 
                    : '1px solid rgba(255, 255, 255, 0.15)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <MapPin size={14} color="rgba(255,255,255,0.8)" />
                  <span style={{ color: '#fff', fontSize: '14px', fontWeight: 600 }}>
                    {sensor.location || sensor.name}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                  <span style={{
                    color: '#fff',
                    fontSize: '32px',
                    fontWeight: 800,
                    lineHeight: 1,
                  }}>
                    {formatNumber(sensor.value)}
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>
                    PPM
                  </span>
                </div>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', margin: '6px 0 0' }}>
                  {sensor.name}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Footer */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '14px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          }}>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', margin: 0 }}>
              ค่าเกินเกณฑ์ {formatNumber(settings.dangerThreshold)} PPM • สูงสุด {formatNumber(maxValue)} PPM
            </p>
            <motion.span
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{
                color: '#fff',
                fontSize: '13px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <AlertCircle size={14} />
              กรุณาตรวจสอบทันที
            </motion.span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
