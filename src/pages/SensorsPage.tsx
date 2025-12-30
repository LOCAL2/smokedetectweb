import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Activity, Search } from 'lucide-react';
import { useState } from 'react';
import { useSensorDataContext } from '../context/SensorDataContext';
import { useSettingsContext } from '../context/SettingsContext';
import { SensorCard } from '../components/Dashboard/SensorCard';
import { SensorDetailPanel } from '../components/Dashboard/SensorDetailPanel';
import type { SensorData } from '../types/sensor';

export const SensorsPage = () => {
  const navigate = useNavigate();
  const { settings, updateSettings } = useSettingsContext();
  const { sensors, sensorMaxValues, isLoading } = useSensorDataContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'online' | 'warning' | 'danger' | 'pinned'>('all');
  const [selectedSensor, setSelectedSensor] = useState<SensorData | null>(null);

  const handleTogglePin = (sensorId: string) => {
    const pinnedSensors = settings.pinnedSensors || [];
    const newPinned = pinnedSensors.includes(sensorId)
      ? pinnedSensors.filter((id) => id !== sensorId)
      : [...pinnedSensors, sensorId];
    updateSettings({ pinnedSensors: newPinned });
  };

  const filteredSensors = sensors.filter((sensor) => {
    const matchesSearch =
      (sensor.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sensor.location || '').toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filter === 'online') return sensor.isOnline;
    if (filter === 'warning') return sensor.value >= settings.warningThreshold && sensor.value < settings.dangerThreshold;
    if (filter === 'danger') return sensor.value >= settings.dangerThreshold;
    if (filter === 'pinned') return (settings.pinnedSensors || []).includes(sensor.id);

    return true;
  });

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)',
        padding: '32px',
      }}
    >
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '32px' }}>
          <button
            onClick={() => navigate('/')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '10px',
              padding: '10px 16px',
              color: '#94A3B8',
              fontSize: '14px',
              cursor: 'pointer',
              marginBottom: '24px',
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
          >
            <ArrowLeft size={18} />
            กลับหน้าหลัก
          </button>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Activity size={28} color="#3B82F6" />
              <div>
                <h1 style={{ color: '#F8FAFC', fontSize: '28px', fontWeight: 700, margin: 0 }}>สถานะเซ็นเซอร์</h1>
                <p style={{ color: '#64748B', fontSize: '14px', margin: '4px 0 0' }}>
                  ทั้งหมด {sensors.length} เซ็นเซอร์
                </p>
              </div>
            </div>

            {/* Search */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '10px 16px',
                minWidth: '250px',
              }}
            >
              <Search size={18} color="#64748B" />
              <input
                type="text"
                placeholder="ค้นหาเซ็นเซอร์..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  background: 'none',
                  border: 'none',
                  outline: 'none',
                  color: '#F8FAFC',
                  fontSize: '14px',
                  width: '100%',
                }}
              />
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}
        >
          {[
            { key: 'all', label: 'ทั้งหมด', color: '#3B82F6' },
            { key: 'pinned', label: `ปักหมุด (${(settings.pinnedSensors || []).length})`, color: '#8B5CF6' },
            { key: 'online', label: 'ออนไลน์', color: '#10B981' },
            { key: 'warning', label: 'เฝ้าระวัง', color: '#F59E0B' },
            { key: 'danger', label: 'อันตราย', color: '#EF4444' },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setFilter(item.key as typeof filter)}
              style={{
                padding: '10px 20px',
                borderRadius: '10px',
                border: filter === item.key ? `2px solid ${item.color}` : '1px solid rgba(255, 255, 255, 0.1)',
                background: filter === item.key ? `${item.color}20` : 'rgba(255, 255, 255, 0.03)',
                color: filter === item.key ? item.color : '#94A3B8',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {item.label}
            </button>
          ))}
        </motion.div>

        {/* Sensors Grid */}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#64748B' }}>กำลังโหลด...</div>
        ) : filteredSensors.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              textAlign: 'center',
              padding: '80px 40px',
              background: 'rgba(30, 41, 59, 0.5)',
              borderRadius: '24px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              minHeight: '400px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background: 'rgba(99, 102, 241, 0.1)',
                border: '2px solid rgba(99, 102, 241, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '24px',
              }}
            >
              <Activity size={48} color="#6366F1" style={{ opacity: 0.7 }} />
            </div>
            <h3 style={{ color: '#F8FAFC', fontSize: '22px', fontWeight: 600, margin: '0 0 12px' }}>
              ไม่พบเซ็นเซอร์
            </h3>
            <p style={{ color: '#64748B', fontSize: '16px', margin: '0 0 32px', maxWidth: '400px', lineHeight: 1.6 }}>
              {filter === 'pinned' 
                ? 'ยังไม่มีเซ็นเซอร์ที่ปักหมุด กดไอคอนหมุดบนการ์ดเซ็นเซอร์เพื่อปักหมุด'
                : filter === 'warning'
                ? 'ไม่มีเซ็นเซอร์ที่อยู่ในสถานะเฝ้าระวัง'
                : filter === 'danger'
                ? 'ไม่มีเซ็นเซอร์ที่อยู่ในสถานะอันตราย'
                : filter === 'online'
                ? 'ไม่มีเซ็นเซอร์ที่ออนไลน์อยู่ในขณะนี้'
                : searchTerm
                ? `ไม่พบเซ็นเซอร์ที่ตรงกับ "${searchTerm}"`
                : 'ยังไม่มีเซ็นเซอร์ในระบบ กรุณาเชื่อมต่อเซ็นเซอร์หรือเปิด Demo Mode'}
            </p>
            {(filter !== 'all' || searchTerm) && (
              <button
                onClick={() => { setFilter('all'); setSearchTerm(''); }}
                style={{
                  padding: '12px 24px',
                  background: 'rgba(99, 102, 241, 0.15)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  borderRadius: '12px',
                  color: '#A5B4FC',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                ดูเซ็นเซอร์ทั้งหมด
              </button>
            )}
          </motion.div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '20px',
            }}
          >
            {filteredSensors.map((sensor) => (
              <SensorCard 
                key={sensor.id} 
                sensor={sensor} 
                settings={settings}
                isPinned={(settings.pinnedSensors || []).includes(sensor.id)}
                onTogglePin={handleTogglePin}
                onClick={() => setSelectedSensor(sensor)}
              />
            ))}
          </div>
        )}

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{
            textAlign: 'center',
            color: '#475569',
            fontSize: '13px',
            marginTop: '48px',
          }}
        >
          © 2024 Smoke Detection System
        </motion.p>
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
