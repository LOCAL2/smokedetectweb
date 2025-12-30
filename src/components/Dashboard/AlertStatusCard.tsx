import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ChevronDown, MapPin } from 'lucide-react';
import type { SensorData } from '../../types/sensor';
import type { SettingsConfig } from '../../hooks/useSettings';
import { getSensorStatusWithSettings } from '../../hooks/useSettings';
import { STATUS_COLORS } from '../../config/thresholds';
import { formatNumber } from '../../utils/format';

interface AlertStatusCardProps {
  sensors: SensorData[];
  settings: SettingsConfig;
  delay?: number;
}

export const AlertStatusCard = ({ sensors, settings, delay = 0 }: AlertStatusCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const alertSensors = sensors
    .filter(s => getSensorStatusWithSettings(s.value, settings.warningThreshold, settings.dangerThreshold) !== 'safe')
    .sort((a, b) => b.value - a.value);
  
  const alertCount = alertSensors.length;
  const hasAlerts = alertCount > 0;
  const color = hasAlerts ? '#EF4444' : '#10B981';

  return (
    <div style={{ position: 'relative' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
        style={{
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          padding: '24px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          position: 'relative',
          overflow: 'hidden',
          cursor: hasAlerts ? 'pointer' : 'default',
        }}
        onClick={() => hasAlerts && setIsExpanded(!isExpanded)}
      >
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '100px',
        height: '100px',
        background: `radial-gradient(circle, ${color}20 0%, transparent 70%)`,
        borderRadius: '50%',
        transform: 'translate(30%, -30%)',
      }} />
      
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <p style={{ color: '#94A3B8', fontSize: '14px', marginBottom: '8px', fontWeight: 500 }}>
            แจ้งเตือน
          </p>
          <motion.h3
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: delay + 0.2 }}
            style={{ 
              color: '#F8FAFC', 
              fontSize: '32px', 
              fontWeight: 700, 
              margin: 0,
              letterSpacing: '-0.02em'
            }}
          >
            {alertCount}
          </motion.h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
            <p style={{ color: '#64748B', fontSize: '13px', margin: 0 }}>
              จุดที่ต้องเฝ้าระวัง
            </p>
            {hasAlerts && (
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown size={16} color="#64748B" />
              </motion.div>
            )}
          </div>
        </div>
        <div style={{
          background: `linear-gradient(135deg, ${color}30 0%, ${color}10 100%)`,
          borderRadius: '14px',
          padding: '12px',
          border: `1px solid ${color}40`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <AlertTriangle size={24} color={color} />
        </div>
      </div>

      </motion.div>

      {/* Expanded Alert List - Dropdown Overlay */}
      <AnimatePresence>
        {isExpanded && hasAlerts && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: '8px',
              background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.98) 0%, rgba(15, 23, 42, 0.99) 100%)',
              backdropFilter: 'blur(20px)',
              borderRadius: '16px',
              padding: '16px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.4)',
              zIndex: 100,
              maxHeight: '300px',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {alertSensors.map((sensor, index) => {
                const status = getSensorStatusWithSettings(sensor.value, settings.warningThreshold, settings.dangerThreshold);
                const statusColors = STATUS_COLORS[status];
                
                return (
                  <motion.div
                    key={sensor.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px',
                      background: statusColors.bg,
                      borderRadius: '12px',
                      border: `1px solid ${statusColors.primary}30`,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <MapPin size={16} color={statusColors.primary} />
                      <div>
                        <p style={{ color: '#F8FAFC', fontSize: '14px', fontWeight: 500, margin: 0 }}>
                          {sensor.location || sensor.name}
                        </p>
                        <p style={{ color: '#64748B', fontSize: '12px', margin: '2px 0 0' }}>
                          {sensor.name}
                        </p>
                      </div>
                    </div>
                    <div style={{
                      background: `${statusColors.primary}20`,
                      borderRadius: '8px',
                      padding: '6px 12px',
                    }}>
                      <span style={{ 
                        color: statusColors.primary, 
                        fontSize: '16px', 
                        fontWeight: 700 
                      }}>
                        {formatNumber(sensor.value)}
                      </span>
                      <span style={{ 
                        color: statusColors.primary, 
                        fontSize: '11px', 
                        marginLeft: '2px' 
                      }}>
                        PPM
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
