import { MapPin, Wifi, WifiOff, Pin } from 'lucide-react';
import type { SensorData } from '../../types/sensor';
import type { SettingsConfig } from '../../hooks/useSettings';
import { getSensorStatusWithSettings } from '../../hooks/useSettings';
import { STATUS_COLORS, STATUS_LABELS } from '../../config/thresholds';
import { formatNumber } from '../../utils/format';

interface SensorCardProps {
  sensor: SensorData;
  settings: SettingsConfig;
  isPinned?: boolean;
  onTogglePin?: (sensorId: string) => void;
  onClick?: () => void;
}

export const SensorCard = ({ sensor, settings, isPinned = false, onTogglePin, onClick }: SensorCardProps) => {
  const status = getSensorStatusWithSettings(sensor.value, settings.warningThreshold, settings.dangerThreshold);
  const colors = STATUS_COLORS[status];

  return (
    <div
      onClick={onClick}
      style={{
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        padding: '24px',
        border: `1px solid ${colors.primary}30`,
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.02) translateY(-4px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1) translateY(0)';
      }}
    >
      {status === 'danger' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(circle at center, ${colors.primary}15 0%, transparent 70%)`,
            pointerEvents: 'none',
            animation: 'pulse 1.5s infinite',
          }}
        />
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <h4 style={{ color: '#F8FAFC', fontSize: '18px', fontWeight: 600, margin: 0 }}>
            {sensor.name}
          </h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
            <MapPin size={14} color="#64748B" />
            <span style={{ color: '#64748B', fontSize: '13px' }}>{sensor.location}</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {onTogglePin && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTogglePin(sensor.id);
              }}
              style={{
                background: isPinned ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                border: isPinned ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                padding: '6px',
                cursor: 'pointer',
                display: 'flex',
                transition: 'all 0.2s',
              }}
              title={isPinned ? 'เลิกปักหมุด' : 'ปักหมุดไว้หน้าหลัก'}
            >
              <Pin size={14} color={isPinned ? '#3B82F6' : '#64748B'} fill={isPinned ? '#3B82F6' : 'none'} />
            </button>
          )}
          {sensor.isOnline ? (
            <Wifi size={16} color="#10B981" />
          ) : (
            <WifiOff size={16} color="#EF4444" />
          )}
        </div>
      </div>

      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <div
          style={{
            fontSize: '56px',
            fontWeight: 800,
            color: colors.primary,
            textShadow: colors.glow,
            letterSpacing: '-0.03em',
            lineHeight: 1,
          }}
        >
          {formatNumber(sensor.value)}
        </div>
        <span style={{ color: '#94A3B8', fontSize: '16px', fontWeight: 500 }}>
          {sensor.unit}
        </span>
      </div>

      <div
        style={{
          background: colors.bg,
          border: `1px solid ${colors.primary}50`,
          borderRadius: '12px',
          padding: '10px 16px',
          textAlign: 'center',
        }}
      >
        <span style={{ color: colors.primary, fontWeight: 600, fontSize: '14px' }}>
          {STATUS_LABELS[status]}
        </span>
      </div>
      <div style={{ marginTop: '16px' }}>
        <div style={{
          height: '6px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '3px',
          overflow: 'hidden',
        }}>
          <div
            style={{
              height: '100%',
              width: `${Math.min((sensor.value / (settings.dangerThreshold * 1.5)) * 100, 100)}%`,
              background: `linear-gradient(90deg, ${colors.primary} 0%, ${colors.primary}80 100%)`,
              borderRadius: '3px',
              transition: 'width 0.3s ease-out',
            }}
          />
        </div>
      </div>
    </div>
  );
};
