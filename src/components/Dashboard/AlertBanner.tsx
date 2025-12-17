import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, MapPin, Clock } from 'lucide-react';
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
          background: 'linear-gradient(135deg, #1a0a0a 0%, #2d1010 100%)',
          border: '1px solid #7f1d1d',
          borderRadius: '16px',
          marginBottom: '24px',
          overflow: 'hidden',
          boxShadow: '0 4px 24px rgba(239, 68, 68, 0.15)',
        }}
      >
        {/* Top accent bar */}
        <div
          style={{
            height: '3px',
            background: 'linear-gradient(90deg, #ef4444, #dc2626, #ef4444)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 2s infinite linear',
          }}
        />

        <div style={{ padding: '20px 24px' }}>
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  borderRadius: '10px',
                  padding: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <AlertTriangle size={22} color="#ef4444" />
                </motion.div>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      background: '#ef4444',
                      color: '#fff',
                      fontSize: '10px',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: '4px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    Critical
                  </span>
                  <h4
                    style={{
                      color: '#fecaca',
                      fontSize: '15px',
                      fontWeight: 600,
                      margin: 0,
                    }}
                  >
                    ตรวจพบค่าควันเกินระดับอันตราย
                  </h4>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginTop: '4px',
                  }}
                >
                  <Clock size={12} color="#a1a1aa" />
                  <span style={{ color: '#a1a1aa', fontSize: '12px' }}>
                    {currentTime.toLocaleTimeString('th-TH')}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsVisible(false)}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                padding: '8px',
                cursor: 'pointer',
                display: 'flex',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)')
              }
            >
              <X size={16} color="#a1a1aa" />
            </button>
          </div>

          {/* Alert Items */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '12px',
            }}
          >
            {dangerSensors.map((sensor) => (
              <div
                key={sensor.id}
                style={{
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: '12px',
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <MapPin size={16} color="#f87171" />
                  <div>
                    <p
                      style={{
                        color: '#fecaca',
                        fontSize: '14px',
                        fontWeight: 500,
                        margin: 0,
                      }}
                    >
                      {sensor.location || sensor.name}
                    </p>
                    <p style={{ color: '#71717a', fontSize: '11px', margin: '2px 0 0' }}>
                      {sensor.name}
                    </p>
                  </div>
                </div>
                <div
                  style={{
                    background:
                      sensor.value === maxValue
                        ? 'rgba(239, 68, 68, 0.3)'
                        : 'rgba(239, 68, 68, 0.15)',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    border:
                      sensor.value === maxValue
                        ? '1px solid rgba(239, 68, 68, 0.5)'
                        : 'none',
                  }}
                >
                  <span
                    style={{
                      color: '#f87171',
                      fontSize: '18px',
                      fontWeight: 700,
                    }}
                  >
                    {formatNumber(sensor.value)}
                  </span>
                  <span
                    style={{
                      color: '#f87171',
                      fontSize: '11px',
                      marginLeft: '3px',
                      opacity: 0.8,
                    }}
                  >
                    PPM
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div
            style={{
              marginTop: '16px',
              paddingTop: '14px',
              borderTop: '1px solid rgba(255, 255, 255, 0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <p style={{ color: '#71717a', fontSize: '12px', margin: 0 }}>
              ค่าเกินเกณฑ์ {formatNumber(settings.dangerThreshold)} PPM • {dangerSensors.length} จุด
            </p>
            <span
              style={{
                color: '#fca5a5',
                fontSize: '12px',
                fontWeight: 500,
              }}
            >
              กรุณาตรวจสอบทันที
            </span>
          </div>
        </div>
      </motion.div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </AnimatePresence>
  );
};
