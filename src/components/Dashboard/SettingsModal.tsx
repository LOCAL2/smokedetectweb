import { motion, AnimatePresence } from 'framer-motion';
import { X, RotateCcw, Save, AlertTriangle, Shield, Skull, Clock, Bell, Volume2 } from 'lucide-react';
import { useState } from 'react';
import type { SettingsConfig } from '../../hooks/useSettings';
import { useTheme } from '../../context/ThemeContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SettingsConfig;
  onSave: (settings: Partial<SettingsConfig>) => void;
  onReset: () => void;
}

export const SettingsModal = ({ isOpen, onClose, settings, onSave, onReset }: SettingsModalProps) => {
  const [localSettings, setLocalSettings] = useState<SettingsConfig>(settings);
  const { isDark } = useTheme();

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  const handleReset = () => {
    onReset();
  };

  // Sync localSettings when settings change (e.g., after reset)
  if (JSON.stringify(localSettings) !== JSON.stringify(settings)) {
    setLocalSettings(settings);
  }

  // Theme colors
  const modalBg = isDark
    ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.98) 0%, rgba(15, 23, 42, 0.99) 100%)'
    : 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)';

  const textColor = isDark ? '#F8FAFC' : '#0F172A';
  const textSecondary = isDark ? '#94A3B8' : '#64748B';
  const borderColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
  const inputBg = isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.05)';
  const itemBg = isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)';
  const previewBg = isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.03)';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.7)',
              backdropFilter: 'blur(4px)',
              zIndex: 1000,
            }}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: modalBg,
              borderRadius: '24px',
              padding: '32px',
              width: '90%',
              maxWidth: '500px',
              maxHeight: '90vh',
              overflowY: 'auto',
              border: `1px solid ${borderColor}`,
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              zIndex: 1001,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
              <h2 style={{ color: textColor, fontSize: '22px', fontWeight: 700, margin: 0 }}>
                ⚙️ ตั้งค่าระบบ
              </h2>
              <button
                onClick={onClose}
                style={{
                  background: itemBg,
                  border: 'none',
                  borderRadius: '10px',
                  padding: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                }}
              >
                <X size={20} color={textSecondary} />
              </button>
            </div>

            <div style={{ marginBottom: '28px' }}>
              <h3 style={{ color: textSecondary, fontSize: '13px', fontWeight: 600, marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                ระดับค่าควัน (PPM)
              </h3>

              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <div style={{ background: 'rgba(245, 158, 11, 0.2)', borderRadius: '8px', padding: '6px' }}>
                    <AlertTriangle size={16} color="#F59E0B" />
                  </div>
                  <label style={{ color: textColor, fontSize: '15px', fontWeight: 500 }}>
                    ระดับเฝ้าระวัง
                  </label>
                  <span style={{
                    marginLeft: 'auto',
                    color: '#F59E0B',
                    fontSize: '18px',
                    fontWeight: 700,
                    minWidth: '60px',
                    textAlign: 'right'
                  }}>
                    {localSettings.warningThreshold}
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="150"
                  value={localSettings.warningThreshold}
                  onChange={(e) => setLocalSettings(prev => ({
                    ...prev,
                    warningThreshold: Math.min(Number(e.target.value), prev.dangerThreshold - 10)
                  }))}
                  style={{
                    width: '100%',
                    height: '8px',
                    borderRadius: '4px',
                    background: `linear-gradient(to right, #F59E0B ${(localSettings.warningThreshold / 150) * 100}%, ${inputBg} 0%)`,
                    appearance: 'none',
                    cursor: 'pointer',
                  }}
                />
                <p style={{ color: textSecondary, fontSize: '12px', marginTop: '6px' }}>
                  ค่าตั้งแต่ {localSettings.warningThreshold} PPM จะแสดงสถานะเฝ้าระวัง
                </p>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <div style={{ background: 'rgba(239, 68, 68, 0.2)', borderRadius: '8px', padding: '6px' }}>
                    <Skull size={16} color="#EF4444" />
                  </div>
                  <label style={{ color: textColor, fontSize: '15px', fontWeight: 500 }}>
                    ระดับอันตราย
                  </label>
                  <span style={{
                    marginLeft: 'auto',
                    color: '#EF4444',
                    fontSize: '18px',
                    fontWeight: 700,
                    minWidth: '60px',
                    textAlign: 'right'
                  }}>
                    {localSettings.dangerThreshold}
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="500"
                  value={localSettings.dangerThreshold}
                  onChange={(e) => setLocalSettings(prev => ({
                    ...prev,
                    dangerThreshold: Math.max(Number(e.target.value), prev.warningThreshold + 10)
                  }))}
                  style={{
                    width: '100%',
                    height: '8px',
                    borderRadius: '4px',
                    background: `linear-gradient(to right, #EF4444 ${(localSettings.dangerThreshold / 500) * 100}%, ${inputBg} 0%)`,
                    appearance: 'none',
                    cursor: 'pointer',
                  }}
                />
                <p style={{ color: textSecondary, fontSize: '12px', marginTop: '6px' }}>
                  ค่าตั้งแต่ {localSettings.dangerThreshold} PPM จะแสดงสถานะอันตราย
                </p>
              </div>
            </div>

            {/* Preview */}
            <div style={{
              background: previewBg,
              borderRadius: '14px',
              padding: '16px',
              marginBottom: '28px',
            }}>
              <p style={{ color: textSecondary, fontSize: '12px', marginBottom: '12px', fontWeight: 500 }}>
                ตัวอย่างระดับ:
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ flex: 1, textAlign: 'center', padding: '10px', background: 'rgba(16, 185, 129, 0.15)', borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                  <Shield size={18} color="#10B981" style={{ marginBottom: '4px' }} />
                  <p style={{ color: '#10B981', fontSize: '11px', fontWeight: 600 }}>ปลอดภัย</p>
                  <p style={{ color: textSecondary, fontSize: '10px' }}>0-{localSettings.warningThreshold - 1}</p>
                </div>
                <div style={{ flex: 1, textAlign: 'center', padding: '10px', background: 'rgba(245, 158, 11, 0.15)', borderRadius: '10px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                  <AlertTriangle size={18} color="#F59E0B" style={{ marginBottom: '4px' }} />
                  <p style={{ color: '#F59E0B', fontSize: '11px', fontWeight: 600 }}>เฝ้าระวัง</p>
                  <p style={{ color: textSecondary, fontSize: '10px' }}>{localSettings.warningThreshold}-{localSettings.dangerThreshold - 1}</p>
                </div>
                <div style={{ flex: 1, textAlign: 'center', padding: '10px', background: 'rgba(239, 68, 68, 0.15)', borderRadius: '10px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                  <Skull size={18} color="#EF4444" style={{ marginBottom: '4px' }} />
                  <p style={{ color: '#EF4444', fontSize: '11px', fontWeight: 600 }}>อันตราย</p>
                  <p style={{ color: textSecondary, fontSize: '10px' }}>{localSettings.dangerThreshold}+</p>
                </div>
              </div>
            </div>

            {/* Polling Interval */}
            <div style={{ marginBottom: '28px' }}>
              <h3 style={{ color: textSecondary, fontSize: '13px', fontWeight: 600, marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                การอัพเดทข้อมูล
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <div style={{ background: 'rgba(59, 130, 246, 0.2)', borderRadius: '8px', padding: '6px' }}>
                  <Clock size={16} color="#3B82F6" />
                </div>
                <label style={{ color: textColor, fontSize: '15px', fontWeight: 500 }}>
                  ดึงข้อมูลใหม่ทุกๆ
                </label>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {[
                  { value: 5000, label: '5 วินาที' },
                  { value: 10000, label: '10 วินาที' },
                  { value: 15000, label: '15 วินาที' },
                  { value: 30000, label: '30 วินาที' },
                  { value: 60000, label: '1 นาที' },
                  { value: 300000, label: '5 นาที' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setLocalSettings(prev => ({ ...prev, pollingInterval: option.value }))}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: localSettings.pollingInterval === option.value
                        ? '2px solid #3B82F6'
                        : `1px solid ${borderColor}`,
                      background: localSettings.pollingInterval === option.value
                        ? 'rgba(59, 130, 246, 0.2)'
                        : itemBg,
                      color: localSettings.pollingInterval === option.value ? '#3B82F6' : textSecondary,
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <p style={{ color: textSecondary, fontSize: '12px', marginTop: '10px' }}>
                ยิ่งถี่ยิ่งตอบสนองเร็ว แต่ใช้ทรัพยากรมากขึ้น
              </p>
            </div>

            {/* Alert Settings */}
            <div style={{ marginBottom: '28px' }}>
              <h3 style={{ color: textSecondary, fontSize: '13px', fontWeight: 600, marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                การแจ้งเตือน
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px',
                  background: itemBg,
                  borderRadius: '12px',
                  cursor: 'pointer',
                }}>
                  <Volume2 size={20} color={localSettings.enableSoundAlert ? '#10B981' : textSecondary} />
                  <span style={{ color: textColor, fontSize: '14px', flex: 1 }}>เสียงแจ้งเตือน</span>
                  <div
                    onClick={() => setLocalSettings(prev => ({ ...prev, enableSoundAlert: !prev.enableSoundAlert }))}
                    style={{
                      width: '48px',
                      height: '26px',
                      borderRadius: '13px',
                      background: localSettings.enableSoundAlert ? '#10B981' : 'rgba(148, 163, 184, 0.2)',
                      position: 'relative',
                      transition: 'background 0.2s',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '11px',
                      background: '#FFF',
                      position: 'absolute',
                      top: '2px',
                      left: localSettings.enableSoundAlert ? '24px' : '2px',
                      transition: 'left 0.2s',
                    }} />
                  </div>
                </label>

                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px',
                  background: itemBg,
                  borderRadius: '12px',
                  cursor: 'pointer',
                }}>
                  <Bell size={20} color={localSettings.enableNotification ? '#10B981' : textSecondary} />
                  <span style={{ color: textColor, fontSize: '14px', flex: 1 }}>การแจ้งเตือนเบราว์เซอร์</span>
                  <div
                    onClick={() => setLocalSettings(prev => ({ ...prev, enableNotification: !prev.enableNotification }))}
                    style={{
                      width: '48px',
                      height: '26px',
                      borderRadius: '13px',
                      background: localSettings.enableNotification ? '#10B981' : 'rgba(148, 163, 184, 0.2)',
                      position: 'relative',
                      transition: 'background 0.2s',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '11px',
                      background: '#FFF',
                      position: 'absolute',
                      top: '2px',
                      left: localSettings.enableNotification ? '24px' : '2px',
                      transition: 'left 0.2s',
                    }} />
                  </div>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleReset}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '14px',
                  background: itemBg,
                  border: `1px solid ${borderColor}`,
                  borderRadius: '12px',
                  color: textSecondary,
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <RotateCcw size={18} />
                รีเซ็ต
              </button>
              <button
                onClick={handleSave}
                style={{
                  flex: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '14px',
                  background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#FFF',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)',
                }}
              >
                <Save size={18} />
                บันทึกการตั้งค่า
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
