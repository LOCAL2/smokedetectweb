import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Activity, Wifi, AlertTriangle, Gauge } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSensorData } from '../../hooks/useSensorData';
import { useSettingsContext } from '../../context/SettingsContext';
import { getSensorStatusWithSettings } from '../../hooks/useSettings';
import { formatNumber } from '../../utils/format';
import { Header } from './Header';
import { StatusCard } from './StatusCard';
import { AlertStatusCard } from './AlertStatusCard';
import { SensorCard } from './SensorCard';
import { AlertBanner } from './AlertBanner';
import { SmokeChart } from './SmokeChart';
import { SensorRanking } from './SensorRanking';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { settings, updateSettings } = useSettingsContext();

  const handleTogglePin = (sensorId: string) => {
    const pinnedSensors = settings.pinnedSensors || [];
    const newPinned = pinnedSensors.includes(sensorId)
      ? pinnedSensors.filter((id) => id !== sensorId)
      : [...pinnedSensors, sensorId];
    updateSettings({ pinnedSensors: newPinned });
  };
  const { sensors, history, sensorHistory, stats, sensorMaxValues, isLoading, error, refetch } = useSensorData(settings);
  const lastAlertRef = useRef<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Sound alert for danger sensors
  useEffect(() => {
    if (!settings.enableSoundAlert) return;

    const dangerSensors = sensors.filter(
      (s) => getSensorStatusWithSettings(s.value, settings.warningThreshold, settings.dangerThreshold) === 'danger'
    );

    if (dangerSensors.length > 0) {
      const now = Date.now();
      // Play sound max every 30 seconds
      if (now - lastAlertRef.current > 30000) {
        lastAlertRef.current = now;
        
        // Create beep sound using Web Audio API
        try {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.frequency.value = 800;
          oscillator.type = 'sine';
          gainNode.gain.value = 0.3;
          
          oscillator.start();
          
          // Beep pattern: 3 short beeps
          setTimeout(() => { gainNode.gain.value = 0; }, 200);
          setTimeout(() => { gainNode.gain.value = 0.3; }, 300);
          setTimeout(() => { gainNode.gain.value = 0; }, 500);
          setTimeout(() => { gainNode.gain.value = 0.3; }, 600);
          setTimeout(() => { gainNode.gain.value = 0; }, 800);
          setTimeout(() => { 
            oscillator.stop();
            audioContext.close();
          }, 900);
        } catch (e) {
          console.log('Audio not supported');
        }
      }
    }
  }, [sensors, settings.enableSoundAlert, settings.warningThreshold, settings.dangerThreshold]);

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0F172A',
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '20px',
            padding: '40px',
            textAlign: 'center',
            maxWidth: '400px',
          }}
        >
          <AlertTriangle size={48} color="#EF4444" style={{ marginBottom: '16px' }} />
          <h2 style={{ color: '#FCA5A5', margin: '0 0 8px' }}>เกิดข้อผิดพลาด</h2>
          <p style={{ color: '#FDA4AF', marginBottom: '24px' }}>{error}</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={() => navigate('/settings')}
              style={{
                background: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)',
                border: 'none',
                borderRadius: '12px',
                padding: '12px 24px',
                color: '#FFF',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              ไปตั้งค่า API
            </button>
            <button
              onClick={refetch}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                padding: '12px 24px',
                color: '#FFF',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              ลองใหม่
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)',
      padding: '32px',
    }}>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.08) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(239, 68, 68, 0.06) 0%, transparent 50%)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: '1400px', margin: '0 auto', position: 'relative' }}>
        <Header 
          onRefresh={refetch} 
          isLoading={isLoading} 
          onSettingsClick={() => navigate('/settings')}
        />
        
        <AlertBanner sensors={sensors} settings={settings} />

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px',
          marginBottom: '32px',
        }}>
          <StatusCard
            title="เซ็นเซอร์ทั้งหมด"
            value={stats.totalSensors}
            subtitle="จุดตรวจวัด"
            icon={Activity}
            color="#3B82F6"
            delay={0}
          />
          <StatusCard
            title="ออนไลน์"
            value={stats.onlineSensors}
            subtitle={`${Math.round((stats.onlineSensors / stats.totalSensors) * 100) || 0}% พร้อมใช้งาน`}
            icon={Wifi}
            color="#10B981"
            delay={0.1}
          />
          <StatusCard
            title="ค่าเฉลี่ย"
            value={`${formatNumber(stats.averageValue)} PPM`}
            subtitle="จากเซ็นเซอร์ทั้งหมด"
            icon={Gauge}
            color="#8B5CF6"
            delay={0.2}
          />
          <AlertStatusCard
            sensors={sensors}
            settings={settings}
            delay={0.3}
          />
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 380px',
          gap: '24px',
          marginBottom: '32px',
        }}>
          <SmokeChart data={history} sensorHistory={sensorHistory} settings={settings} />
          <SensorRanking data={sensorMaxValues} settings={settings} />
        </div>

        {/* Pinned Sensors Section */}
        {(() => {
          const pinnedSensors = sensors.filter(s => (settings.pinnedSensors || []).includes(s.id));
          
          if (pinnedSensors.length === 0) {
            return (
              <div style={{
                background: 'rgba(30, 41, 59, 0.5)',
                borderRadius: '20px',
                padding: '40px',
                textAlign: 'center',
                border: '1px dashed rgba(255, 255, 255, 0.1)',
              }}>
                <Activity size={40} color="#475569" style={{ marginBottom: '16px' }} />
                <h3 style={{ color: '#94A3B8', fontSize: '16px', fontWeight: 600, margin: '0 0 8px' }}>
                  ยังไม่มีเซ็นเซอร์ที่ปักหมุด
                </h3>
                <p style={{ color: '#64748B', fontSize: '14px', margin: '0 0 20px' }}>
                  ไปที่หน้าเซ็นเซอร์ทั้งหมดเพื่อปักหมุดเซ็นเซอร์ที่ต้องการแสดงที่หน้าหลัก
                </p>
                <button
                  onClick={() => navigate('/sensors')}
                  style={{
                    background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '12px 24px',
                    color: '#FFF',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  ไปปักหมุดเซ็นเซอร์
                </button>
              </div>
            );
          }

          return (
            <div>
              <div style={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '20px',
              }}>
                <h2 style={{ 
                  color: '#F8FAFC', 
                  fontSize: '20px', 
                  fontWeight: 600, 
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <Activity size={22} color="#3B82F6" />
                  เซ็นเซอร์ที่ปักหมุด
                  <span style={{ 
                    color: '#64748B', 
                    fontSize: '14px', 
                    fontWeight: 400 
                  }}>
                    ({pinnedSensors.length})
                  </span>
                </h2>
                <button
                  onClick={() => navigate('/sensors')}
                  style={{
                    background: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '10px',
                    padding: '10px 20px',
                    color: '#60A5FA',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  จัดการเซ็นเซอร์ →
                </button>
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '20px',
              }}>
                {pinnedSensors.map((sensor, index) => (
                  <SensorCard 
                    key={sensor.id} 
                    sensor={sensor} 
                    index={index} 
                    settings={settings}
                    isPinned={true}
                    onTogglePin={handleTogglePin}
                  />
                ))}
              </div>
            </div>
          );
        })()}

        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          style={{
            marginTop: '48px',
            paddingTop: '24px',
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            textAlign: 'center',
          }}
        >
          <p style={{ color: '#475569', fontSize: '13px' }}>
            © 2024 Smoke Detection System | โปรเจค ปวช.3
          </p>
        </motion.footer>
      </div>

    </div>
  );
};
