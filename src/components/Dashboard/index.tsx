import { useEffect, useRef, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Activity, Wifi, Gauge } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSensorDataContext } from '../../context/SensorDataContext';
import { useSettingsContext } from '../../context/SettingsContext';
import { useTheme } from '../../context/ThemeContext';
import { getSensorStatusWithSettings } from '../../hooks/useSettings';
import type { DashboardComponent, LayoutPosition } from '../../hooks/useSettings';
import { formatNumber } from '../../utils/format';
import { Header } from './Header';
import { StatusCard } from './StatusCard';
import { AlertStatusCard } from './AlertStatusCard';
import { SensorCard } from './SensorCard';
import { AlertBanner } from './AlertBanner';
import { SmokeChart } from './SmokeChart';
import { SensorRanking } from './SensorRanking';
import { SensorDetailPanel } from './SensorDetailPanel';
import { DashboardSkeleton } from './Skeleton';
import { MiniMap } from './MiniMap';
import { ComparisonChart } from './ComparisonChart';
import { SensorStatusHistory } from './SensorStatusHistory';
import { TrendAnalysisPanel } from './TrendAnalysisPanel';
import type { SensorData } from '../../types/sensor';

const defaultPositions: Record<LayoutPosition, DashboardComponent | null> = {
  top: 'statusCards',
  middleLeft: 'chart',
  middleRight: 'ranking',
  bottom: 'pinnedSensors',
  bottomLeft: 'miniMap',
  bottomMiddle: 'comparisonChart',
  bottomRight: 'statusHistory',
  trendPanel: 'trendAnalysis',
};

