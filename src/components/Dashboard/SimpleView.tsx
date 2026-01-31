import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, Activity } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useSettingsContext } from '../../context/SettingsContext';
import { getSensorStatusWithSettings } from '../../hooks/useSettings';
import type { SensorData } from '../../types/sensor';

interface SimpleViewProps {
  sensors: SensorData[];
}

export const SimpleView = ({ sensors }: SimpleViewProps) => {
  const { isDark } = useTheme();
  const { settings } = useSettingsContext();

  const cardBg = isDark ? 'rgba(30, 41, 59, 0.5)' : 'rgba(255, 255, 255, 0.8)';
  const borderColor = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)';
  const textColor = isDark ? '#F8FAFC' : '#0F172A';
  const textSecondary = isDark ? '#94A3B8' : '#64748B';

  
  const dangerSensors = sensors.filter(s => 
    getSensorStatusWithSettings(s.value, settings.warningThreshold, settings.dangerThreshold) === 'danger'
  );
  const warningSensors = sensors.filter(s => 
    getSensorStatusWithSettings(s.value, settings.warningThreshold, settings.dangerThreshold) === 'warning'
  );
  const safeSensors = sensors.filter(s => 
    getSensorStatusWithSettings(s.value, settings.warningThreshold, settings.dangerThreshold) === 'safe'
  );

  const avgValue = sensors.reduce((sum, s) => sum + s.value, 0) / sensors.length;

  return (
    <div style={{ padding: '16px' }}>
      {}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: dangerSensors.length > 0 
            ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%)'
            : warningSensors.length > 0
              ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%)'
              : 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)',
          borderRadius: '20px',
          padding: '24px',
          marginBottom: '16px',
          border: `2px solid ${
            dangerSensors.length > 0 ? '#EF4444'
            : warningSensors.length > 0 ? '#F59E0B'
            : '#10B981'
          }40`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '16px',
            background: dangerSensors.length > 0 ? '#EF4444'
              : warningSensors.length > 0 ? '#F59E0B'
              : '#10B981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {dangerSensors.length > 0 ? (
              <AlertTriangle size={32} color="#FFF" />
            ) : warningSensors.length > 0 ? (
              <Activity size={32} color="#FFF" />
            ) : (
              <CheckCircle size={32} color="#FFF" />
            )}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{
              color: textColor,
              fontSize: '24px',
              fontWeight: 700,
              margin: 0,
            }}>
              {dangerSensors.length > 0 ? '🚨 อันตราย!'
                : warningSensors.length > 0 ? '⚠️ เฝ้าระวัง'
                : '✅ ปกติดี'}
            </h2>
            <p style={{
              color: textSecondary,
              fontSize: '14px',
              margin: '4px 0 0',
            }}>
              ค่าเฉลี่ย: {avgValue.toFixed(1)} PPM
            </p>
          </div>
        </div>

        {}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px',
        }}>
          <div style={{
            background: isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)',
            borderRadius: '12px',
            padding: '12px',
            textAlign: 'center',
          }}>
            <div style={{
              color: '#EF4444',
              fontSize: '24px',
              fontWeight: 700,
            }}>
              {dangerSensors.length}
            </div>
            <div style={{
              color: textSecondary,
              fontSize: '11px',
            }}>
              อันตราย
            </div>
          </div>
          <div style={{
            background: isDark ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.05)',
            borderRadius: '12px',
            padding: '12px',
            textAlign: 'center',
          }}>
            <div style={{
              color: '#F59E0B',
              fontSize: '24px',
              fontWeight: 700,
            }}>
              {warningSensors.length}
            </div>
            <div style={{
              color: textSecondary,
              fontSize: '11px',
            }}>
              เฝ้าระวัง
            </div>
          </div>
          <div style={{
            background: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)',
            borderRadius: '12px',
            padding: '12px',
            textAlign: 'center',
          }}>
            <div style={{
              color: '#10B981',
              fontSize: '24px',
              fontWeight: 700,
            }}>
              {safeSensors.length}
            </div>
            <div style={{
              color: textSecondary,
              fontSize: '11px',
            }}>
              ปกติ
            </div>
          </div>
        </div>
      </motion.div>

      {}
      {(dangerSensors.length > 0 || warningSensors.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            background: cardBg,
            borderRadius: '16px',
            padding: '16px',
            border: `1px solid ${borderColor}`,
          }}
        >
          <h3 style={{
            color: textColor,
            fontSize: '16px',
            fontWeight: 600,
            margin: '0 0 12px',
          }}>
            🔍 จุดที่ต้องตรวจสอบ
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[...dangerSensors, ...warningSensors].map((sensor, index) => {
              const status = getSensorStatusWithSettings(
                sensor.value,
                settings.warningThreshold,
                settings.dangerThreshold
              );
              const statusColor = status === 'danger' ? '#EF4444' : '#F59E0B';

              return (
                <motion.div
                  key={sensor.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  style={{
                    background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                    borderRadius: '12px',
                    padding: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    borderLeft: `4px solid ${statusColor}`,
                  }}
                >
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: statusColor,
                    boxShadow: `0 0 8px ${statusColor}`,
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      color: textColor,
                      fontSize: '14px',
                      fontWeight: 600,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {sensor.location || sensor.id}
                    </div>
                  </div>
                  <div style={{
                    color: statusColor,
                    fontSize: '18px',
                    fontWeight: 700,
                  }}>
                    {sensor.value.toFixed(0)}
                  </div>
                  <div style={{
                    color: textSecondary,
                    fontSize: '11px',
                  }}>
                    PPM
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
};
