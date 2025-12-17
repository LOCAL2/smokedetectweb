import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Activity, Search } from 'lucide-react';
import { useState } from 'react';
import { useSensorData } from '../hooks/useSensorData';
import { useSettingsContext } from '../context/SettingsContext';
import { SensorCard } from '../components/Dashboard/SensorCard';

export const SensorsPage = () => {
  const navigate = useNavigate();
  const { settings, updateSettings } = useSettingsContext();
  const { sensors, isLoading } = useSensorData(settings);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'online' | 'warning' | 'danger' | 'pinned'>('all');

  const handleTogglePin = (sensorId: string) => {
    const pinnedSensors = settings.pinnedSensors || [];
    const newPinned = pinnedSensors.includes(sensorId)
      ? pinnedSensors.filter((id) => id !== sensorId)
      : [...pinnedSensors, sensorId];
    updateSettings({ pinnedSensors: newPinned });
  };

  const filteredSensors = sensors.filter((sensor) => {
    const matchesSearch =
      sensor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sensor.location.toLowerCase().includes(searchTerm.toLowerCase());

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
              background: 'none',
              border: 'none',
              color: '#94A3B8',
              fontSize: '14px',
              cursor: 'pointer',
              marginBottom: '24px',
            }}
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
          <div
            style={{
              textAlign: 'center',
              padding: '60px',
              background: 'rgba(30, 41, 59, 0.5)',
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <p style={{ color: '#64748B', fontSize: '16px' }}>ไม่พบเซ็นเซอร์ที่ตรงกับเงื่อนไข</p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '20px',
            }}
          >
            {filteredSensors.map((sensor, index) => (
              <SensorCard 
                key={sensor.id} 
                sensor={sensor} 
                index={index} 
                settings={settings}
                isPinned={(settings.pinnedSensors || []).includes(sensor.id)}
                onTogglePin={handleTogglePin}
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
    </div>
  );
};