export const Dashboard = () => {
  const navigate = useNavigate();
  const { settings, updateSettings } = useSettingsContext();
  const { isDark } = useTheme();
  const [selectedSensor, setSelectedSensor] = useState<SensorData | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('all');

  const handleTogglePin = (sensorId: string) => {
    const pinnedSensors = settings.pinnedSensors || [];
    const newPinned = pinnedSensors.includes(sensorId)
      ? pinnedSensors.filter((id) => id !== sensorId)
      : [...pinnedSensors, sensorId];
    updateSettings({ pinnedSensors: newPinned });
  };

  const { sensors, history, sensorHistory, stats, sensorMaxValues, isLoading } = useSensorDataContext();

  // Filter sensors based on group
  const filteredSensors = useMemo(() => {
    if (selectedGroupId === 'all') return sensors;
    return sensors.filter(s => settings.sensorAssignments?.[s.id] === selectedGroupId);
  }, [sensors, selectedGroupId, settings.sensorAssignments]);

  const filteredSensorIds = useMemo(() => filteredSensors.map(s => s.id), [filteredSensors]);

  // Recalculate stats for filtered sensors
  const filteredStats = useMemo(() => {
    if (selectedGroupId === 'all') return stats;

    const totalSensors = filteredSensors.length;
    const onlineSensors = filteredSensors.filter(s => s.isOnline ?? true).length;
    const totalValue = filteredSensors.reduce((acc, s) => acc + s.value, 0);
    const averageValue = totalSensors > 0 ? totalValue / totalSensors : 0;

    return {
      totalSensors,
      onlineSensors,
      averageValue
    };
  }, [filteredSensors, stats, selectedGroupId]);

  // Filter max values (ranking)
  const filteredMaxValues = useMemo(() => {
    if (selectedGroupId === 'all') return sensorMaxValues;
    return sensorMaxValues.filter(s => filteredSensors.some(fs => fs.id === s.id || fs.location === s.id));
  }, [sensorMaxValues, filteredSensors, selectedGroupId]);

  const lastAlertRef = useRef<number>(0);

  // Show skeleton only during actual loading, not waiting for data
  const showSkeleton = isLoading && sensors.length === 0;

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

  // Theme-aware colors
  const bgGradient = isDark
    ? 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)'
    : 'linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 50%, #F8FAFC 100%)';

  const overlayGradient = isDark
    ? 'radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.08) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(239, 68, 68, 0.06) 0%, transparent 50%)'
    : 'radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(239, 68, 68, 0.03) 0%, transparent 50%)';

  const textColor = isDark ? '#F8FAFC' : '#0F172A';
  const textSecondary = isDark ? '#94A3B8' : '#64748B';
  const cardBg = isDark ? 'rgba(30, 41, 59, 0.5)' : 'rgba(255, 255, 255, 0.8)';
  const borderColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

  return (
    <div style={{
      minHeight: '100vh',
      background: bgGradient,
      padding: 'clamp(16px, 4vw, 32px)',
      transition: 'background 0.3s ease',
    }}>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: overlayGradient,
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: '1400px', margin: '0 auto', position: 'relative' }}>
        <Header onSettingsClick={() => navigate('/settings')} />

        {/* Show Skeleton on initial load */}
        {showSkeleton ? (
          <DashboardSkeleton />
        ) : (
          <>
            {/* Zone Filter */}
            {settings.sensorGroups && settings.sensorGroups.length > 0 && (
              <div style={{ marginBottom: '24px', overflowX: 'auto', paddingBottom: '4px' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => setSelectedGroupId('all')}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '12px',
                      border: selectedGroupId === 'all' ? 'none' : `1px solid ${borderColor}`,
                      background: selectedGroupId === 'all'
                        ? 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)'
                        : (isDark ? 'rgba(255,255,255,0.05)' : '#FFFFFF'),
                      color: selectedGroupId === 'all' ? '#FFF' : textSecondary,
                      fontSize: '14px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.2s',
                      boxShadow: selectedGroupId === 'all' ? '0 4px 12px rgba(59, 130, 246, 0.3)' : 'none',
                    }}
                  >
                    ทั้งหมด ({sensors.length})
                  </button>
                  {settings.sensorGroups.map(group => {
                    // Count sensors in this group
                    const count = sensors.filter(s => settings.sensorAssignments?.[s.id] === group.id).length;
                    return (
                      <button
                        key={group.id}
                        onClick={() => setSelectedGroupId(group.id)}
                        style={{
                          padding: '8px 16px',
                          borderRadius: '12px',
                          border: selectedGroupId === group.id ? 'none' : `1px solid ${borderColor}`,
                          background: selectedGroupId === group.id
                            ? group.color
                            : (isDark ? 'rgba(255,255,255,0.05)' : '#FFFFFF'),
                          color: selectedGroupId === group.id ? '#FFF' : textSecondary,
                          fontSize: '14px',
                          fontWeight: 500,
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          transition: 'all 0.2s',
                          boxShadow: selectedGroupId === group.id ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <span style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: selectedGroupId === group.id ? '#FFF' : group.color
                        }} />
                        {group.name} ({count})
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <AlertBanner sensors={filteredSensors} settings={settings} />

            {/* Render components based on layout positions */}
            {(() => {
              const positions = settings.dashboardLayout?.positions || defaultPositions;

              const renderComponent = (componentId: DashboardComponent | null) => {
                if (!componentId) return null;

                switch (componentId) {
                  case 'statusCards':
                    return (
                      <>
                        <div className="status-grid" style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                          gap: '20px',
                        }}>
                          <StatusCard
                            title="เซ็นเซอร์ทั้งหมด"
                            value={filteredStats.totalSensors}
                            subtitle="จุดตรวจวัด"
                            icon={Activity}
                            color="#3B82F6"
                            delay={0}
                          />
                          <StatusCard
                            title="ออนไลน์"
                            value={filteredStats.onlineSensors}
                            subtitle={`พร้อมใช้งาน ${Math.round((filteredStats.onlineSensors / (filteredStats.totalSensors || 1)) * 100) || 0}%`}
                            icon={Wifi}
                            color="#10B981"
                            delay={0.1}
                          />
                          <StatusCard
                            title="ค่าเฉลี่ย"
                            value={`${formatNumber(filteredStats.averageValue)} PPM`}
                            subtitle="จากเซ็นเซอร์ทั้งหมด"
                            icon={Gauge}
                            color="#8B5CF6"
                            delay={0.2}
                          />
                          <AlertStatusCard
                            sensors={filteredSensors}
                            settings={settings}
                            delay={0.3}
                          />
                        </div>
                        <style>{`
                      @media (max-width: 640px) {
                        .status-grid { grid-template-columns: 1fr !important; }
                      }
                    `}</style>
                      </>
                    );
                  case 'chart':
                    return <SmokeChart
                      data={history}
                      sensorHistory={sensorHistory}
                      settings={settings}
                      filteredSensorIds={selectedGroupId !== 'all' ? filteredSensorIds : undefined}
                    />;
                  case 'ranking':
                    return <SensorRanking data={filteredMaxValues} settings={settings} />;
                  case 'miniMap':
                    return <MiniMap sensors={filteredSensors} />;
                  case 'comparisonChart':
                    return <ComparisonChart sensors={filteredSensors} />;
                  case 'statusHistory':
                    return <SensorStatusHistory sensors={filteredSensors} />;
                  case 'trendAnalysis':
                    return <TrendAnalysisPanel history={history} />;
                  case 'pinnedSensors':
                    const pinnedSensors = filteredSensors.filter(s => (settings.pinnedSensors || []).includes(s.id));
                    if (pinnedSensors.length === 0) {
                      return (
                        <div style={{
                          background: cardBg,
                          borderRadius: '20px',
                          padding: '60px 40px',
                          textAlign: 'center',
                          border: `1px dashed ${borderColor}`,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minHeight: '250px',
                        }}>
                          <Activity size={48} color={textSecondary} style={{ marginBottom: '20px' }} />
                          <h3 style={{ color: textSecondary, fontSize: '18px', fontWeight: 600, margin: '0 0 10px' }}>
                            ยังไม่มีเซ็นเซอร์ที่ปักหมุด
                          </h3>
                          <p style={{ color: textSecondary, fontSize: '14px', margin: '0 0 24px', maxWidth: '400px', opacity: 0.7 }}>
                            ไปที่หน้าเซ็นเซอร์ทั้งหมดเพื่อปักหมุดเซ็นเซอร์ที่ต้องการแสดง
                          </p>
                          <button
                            onClick={() => navigate('/sensors')}
                            style={{
                              background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                              border: 'none',
                              borderRadius: '12px',
                              padding: '14px 28px',
                              color: '#FFF',
                              fontSize: '15px',
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
                            color: textColor,
                            fontSize: '20px',
                            fontWeight: 600,
                            margin: 0,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                          }}>
                            <Activity size={22} color="#3B82F6" />
                            เซ็นเซอร์ที่ปักหมุด
                            <span style={{ color: textSecondary, fontSize: '14px', fontWeight: 400 }}>
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
                        <div className="sensor-grid" style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                          gap: '20px',
                        }}>
                          {pinnedSensors.map((sensor) => (
                            <SensorCard
                              key={sensor.id}
                              sensor={sensor}
                              settings={settings}
                              isPinned={true}
                              onTogglePin={handleTogglePin}
                              onClick={() => setSelectedSensor(sensor)}
                            />
                          ))}
                        </div>
                        <style>{`
                      @media (max-width: 640px) {
                        .sensor-grid { grid-template-columns: 1fr !important; }
                      }
                    `}</style>
                      </div>
                    );
                  default:
                    return null;
                }
              };

              return (
                <>
                  {/* Top Row */}
                  <div style={{ marginBottom: '32px' }}>
                    {renderComponent(positions.top)}
                  </div>

                  {/* Middle Row - 2 Columns */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 500px), 1fr))',
                    gap: '24px',
                    marginBottom: '32px',
                  }}>
                    {renderComponent(positions.middleLeft)}
                    {renderComponent(positions.middleRight)}
                  </div>

                  {/* Bottom Row */}
                  <div style={{ marginBottom: '32px' }}>
                    {renderComponent(positions.bottom)}
                  </div>

                  {/* Additional Components Row - 3 Columns */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 350px), 1fr))',
                    gap: '24px',
                    marginBottom: '32px',
                  }}>
                    {renderComponent(positions.bottomLeft)}
                    {renderComponent(positions.bottomMiddle)}
                    {renderComponent(positions.bottomRight)}
                  </div>
                </>
              );
            })()}

            <motion.footer
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              style={{
                marginTop: '48px',
                paddingTop: '24px',
                borderTop: `1px solid ${borderColor}`,
                textAlign: 'center',
              }}
            >
              <p style={{ color: textSecondary, fontSize: '13px' }}>
                © 2024 Smoke Detection System | โปรเจค ปวช.3
              </p>
            </motion.footer>
          </>
        )}
      </div>

      {/* Sensor Detail Panel */}
      {selectedSensor && (
        <SensorDetailPanel
          sensor={selectedSensor}
          stats={(() => {
            const sensorStats = sensorMaxValues.find(s =>
              s.id === selectedSensor.location || s.id === selectedSensor.id
            );
            if (sensorStats) {
              return {
                max24h: sensorStats.maxValue,
                min24h: sensorStats.minValue,
                avg24h: sensorStats.avgValue,
              };
            }
            return null;
          })()}
          settings={settings}
          onClose={() => setSelectedSensor(null)}
        />
      )}
    </div>
  );
};
