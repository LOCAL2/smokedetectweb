import { motion } from 'framer-motion';
import { Trophy, MapPin } from 'lucide-react';
import type { SensorMaxValue } from '../../types/sensor';
import type { SettingsConfig } from '../../hooks/useSettings';
import { getSensorStatusWithSettings } from '../../hooks/useSettings';
import { STATUS_COLORS } from '../../config/thresholds';
import { formatNumber } from '../../utils/format';
import { useTheme } from '../../context/ThemeContext';

interface SensorRankingProps {
  data: SensorMaxValue[];
  settings: SettingsConfig;
}

export const SensorRanking = ({ data, settings }: SensorRankingProps) => {
  const { isDark } = useTheme();

  const getRankColor = (index: number) => {
    if (index === 0) return '#FFD700'; 
    if (index === 1) return isDark ? '#C0C0C0' : '#94A3B8'; 
    if (index === 2) return '#CD7F32'; 
    return isDark ? '#64748B' : '#94A3B8';
  };

  
  const cardBg = isDark
    ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)'
    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(241, 245, 249, 0.95) 100%)';

  const borderColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
  const textColor = isDark ? '#F8FAFC' : '#0F172A';
  const textSecondary = isDark ? '#64748B' : '#64748B';
  const emptyStateColor = isDark ? '#64748B' : '#94A3B8';
  const emptyBarFill = isDark ? '#334155' : '#E2E8F0';
  const emptyBarStroke = isDark ? '#1E293B' : '#CBD5E1';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      style={{
        background: cardBg,
        backdropFilter: 'blur(20px)',
        borderRadius: '16px',
        overflow: 'hidden',
        border: `1px solid ${borderColor}`,
        boxShadow: isDark ? 'none' : '0 4px 20px rgba(0, 0, 0, 0.05)',
      }}
    >
      {}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '16px',
        borderBottom: `1px solid ${borderColor}`,
        marginBottom: '0px'
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          background: isDark ? 'rgba(255, 215, 0, 0.15)' : 'rgba(255, 215, 0, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Trophy size={16} color="#FFD700" />
        </div>
        <div>
          <h3 style={{ color: textColor, fontSize: '14px', fontWeight: 600, margin: 0 }}>
            ค่าสูงสุด 24 ชั่วโมง
          </h3>
          <p style={{ color: textSecondary, fontSize: '11px', margin: 0 }}>
            จัดอันดับตามค่าสูงสุดของแต่ละพื้นที่
          </p>
        </div>
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px', minHeight: '300px' }}>
        {data.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 20px',
            color: emptyStateColor,
            flex: 1,
          }}>
            <svg
              width="80"
              height="80"
              viewBox="0 0 80 80"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ marginBottom: '16px', opacity: 0.6 }}
            >
              {}
              <rect x="10" y="60" width="60" height="4" rx="2" fill={emptyBarFill} />
              <rect x="10" y="20" width="4" height="44" rx="2" fill={emptyBarFill} />

              {}
              <rect x="22" y="45" width="10" height="15" rx="3" fill={emptyBarStroke} stroke={emptyBarFill} strokeWidth="1.5" strokeDasharray="3 2" />
              <rect x="36" y="35" width="10" height="25" rx="3" fill={emptyBarStroke} stroke={emptyBarFill} strokeWidth="1.5" strokeDasharray="3 2" />
              <rect x="50" y="40" width="10" height="20" rx="3" fill={emptyBarStroke} stroke={emptyBarFill} strokeWidth="1.5" strokeDasharray="3 2" />

              {}
              <circle cx="60" cy="20" r="12" fill={emptyBarStroke} stroke={emptyStateColor} strokeWidth="2" />
              <text x="60" y="25" textAnchor="middle" fill={emptyStateColor} fontSize="14" fontWeight="bold">?</text>
            </svg>
            <p style={{ fontSize: '14px', fontWeight: 500, margin: '0 0 4px' }}>
              ยังไม่มีข้อมูลเซ็นเซอร์
            </p>
            <p style={{ fontSize: '12px', margin: 0, opacity: 0.7 }}>
              กำลังรอข้อมูลจากเซ็นเซอร์...
            </p>
          </div>
        ) : (
          data.slice(0, 5).map((sensor, index) => {
            const status = getSensorStatusWithSettings(sensor.maxValue, settings.warningThreshold, settings.dangerThreshold);
            const colors = STATUS_COLORS[status];

            return (
              <motion.div
                key={sensor.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px',
                  background: isDark
                    ? `linear-gradient(135deg, ${colors.primary}10 0%, transparent 100%)`
                    : `linear-gradient(135deg, ${colors.primary}05 0%, rgba(255,255,255,0.5) 100%)`,
                  borderRadius: '14px',
                  border: isDark
                    ? `1px solid ${colors.primary}30`
                    : `1px solid ${colors.primary}20`,
                }}
              >
                {}
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  background: index < 3 ? `${getRankColor(index)}20` : (isDark ? 'rgba(100, 116, 139, 0.15)' : 'rgba(148, 163, 184, 0.1)'),
                  border: `2px solid ${getRankColor(index)}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '14px',
                  color: getRankColor(index),
                }}>
                  {index + 1}
                </div>

                {}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    color: textColor,
                    fontSize: '14px',
                    fontWeight: 600,
                    margin: 0,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {sensor.name}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                    <MapPin size={12} color={textSecondary} />
                    <span style={{
                      color: textSecondary,
                      fontSize: '12px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {sensor.location}
                    </span>
                  </div>
                </div>

                {}
                <div style={{
                  background: colors.bg,
                  borderRadius: '10px',
                  padding: '6px 12px',
                  border: `1px solid ${colors.primary}40`,
                }}>
                  <span style={{
                    color: colors.primary,
                    fontSize: '16px',
                    fontWeight: 700
                  }}>
                    {formatNumber(sensor.maxValue)}
                  </span>
                  <span style={{
                    color: colors.primary,
                    fontSize: '11px',
                    marginLeft: '2px',
                    opacity: 0.8
                  }}>
                    PPM
                  </span>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </motion.div>
  );
};
