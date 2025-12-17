import { motion } from 'framer-motion';
import { Trophy, MapPin } from 'lucide-react';
import type { SensorMaxValue } from '../../types/sensor';
import type { SettingsConfig } from '../../hooks/useSettings';
import { getSensorStatusWithSettings } from '../../hooks/useSettings';
import { STATUS_COLORS } from '../../config/thresholds';
import { formatNumber } from '../../utils/format';

interface SensorRankingProps {
  data: SensorMaxValue[];
  settings: SettingsConfig;
}

export const SensorRanking = ({ data, settings }: SensorRankingProps) => {
  const getRankColor = (index: number) => {
    if (index === 0) return '#FFD700'; // Gold
    if (index === 1) return '#C0C0C0'; // Silver
    if (index === 2) return '#CD7F32'; // Bronze
    return '#64748B';
  };

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
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <Trophy size={22} color="#FFD700" />
        <div>
          <h3 style={{ color: '#F8FAFC', fontSize: '18px', fontWeight: 600, margin: 0 }}>
            ค่าสูงสุด 24 ชั่วโมง
          </h3>
          <p style={{ color: '#64748B', fontSize: '12px', margin: '2px 0 0' }}>
            จัดอันดับตามค่าสูงสุดของแต่ละพื้นที่
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {data.length === 0 ? (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            padding: '40px 20px',
            color: '#64748B'
          }}>
            <svg 
              width="80" 
              height="80" 
              viewBox="0 0 80 80" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              style={{ marginBottom: '16px', opacity: 0.6 }}
            >
              {/* Chart base */}
              <rect x="10" y="60" width="60" height="4" rx="2" fill="#334155" />
              <rect x="10" y="20" width="4" height="44" rx="2" fill="#334155" />
              
              {/* Empty bars */}
              <rect x="22" y="45" width="10" height="15" rx="3" fill="#1E293B" stroke="#334155" strokeWidth="1.5" strokeDasharray="3 2" />
              <rect x="36" y="35" width="10" height="25" rx="3" fill="#1E293B" stroke="#334155" strokeWidth="1.5" strokeDasharray="3 2" />
              <rect x="50" y="40" width="10" height="20" rx="3" fill="#1E293B" stroke="#334155" strokeWidth="1.5" strokeDasharray="3 2" />
              
              {/* Question mark */}
              <circle cx="60" cy="20" r="12" fill="#1E293B" stroke="#475569" strokeWidth="2" />
              <text x="60" y="25" textAnchor="middle" fill="#64748B" fontSize="14" fontWeight="bold">?</text>
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
                  background: `linear-gradient(135deg, ${colors.primary}10 0%, transparent 100%)`,
                  borderRadius: '14px',
                  border: `1px solid ${colors.primary}30`,
                }}
              >
                {/* Rank */}
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  background: index < 3 ? `${getRankColor(index)}20` : 'rgba(255,255,255,0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '14px',
                  color: getRankColor(index),
                }}>
                  {index + 1}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ 
                    color: '#F8FAFC', 
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
                    <MapPin size={12} color="#64748B" />
                    <span style={{ 
                      color: '#64748B', 
                      fontSize: '12px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {sensor.location}
                    </span>
                  </div>
                </div>

                {/* Max Value */}
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
