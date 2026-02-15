import { useEffect, useRef } from 'react';
import { X, Activity, TrendingUp, TrendingDown, BarChart3, Clock } from 'lucide-react';
import type { SensorData } from '../../types/sensor';
import type { SettingsConfig } from '../../hooks/useSettings';
import { getSensorStatusWithSettings } from '../../hooks/useSettings';
import { STATUS_COLORS, STATUS_LABELS } from '../../config/thresholds';
import { formatNumber } from '../../utils/format';
import { SensorQRCode } from '../SensorQRCode';
import { useTheme } from '../../context/ThemeContext';

interface SensorStats {
  max24h: number;
  min24h: number;
  avg24h: number;
}

interface SensorDetailPanelProps {
  sensor: SensorData | null;
  stats: SensorStats | null;
  settings: SettingsConfig;
  onClose: () => void;
}


export const SensorDetailPanel = ({ sensor, stats, settings, onClose }: SensorDetailPanelProps) => {
  if (!sensor) return null;

  const status = getSensorStatusWithSettings(sensor.value, settings.warningThreshold, settings.dangerThreshold);
  const colors = STATUS_COLORS[status];
  const { isDark } = useTheme();

  
  const panelBg = isDark
    ? 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)'
    : 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)';

  const headerBg = isDark
    ? 'linear-gradient(180deg, #1E293B 0%, rgba(30, 41, 59, 0.95) 100%)'
    : 'linear-gradient(180deg, #FFFFFF 0%, rgba(248, 250, 252, 0.95) 100%)';

  const textColor = isDark ? '#F8FAFC' : '#0F172A';
  const textSecondary = isDark ? '#94A3B8' : '#64748B';
  const borderColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
  const bgCard = isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)';
  const progressBarBg = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

  const panelRef = useRef<HTMLDivElement>(null);

  
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    const handleWheel = (e: WheelEvent) => {
      const { scrollTop, scrollHeight, clientHeight } = panel;
      const atTop = scrollTop === 0;
      const atBottom = scrollTop + clientHeight >= scrollHeight - 1;

      
      if ((e.deltaY < 0 && atTop) || (e.deltaY > 0 && atBottom)) {
        e.preventDefault();
      }
      
      
      e.stopPropagation();
    };

    panel.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      panel.removeEventListener('wheel', handleWheel);
    };
  }, []);

  return (
    <>
      {}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1100,
          backdropFilter: 'blur(4px)',
        }}
      />

      {}
      <div
        ref={panelRef}
        data-scroll-container="true"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: 'min(400px, 90vw)',
          background: panelBg,
          borderLeft: `1px solid ${borderColor}`,
          zIndex: 1101,
          overflowY: 'auto',
          overflowX: 'hidden',
          animation: 'slideIn 0.3s ease-out',
          WebkitOverflowScrolling: 'touch',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {}
        <div style={{
          padding: '20px',
          borderBottom: `1px solid ${borderColor}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          background: headerBg,
          backdropFilter: 'blur(10px)',
          zIndex: 10,
        }}>
          <div>
            <h2 style={{ color: textColor, fontSize: '18px', fontWeight: 600, margin: 0 }}>
              {sensor.name}
            </h2>
            <p style={{ color: textSecondary, fontSize: '13px', margin: '4px 0 0' }}>
              {sensor.location}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <SensorQRCode sensor={sensor} />
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                borderRadius: '10px',
                padding: '8px',
                cursor: 'pointer',
                display: 'flex',
              }}
            >
              <X size={20} color="#94A3B8" />
            </button>
          </div>
        </div>

        {}
        <div style={{ padding: '24px 20px', textAlign: 'center' }}>
          <p style={{ color: textSecondary, fontSize: '13px', marginBottom: '8px' }}>
            <Clock size={14} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
            ค่าปัจจุบัน
          </p>
          <div
            style={{
              fontSize: '64px',
              fontWeight: 800,
              color: colors.primary,
              textShadow: isDark ? colors.glow : 'none',
              lineHeight: 1,
              filter: !isDark ? 'brightness(0.9) saturate(1.2)' : 'none',
            }}
          >
            {formatNumber(sensor.value)}
          </div>
          <div style={{ color: textSecondary, fontSize: '18px', marginTop: '4px', marginBottom: '16px' }}>
            {sensor.unit}
          </div>

          <div
            style={{
              display: 'inline-block',
              background: colors.bg,
              border: `1px solid ${colors.primary}50`,
              borderRadius: '12px',
              padding: '8px 20px',
            }}
          >
            <span style={{ color: colors.primary, fontWeight: 600, fontSize: '14px' }}>
              {STATUS_LABELS[status]}
            </span>
          </div>
        </div>

        {}
        <div style={{ padding: '0 20px 24px' }}>
          <div style={{
            height: '8px',
            background: progressBarBg,
            borderRadius: '4px',
            overflow: 'hidden',
          }}>
            <div
              style={{
                height: '100%',
                width: `${Math.min((sensor.value / (settings.dangerThreshold * 1.5)) * 100, 100)}%`,
                background: `linear-gradient(90deg, ${colors.primary} 0%, ${colors.primary}80 100%)`,
                borderRadius: '4px',
                transition: 'width 0.3s ease-out',
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
            <span style={{ color: textSecondary, fontSize: '11px' }}>0</span>
            <span style={{ color: '#F59E0B', fontSize: '11px' }}>{settings.warningThreshold}</span>
            <span style={{ color: '#EF4444', fontSize: '11px' }}>{settings.dangerThreshold}</span>
            <span style={{ color: textSecondary, fontSize: '11px' }}>{Math.round(settings.dangerThreshold * 1.5)}</span>
          </div>
        </div>

        {/* Statistics Section */}
        <div style={{ padding: '0 20px 24px' }}>
          <h3 style={{
            color: textColor,
            fontSize: '14px',
            fontWeight: 600,
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <BarChart3 size={16} color="#8B5CF6" />
            สถิติ 24 ชั่วโมง
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {}
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '12px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}>
              <div style={{
                background: 'rgba(239, 68, 68, 0.2)',
                borderRadius: '10px',
                padding: '10px',
              }}>
                <TrendingUp size={20} color="#EF4444" />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ color: textSecondary, fontSize: '12px', margin: 0 }}>ค่าสูงสุด</p>
                <p style={{ color: '#EF4444', fontSize: '24px', fontWeight: 700, margin: '4px 0 0' }}>
                  {stats ? formatNumber(stats.max24h) : '--'} <span style={{ fontSize: '14px', fontWeight: 400 }}>PPM</span>
                </p>
              </div>
            </div>

            {}
            <div style={{
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: '12px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}>
              <div style={{
                background: 'rgba(16, 185, 129, 0.2)',
                borderRadius: '10px',
                padding: '10px',
              }}>
                <TrendingDown size={20} color="#10B981" />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ color: textSecondary, fontSize: '12px', margin: 0 }}>ค่าต่ำสุด</p>
                <p style={{ color: '#10B981', fontSize: '24px', fontWeight: 700, margin: '4px 0 0' }}>
                  {stats ? formatNumber(stats.min24h) : '--'} <span style={{ fontSize: '14px', fontWeight: 400 }}>PPM</span>
                </p>
              </div>
            </div>

            {}
            <div style={{
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              borderRadius: '12px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}>
              <div style={{
                background: 'rgba(59, 130, 246, 0.2)',
                borderRadius: '10px',
                padding: '10px',
              }}>
                <Activity size={20} color="#3B82F6" />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ color: textSecondary, fontSize: '12px', margin: 0 }}>ค่าเฉลี่ย</p>
                <p style={{ color: '#3B82F6', fontSize: '24px', fontWeight: 700, margin: '4px 0 0' }}>
                  {stats ? formatNumber(stats.avg24h) : '--'} <span style={{ fontSize: '14px', fontWeight: 400 }}>PPM</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {}
        <div style={{ padding: '0 20px 24px' }}>
          <h3 style={{
            color: textColor,
            fontSize: '14px',
            fontWeight: 600,
            marginBottom: '16px',
          }}>
            ข้อมูลเซ็นเซอร์
          </h3>
          <div style={{
            background: bgCard,
            borderRadius: '12px',
            padding: '16px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ color: textSecondary, fontSize: '13px' }}>ID</span>
              <span style={{ color: textColor, fontSize: '13px', fontFamily: 'monospace' }}>{sensor.id}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ color: textSecondary, fontSize: '13px' }}>สถานะ</span>
              <span style={{ color: sensor.isOnline ? '#10B981' : '#EF4444', fontSize: '13px' }}>
                {sensor.isOnline ? '● ออนไลน์' : '○ ออฟไลน์'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: textSecondary, fontSize: '13px' }}>อัพเดทล่าสุด</span>
              <span style={{ color: textColor, fontSize: '13px' }}>
                {sensor.timestamp ? new Date(sensor.timestamp).toLocaleTimeString('th-TH') : '--'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
};
