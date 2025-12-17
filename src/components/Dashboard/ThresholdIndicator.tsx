import { motion } from 'framer-motion';
import { Shield, AlertTriangle, Skull } from 'lucide-react';
import { STATUS_COLORS } from '../../config/thresholds';
import type { SettingsConfig } from '../../hooks/useSettings';

interface ThresholdIndicatorProps {
  settings: SettingsConfig;
}

export const ThresholdIndicator = ({ settings }: ThresholdIndicatorProps) => {
  const levels = [
    {
      icon: Shield,
      label: 'ปลอดภัย',
      range: `0 - ${settings.warningThreshold - 1} PPM`,
      color: STATUS_COLORS.safe.primary,
      description: 'ไม่พบกลุ่มควันในพื้นที่',
    },
    {
      icon: AlertTriangle,
      label: 'เฝ้าระวัง',
      range: `${settings.warningThreshold} - ${settings.dangerThreshold - 1} PPM`,
      color: STATUS_COLORS.warning.primary,
      description: 'ควรตรวจสอบ',
    },
    {
      icon: Skull,
      label: 'อันตราย',
      range: `${settings.dangerThreshold}+ PPM`,
      color: STATUS_COLORS.danger.primary,
      description: 'ควรเข้าไปตรวจสอบทันที',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      style={{
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        padding: '24px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <h3 style={{ color: '#F8FAFC', fontSize: '18px', fontWeight: 600, margin: '0 0 20px' }}>
        ระดับความเข้มข้นควัน
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {levels.map((level, index) => (
          <motion.div
            key={level.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '16px',
              background: `linear-gradient(135deg, ${level.color}10 0%, transparent 100%)`,
              borderRadius: '14px',
              border: `1px solid ${level.color}20`,
            }}
          >
            <div style={{
              background: `${level.color}20`,
              borderRadius: '10px',
              padding: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <level.icon size={20} color={level.color} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: level.color, fontWeight: 600, fontSize: '15px' }}>
                  {level.label}
                </span>
                <span style={{ color: '#94A3B8', fontSize: '13px', fontWeight: 500 }}>
                  {level.range}
                </span>
              </div>
              <p style={{ color: '#64748B', fontSize: '12px', margin: '4px 0 0' }}>
                {level.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
