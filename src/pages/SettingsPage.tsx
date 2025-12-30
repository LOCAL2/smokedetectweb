import { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, RotateCcw, AlertTriangle, Clock, Bell, Volume2,
  Plus, Trash2, Server, MapPin, Gamepad2, Trash, Navigation, Activity,
  Layout, GripVertical, BarChart3, Pin,
} from 'lucide-react';
import type { ApiEndpoint, SensorCoordinates, DashboardComponent, LayoutPosition, SettingsConfig } from '../hooks/useSettings';
import { useSettingsContext } from '../context/SettingsContext';
import { useSensorDataContext } from '../context/SensorDataContext';

// Dashboard component info
const dashboardComponents: Record<DashboardComponent, { name: string; icon: React.ElementType; color: string }> = {
  statusCards: { name: 'สถิติ', icon: Activity, color: '#3B82F6' },
  chart: { name: 'กราฟ', icon: BarChart3, color: '#8B5CF6' },
  ranking: { name: 'อันดับค่าสูงสุด 24 ชั่วโมง', icon: Activity, color: '#F59E0B' },
  pinnedSensors: { name: 'เซ็นเซอร์ที่ปักหมุด', icon: Pin, color: '#10B981' },
};

const defaultPositions: Record<LayoutPosition, DashboardComponent | null> = {
  top: 'statusCards',
  middleLeft: 'chart',
  middleRight: 'ranking',
  bottom: 'pinnedSensors',
};

// Draggable Layout Slot Component
let draggedComponent: DashboardComponent | null = null;
let draggedFromPosition: LayoutPosition | null = null;

const LayoutSlot = ({ 
  position, 
  componentId, 
  settings, 
  updateSettings,
}: { 
  position: LayoutPosition;
  componentId: DashboardComponent | null;
  settings: SettingsConfig;
  updateSettings: (s: Partial<SettingsConfig>) => void;
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  
  const component = componentId ? dashboardComponents[componentId] : null;
  const Icon = component?.icon || Activity;
  
  const handleDragStart = (e: React.DragEvent) => {
    if (componentId) {
      draggedComponent = componentId;
      draggedFromPosition = position;
      e.dataTransfer.effectAllowed = 'move';
    }
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedFromPosition !== position && !isDragOver) {
      setIsDragOver(true);
    }
  };
  
  const handleDragLeave = () => {
    setIsDragOver(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (draggedComponent && draggedFromPosition && draggedFromPosition !== position) {
      const currentPositions = settings.dashboardLayout?.positions || defaultPositions;
      
      const newPositions = { ...currentPositions };
      newPositions[draggedFromPosition] = componentId;
      newPositions[position] = draggedComponent;
      
      updateSettings({
        dashboardLayout: { positions: newPositions }
      });
    }
    draggedComponent = null;
    draggedFromPosition = null;
  };
  
  const renderPreview = () => {
    if (!componentId) return null;
    
    switch (componentId) {
      case 'statusCards':
        return (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', marginTop: '8px' }}>
            {['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B'].map((color, i) => (
              <div key={i} style={{
                height: '20px',
                background: `${color}20`,
                borderRadius: '4px',
                border: `1px solid ${color}40`,
              }} />
            ))}
          </div>
        );
      case 'chart':
        return (
          <div style={{
            height: '40px',
            marginTop: '8px',
            display: 'flex',
            alignItems: 'flex-end',
            gap: '2px',
          }}>
            {[30, 50, 40, 70, 55, 80, 60].map((h, i) => (
              <div key={i} style={{
                flex: 1,
                height: `${h}%`,
                background: 'linear-gradient(180deg, #8B5CF6 0%, #6366F1 100%)',
                borderRadius: '2px',
              }} />
            ))}
          </div>
        );
      case 'ranking':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '8px' }}>
            {[1, 2, 3].map((rank) => (
              <div key={rank} style={{
                height: '10px',
                background: rank === 1 ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.1)',
                borderRadius: '2px',
                width: `${100 - (rank - 1) * 20}%`,
              }} />
            ))}
          </div>
        );
      case 'pinnedSensors':
        return (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', marginTop: '8px' }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{
                height: '20px',
                background: 'rgba(16,185,129,0.15)',
                borderRadius: '4px',
                border: '1px solid rgba(16,185,129,0.3)',
              }} />
            ))}
          </div>
        );
      default:
        return null;
    }
  };
  
  return (
    <div
      draggable={!!componentId}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onDragEnd={() => setIsDragOver(false)}
      style={{
        background: isDragOver 
          ? 'rgba(99, 102, 241, 0.2)' 
          : component 
            ? `linear-gradient(135deg, ${component.color}15 0%, ${component.color}08 100%)`
            : 'rgba(255,255,255,0.02)',
        borderRadius: '10px',
        padding: '10px',
        border: isDragOver 
          ? '2px dashed #6366F1' 
          : `1px solid ${component ? `${component.color}40` : 'rgba(255,255,255,0.1)'}`,
        cursor: componentId ? 'grab' : 'default',
        minHeight: position === 'top' || position === 'bottom' ? '60px' : '70px',
        transition: 'border-color 0.1s, background 0.1s',
      }}
    >
      {component ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <GripVertical size={14} color="#64748B" />
          <div style={{
            width: '24px',
            height: '24px',
            borderRadius: '6px',
            background: `${component.color}25`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Icon size={12} color={component.color} />
          </div>
          <span style={{ color: '#E2E8F0', fontSize: '11px', fontWeight: 600 }}>
            {component.name}
          </span>
        </div>
      ) : (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          height: '100%',
          color: '#64748B',
          fontSize: '11px',
        }}>
          ว่าง
        </div>
      )}
      {renderPreview()}
    </div>
  );
};

// Reusable Components
const Card = ({ children, delay = 0, highlight = false }: { children: React.ReactNode; delay?: number; highlight?: boolean }) => (
  <motion.section
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.3 }}
    style={{
      background: highlight 
        ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(245, 158, 11, 0.02) 100%)'
        : 'rgba(15, 23, 42, 0.5)',
      borderRadius: '16px',
      border: highlight ? '1px solid rgba(245, 158, 11, 0.2)' : '1px solid rgba(255, 255, 255, 0.06)',
      padding: '20px',
      marginBottom: '12px',
    }}
  >
    {children}
  </motion.section>
);

const Toggle = ({ enabled, onChange, color = '#6366F1' }: { enabled: boolean; onChange: () => void; color?: string }) => (
  <div onClick={onChange} style={{
    width: '48px', height: '26px', borderRadius: '13px', cursor: 'pointer', transition: 'all 0.2s',
    background: enabled ? color : 'rgba(255, 255, 255, 0.1)', position: 'relative', flexShrink: 0,
  }}>
    <div style={{
      width: '22px', height: '22px', borderRadius: '11px', background: '#FFF',
      position: 'absolute', top: '2px', left: enabled ? '24px' : '2px', transition: 'left 0.2s',
      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
    }} />
  </div>
);

const SettingRow = ({ icon: Icon, title, subtitle, color, children }: {
  icon: React.ElementType; title: string; subtitle?: string; color: string; children: React.ReactNode;
}) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '4px 0' }}>
    <div style={{
      width: '40px', height: '40px', borderRadius: '12px', flexShrink: 0,
      background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <Icon size={20} color={color} />
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <p style={{ color: '#F1F5F9', fontSize: '14px', fontWeight: 500, margin: 0 }}>{title}</p>
      {subtitle && <p style={{ color: '#64748B', fontSize: '12px', margin: '2px 0 0' }}>{subtitle}</p>}
    </div>
    {children}
  </div>
);

export const SettingsPage = () => {
  const navigate = useNavigate();
  const { settings, updateSettings, resetSettings } = useSettingsContext();
  const { sensors } = useSensorDataContext();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [editingSensorId, setEditingSensorId] = useState<string | null>(null);
  const [newSensorId, setNewSensorId] = useState('');

  const handleClearHistory = () => {
    localStorage.removeItem('smoke-sensor-history');
    localStorage.removeItem('smoke-sensor-max-values');
    localStorage.removeItem('smoke-sensor-individual-history');
    setShowClearConfirm(false);
    window.location.reload();
  };

  // Get coordinates for a sensor from settings (match by location or id)
  const getSensorCoords = (sensorId: string, location?: string): SensorCoordinates | undefined => {
    return (settings.sensorCoordinates || []).find(c => 
      c.sensorId === location || c.sensorId === sensorId
    );
  };

  // Combine online sensors with saved coordinates
  // Use location as primary key for better persistence across endpoint changes
  // Memoize to prevent flickering when sensor data updates frequently (Demo Mode)
  
  // Track previous sensor keys to prevent unnecessary re-renders
  const prevSensorKeysRef = useRef<string>('');
  const prevSensorListRef = useRef<{ id: string; location: string; coordKey: string; isOnline: boolean }[]>([]);
  
  const allSensorIds = useMemo(() => {
    const sensorMap = new Map<string, { id: string; location: string; coordKey: string; isOnline: boolean }>();
    
    // Add online sensors - use location as coordKey for persistence
    sensors.forEach(s => {
      const coordKey = s.location || s.id;
      sensorMap.set(coordKey, { 
        id: s.id, 
        location: s.location || s.name || s.id, 
        coordKey,
        isOnline: true 
      });
    });
    
    // Add saved coordinates (even if sensor is offline)
    (settings.sensorCoordinates || []).forEach(c => {
      if (!sensorMap.has(c.sensorId)) {
        sensorMap.set(c.sensorId, { 
          id: c.sensorId, 
          location: c.address || c.sensorId, 
          coordKey: c.sensorId,
          isOnline: false 
        });
      }
    });
    
    // Create a stable key from sensor IDs only (not values)
    const currentKeys = Array.from(sensorMap.keys()).sort().join(',');
    
    // Only update if the keys actually changed
    if (currentKeys !== prevSensorKeysRef.current) {
      prevSensorKeysRef.current = currentKeys;
      prevSensorListRef.current = Array.from(sensorMap.values());
    }
    
    return prevSensorListRef.current;
  }, [sensors, settings.sensorCoordinates]);

  // Add new sensor manually
  const addNewSensor = () => {
    if (!newSensorId.trim()) return;
    const existing = settings.sensorCoordinates || [];
    if (existing.find(c => c.sensorId === newSensorId.trim())) {
      alert('Sensor ID นี้มีอยู่แล้ว');
      return;
    }
    updateSettings({ 
      sensorCoordinates: [...existing, { sensorId: newSensorId.trim(), lat: 0, lng: 0 }] 
    });
    setNewSensorId('');
    setEditingSensorId(newSensorId.trim());
  };

  // Delete sensor coordinates
  const deleteSensorCoords = (sensorId: string) => {
    const existing = settings.sensorCoordinates || [];
    updateSettings({ sensorCoordinates: existing.filter(c => c.sensorId !== sensorId) });
  };

  // Update sensor coordinates
  const updateSensorCoords = (sensorId: string, lat: number, lng: number, address?: string) => {
    const existing = settings.sensorCoordinates || [];
    const index = existing.findIndex(c => c.sensorId === sensorId);
    
    if (index >= 0) {
      const updated = [...existing];
      updated[index] = { sensorId, lat, lng, address };
      updateSettings({ sensorCoordinates: updated });
    } else {
      updateSettings({ sensorCoordinates: [...existing, { sensorId, lat, lng, address }] });
    }
  };

  // Get current location
  const getCurrentLocation = (sensorId: string) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          updateSensorCoords(sensorId, position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('ไม่สามารถดึงตำแหน่งได้ กรุณาอนุญาตการเข้าถึงตำแหน่ง');
        }
      );
    } else {
      alert('เบราว์เซอร์ไม่รองรับ Geolocation');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0B0F1A',
      padding: 'clamp(16px, 4vw, 24px)',
    }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: 'flex', alignItems: 'center', gap: '16px',
            marginBottom: '24px', paddingBottom: '20px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          }}
        >
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
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
          >
            <ArrowLeft size={18} />
            <span style={{ display: 'none' }}>กลับ</span>
          </button>
          <div>
            <h1 style={{ color: '#F8FAFC', fontSize: 'clamp(18px, 4vw, 20px)', fontWeight: 600, margin: 0 }}>ตั้งค่า</h1>
            <p style={{ color: '#64748B', fontSize: '13px', margin: '2px 0 0' }}>บันทึกอัตโนมัติ</p>
          </div>
        </motion.header>

        {/* Thresholds */}
        <Card delay={0.05}>
          <h3 style={{ color: '#F1F5F9', fontSize: '14px', fontWeight: 600, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={16} color="#F59E0B" /> ระดับค่าควัน (PPM)
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Warning */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '4px', background: '#F59E0B' }} />
              <span style={{ color: '#94A3B8', fontSize: '13px', width: '70px' }}>เฝ้าระวัง</span>
              <input
                type="number"
                value={settings.warningThreshold}
                onChange={(e) => updateSettings({ warningThreshold: Number(e.target.value) || 0 })}
                style={{
                  flex: 1, padding: '10px 14px', background: 'rgba(245, 158, 11, 0.1)',
                  border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '10px',
                  color: '#F59E0B', fontSize: '16px', fontWeight: 600, outline: 'none', textAlign: 'center',
                }}
              />
              <span style={{ color: '#64748B', fontSize: '12px' }}>PPM</span>
            </div>
            
            {/* Danger */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '4px', background: '#EF4444' }} />
              <span style={{ color: '#94A3B8', fontSize: '13px', width: '70px' }}>อันตราย</span>
              <input
                type="number"
                value={settings.dangerThreshold}
                onChange={(e) => updateSettings({ dangerThreshold: Number(e.target.value) || 0 })}
                style={{
                  flex: 1, padding: '10px 14px', background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '10px',
                  color: '#EF4444', fontSize: '16px', fontWeight: 600, outline: 'none', textAlign: 'center',
                }}
              />
              <span style={{ color: '#64748B', fontSize: '12px' }}>PPM</span>
            </div>
          </div>
        </Card>

        {/* Polling Interval */}
        <Card delay={0.1}>
          <SettingRow icon={Clock} title="ความถี่รีเฟรช" subtitle={`ดึงข้อมูลทุกๆ ${(settings.pollingInterval / 1000).toFixed(1)} วินาที`} color="#3B82F6">
            <span style={{ color: '#3B82F6', fontSize: '15px', fontWeight: 600, minWidth: '50px', textAlign: 'right' }}>
              {(settings.pollingInterval / 1000).toFixed(1)}s
            </span>
          </SettingRow>
          <div style={{ marginTop: '16px', padding: '0 4px' }}>
            <input
              type="range"
              min="0.5"
              max="30"
              step="0.5"
              value={settings.pollingInterval / 1000}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                updateSettings({ pollingInterval: val * 1000 });
              }}
              style={{
                width: '100%',
                height: '6px',
                borderRadius: '3px',
                background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${((settings.pollingInterval / 1000 - 0.5) / 29.5) * 100}%, rgba(255,255,255,0.1) ${((settings.pollingInterval / 1000 - 0.5) / 29.5) * 100}%, rgba(255,255,255,0.1) 100%)`,
                outline: 'none',
                cursor: 'pointer',
                WebkitAppearance: 'none',
                appearance: 'none',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
              <span style={{ color: '#64748B', fontSize: '11px' }}>0.5s</span>
              <span style={{ color: '#64748B', fontSize: '11px' }}>30s</span>
            </div>
          </div>
          <style>{`
            input[type="range"]::-webkit-slider-thumb {
              -webkit-appearance: none;
              appearance: none;
              width: 20px;
              height: 20px;
              border-radius: 50%;
              background: #3B82F6;
              cursor: pointer;
              border: 3px solid #1E293B;
              box-shadow: 0 2px 6px rgba(59, 130, 246, 0.4);
            }
            input[type="range"]::-moz-range-thumb {
              width: 20px;
              height: 20px;
              border-radius: 50%;
              background: #3B82F6;
              cursor: pointer;
              border: 3px solid #1E293B;
              box-shadow: 0 2px 6px rgba(59, 130, 246, 0.4);
            }
          `}</style>
        </Card>

        {/* Alerts */}
        <Card delay={0.15}>
          <h3 style={{ color: '#F1F5F9', fontSize: '14px', fontWeight: 600, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell size={16} color="#10B981" /> การแจ้งเตือน
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <SettingRow icon={Volume2} title="เสียงแจ้งเตือน" color="#10B981">
              <Toggle enabled={settings.enableSoundAlert} onChange={() => updateSettings({ enableSoundAlert: !settings.enableSoundAlert })} color="#10B981" />
            </SettingRow>
            <SettingRow icon={Bell} title="Notification" color="#10B981">
              <Toggle enabled={settings.enableNotification} onChange={() => updateSettings({ enableNotification: !settings.enableNotification })} color="#10B981" />
            </SettingRow>
          </div>
        </Card>

        {/* API Endpoints */}
        <Card delay={0.2}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ color: '#F1F5F9', fontSize: '14px', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Server size={16} color="#8B5CF6" /> API Endpoints
            </h3>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                const newEndpoint: ApiEndpoint = {
                  id: `endpoint-${Date.now()}`,
                  name: `สถานที่ ${(settings.apiEndpoints?.length || 0) + 1}`,
                  url: '', enabled: true,
                };
                updateSettings({ apiEndpoints: [...(settings.apiEndpoints || []), newEndpoint] });
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px',
                background: 'rgba(139, 92, 246, 0.15)', border: '1px solid rgba(139, 92, 246, 0.3)',
                borderRadius: '8px', color: '#A78BFA', fontSize: '13px', fontWeight: 500, cursor: 'pointer',
              }}
            >
              <Plus size={16} /> เพิ่ม
            </motion.button>
          </div>

          {(!settings.apiEndpoints || settings.apiEndpoints.length === 0) ? (
            <div style={{ padding: '24px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
              <Server size={32} color="#475569" style={{ marginBottom: '8px' }} />
              <p style={{ color: '#64748B', fontSize: '13px', margin: 0 }}>ยังไม่มี API endpoint</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {settings.apiEndpoints.map((endpoint, index) => (
                <div key={endpoint.id} style={{
                  padding: '14px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px',
                  border: endpoint.enabled ? '1px solid rgba(139, 92, 246, 0.2)' : '1px solid rgba(255,255,255,0.05)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <MapPin size={16} color={endpoint.enabled ? '#8B5CF6' : '#64748B'} />
                    <input
                      type="text" value={endpoint.name}
                      onChange={(e) => {
                        const updated = [...settings.apiEndpoints];
                        updated[index] = { ...endpoint, name: e.target.value };
                        updateSettings({ apiEndpoints: updated });
                      }}
                      style={{
                        flex: 1, background: 'transparent', border: 'none', color: '#F1F5F9',
                        fontSize: '14px', fontWeight: 500, outline: 'none',
                      }}
                      placeholder="ชื่อสถานที่"
                    />
                    <Toggle 
                      enabled={endpoint.enabled} 
                      onChange={() => {
                        const updated = [...settings.apiEndpoints];
                        updated[index] = { ...endpoint, enabled: !endpoint.enabled };
                        updateSettings({ apiEndpoints: updated });
                      }}
                      color="#8B5CF6"
                    />
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => updateSettings({ apiEndpoints: settings.apiEndpoints.filter((_, i) => i !== index) })}
                      style={{ background: 'transparent', border: 'none', padding: '4px', cursor: 'pointer', display: 'flex' }}
                    >
                      <Trash2 size={16} color="#EF4444" />
                    </motion.button>
                  </div>
                  <input
                    type="text" value={endpoint.url}
                    onChange={(e) => {
                      const updated = [...settings.apiEndpoints];
                      updated[index] = { ...endpoint, url: e.target.value };
                      updateSettings({ apiEndpoints: updated });
                    }}
                    placeholder="http://192.168.1.100/api/sensor"
                    style={{
                      width: '100%', padding: '10px 12px', background: 'rgba(0,0,0,0.2)',
                      border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px',
                      color: '#94A3B8', fontSize: '13px', outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Demo Mode */}
        <Card delay={0.25} highlight={settings.demoMode}>
          <SettingRow icon={Gamepad2} title="Demo Mode" subtitle="ใช้ข้อมูลจำลองสำหรับทดสอบ" color="#F59E0B">
            <Toggle enabled={settings.demoMode} onChange={() => updateSettings({ demoMode: !settings.demoMode })} color="#F59E0B" />
          </SettingRow>
          {settings.demoMode && (
            <p style={{ color: '#F59E0B', fontSize: '12px', margin: '12px 0 0 54px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              ⚠️ กำลังใช้ข้อมูลจำลอง
            </p>
          )}
        </Card>

        {/* Sensor Coordinates */}
        <Card delay={0.3}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ color: '#F1F5F9', fontSize: '14px', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={16} color="#10B981" /> พิกัด GPS เซ็นเซอร์
            </h3>
          </div>

          {/* Add new sensor manually */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <input
              type="text"
              value={newSensorId}
              onChange={(e) => setNewSensorId(e.target.value)}
              placeholder="เพิ่ม Sensor ID ใหม่..."
              style={{
                flex: 1, padding: '10px 12px', background: 'rgba(0,0,0,0.2)',
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px',
                color: '#F1F5F9', fontSize: '13px', outline: 'none',
              }}
              onKeyDown={(e) => e.key === 'Enter' && addNewSensor()}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={addNewSensor}
              style={{
                padding: '10px 16px', background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '8px',
                color: '#10B981', fontSize: '13px', fontWeight: 500, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}
            >
              <Plus size={16} /> เพิ่ม
            </motion.button>
          </div>
          
          {allSensorIds.length === 0 ? (
            <div style={{ 
              padding: '24px', 
              textAlign: 'center', 
              background: 'rgba(255,255,255,0.02)', 
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Activity size={32} color="#475569" style={{ marginBottom: '8px' }} />
              <p style={{ color: '#64748B', fontSize: '13px', margin: 0 }}>ยังไม่มีเซ็นเซอร์ในระบบ</p>
              <p style={{ color: '#475569', fontSize: '12px', margin: '4px 0 0' }}>เพิ่ม Sensor ID ด้านบน หรือเปิด Demo Mode</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {allSensorIds.map((sensor) => {
                const coords = getSensorCoords(sensor.coordKey);
                const isEditing = editingSensorId === sensor.coordKey;
                
                return (
                  <div key={sensor.coordKey} style={{
                    padding: '14px', 
                    background: 'rgba(255,255,255,0.02)', 
                    borderRadius: '12px',
                    border: coords ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(255,255,255,0.05)',
                  }}>
                    {/* Sensor Header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: coords || isEditing ? '10px' : '0' }}>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '10px',
                        background: coords ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.05)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <MapPin size={18} color={coords ? '#10B981' : '#64748B'} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <p style={{ color: '#F1F5F9', fontSize: '14px', fontWeight: 500, margin: 0 }}>{sensor.location}</p>
                          {sensor.isOnline ? (
                            <span style={{ fontSize: '10px', color: '#10B981', background: 'rgba(16,185,129,0.15)', padding: '2px 6px', borderRadius: '4px' }}>Online</span>
                          ) : (
                            <span style={{ fontSize: '10px', color: '#64748B', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px' }}>Offline</span>
                          )}
                        </div>
                        <p style={{ color: '#64748B', fontSize: '11px', margin: '2px 0 0' }}>Key: {sensor.coordKey}</p>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setEditingSensorId(isEditing ? null : sensor.coordKey)}
                        style={{
                          padding: '6px 12px',
                          background: isEditing ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.05)',
                          border: `1px solid ${isEditing ? 'rgba(59, 130, 246, 0.4)' : 'rgba(255,255,255,0.1)'}`,
                          borderRadius: '8px',
                          color: isEditing ? '#60A5FA' : '#94A3B8',
                          fontSize: '12px',
                          cursor: 'pointer',
                        }}
                      >
                        {isEditing ? 'ปิด' : coords ? 'แก้ไข' : 'ตั้งค่า'}
                      </motion.button>
                      {!sensor.isOnline && coords && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => deleteSensorCoords(sensor.coordKey)}
                          style={{ background: 'transparent', border: 'none', padding: '4px', cursor: 'pointer', display: 'flex' }}
                        >
                          <Trash2 size={16} color="#EF4444" />
                        </motion.button>
                      )}
                    </div>

                    {/* Current Coordinates Display */}
                    {coords && !isEditing && (
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px',
                        padding: '8px 12px',
                        background: 'rgba(16, 185, 129, 0.1)',
                        borderRadius: '8px',
                      }}>
                        <Navigation size={14} color="#10B981" />
                        <span style={{ color: '#10B981', fontSize: '12px', fontFamily: 'monospace' }}>
                          {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
                        </span>
                        {coords.address && (
                          <span style={{ color: '#64748B', fontSize: '11px', marginLeft: 'auto' }}>
                            {coords.address}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Edit Form */}
                    <AnimatePresence>
                      {isEditing && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          style={{ overflow: 'hidden' }}
                        >
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {/* Quick Paste: lat,lng in one line */}
                            <div>
                              <label style={{ color: '#64748B', fontSize: '11px', display: 'block', marginBottom: '4px' }}>วางพิกัด (lat,lng)</label>
                              <input
                                type="text"
                                placeholder="เช่น 13.756331,100.501762"
                                onPaste={(e) => {
                                  const text = e.clipboardData.getData('text');
                                  const parts = text.split(',').map(s => s.trim());
                                  if (parts.length >= 2) {
                                    const lat = parseFloat(parts[0]);
                                    const lng = parseFloat(parts[1]);
                                    if (!isNaN(lat) && !isNaN(lng)) {
                                      e.preventDefault();
                                      updateSensorCoords(sensor.coordKey, lat, lng, coords?.address);
                                    }
                                  }
                                }}
                                onChange={(e) => {
                                  const text = e.target.value;
                                  const parts = text.split(',').map(s => s.trim());
                                  if (parts.length >= 2) {
                                    const lat = parseFloat(parts[0]);
                                    const lng = parseFloat(parts[1]);
                                    if (!isNaN(lat) && !isNaN(lng)) {
                                      updateSensorCoords(sensor.coordKey, lat, lng, coords?.address);
                                      e.target.value = '';
                                    }
                                  }
                                }}
                                style={{
                                  width: '100%', padding: '10px 12px', background: 'rgba(16, 185, 129, 0.1)',
                                  border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '8px',
                                  color: '#10B981', fontSize: '13px', outline: 'none', boxSizing: 'border-box',
                                }}
                              />
                            </div>

                            {/* Lat/Lng Inputs */}
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <div style={{ flex: 1 }}>
                                <label style={{ color: '#64748B', fontSize: '11px', display: 'block', marginBottom: '4px' }}>Latitude</label>
                                <input
                                  type="number"
                                  step="0.000001"
                                  value={coords?.lat || ''}
                                  onChange={(e) => {
                                    const lat = parseFloat(e.target.value) || 0;
                                    updateSensorCoords(sensor.coordKey, lat, coords?.lng || 0, coords?.address);
                                  }}
                                  placeholder="13.756331"
                                  style={{
                                    width: '100%', padding: '10px 12px', background: 'rgba(0,0,0,0.2)',
                                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px',
                                    color: '#F1F5F9', fontSize: '13px', outline: 'none', boxSizing: 'border-box',
                                  }}
                                />
                              </div>
                              <div style={{ flex: 1 }}>
                                <label style={{ color: '#64748B', fontSize: '11px', display: 'block', marginBottom: '4px' }}>Longitude</label>
                                <input
                                  type="number"
                                  step="0.000001"
                                  value={coords?.lng || ''}
                                  onChange={(e) => {
                                    const lng = parseFloat(e.target.value) || 0;
                                    updateSensorCoords(sensor.coordKey, coords?.lat || 0, lng, coords?.address);
                                  }}
                                  placeholder="100.501762"
                                  style={{
                                    width: '100%', padding: '10px 12px', background: 'rgba(0,0,0,0.2)',
                                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px',
                                    color: '#F1F5F9', fontSize: '13px', outline: 'none', boxSizing: 'border-box',
                                  }}
                                />
                              </div>
                            </div>

                            {/* Address Input */}
                            <div>
                              <label style={{ color: '#64748B', fontSize: '11px', display: 'block', marginBottom: '4px' }}>ที่อยู่ (ไม่บังคับ)</label>
                              <input
                                type="text"
                                value={coords?.address || ''}
                                onChange={(e) => {
                                  updateSensorCoords(sensor.coordKey, coords?.lat || 0, coords?.lng || 0, e.target.value);
                                }}
                                placeholder="เช่น อาคาร A ชั้น 1"
                                style={{
                                  width: '100%', padding: '10px 12px', background: 'rgba(0,0,0,0.2)',
                                  border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px',
                                  color: '#F1F5F9', fontSize: '13px', outline: 'none', boxSizing: 'border-box',
                                }}
                              />
                            </div>

                            {/* Get Current Location Button */}
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => getCurrentLocation(sensor.coordKey)}
                              style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                padding: '10px', background: 'rgba(59, 130, 246, 0.15)',
                                border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '8px',
                                color: '#60A5FA', fontSize: '13px', fontWeight: 500, cursor: 'pointer',
                              }}
                            >
                              <Navigation size={16} />
                              ใช้ตำแหน่งปัจจุบัน
                            </motion.button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Dashboard Layout */}
        <Card delay={0.35}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h3 style={{ color: '#F1F5F9', fontSize: '14px', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layout size={16} color="#6366F1" /> จัดเรียง Layout หน้าหลัก
            </h3>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                updateSettings({
                  dashboardLayout: { positions: defaultPositions }
                });
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                background: 'rgba(99, 102, 241, 0.1)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                borderRadius: '8px',
                color: '#818CF8',
                fontSize: '12px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              <RotateCcw size={14} />
              รีเซ็ต
            </motion.button>
          </div>
          <p style={{ color: '#64748B', fontSize: '12px', margin: '0 0 16px' }}>
            ลาก component ไปวางแทนที่ตำแหน่งอื่นเพื่อสลับตำแหน่ง
          </p>
          
          {/* Visual Layout Grid */}
          <div style={{
            background: 'rgba(0,0,0,0.3)',
            borderRadius: '16px',
            padding: '12px',
            border: '1px solid rgba(255,255,255,0.05)',
          }}>
            {/* Layout Grid - เหมือนหน้าจริง */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {/* Top Row - Full Width */}
              <LayoutSlot
                position="top"
                componentId={settings.dashboardLayout?.positions?.top || defaultPositions.top}
                settings={settings}
                updateSettings={updateSettings}
              />
              
              {/* Middle Row - 2 Columns */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <LayoutSlot
                  position="middleLeft"
                  componentId={settings.dashboardLayout?.positions?.middleLeft || defaultPositions.middleLeft}
                  settings={settings}
                  updateSettings={updateSettings}
                />
                <LayoutSlot
                  position="middleRight"
                  componentId={settings.dashboardLayout?.positions?.middleRight || defaultPositions.middleRight}
                  settings={settings}
                  updateSettings={updateSettings}
                />
              </div>
              
              {/* Bottom Row - Full Width */}
              <LayoutSlot
                position="bottom"
                componentId={settings.dashboardLayout?.positions?.bottom || defaultPositions.bottom}
                settings={settings}
                updateSettings={updateSettings}
              />
            </div>
          </div>
        </Card>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{ display: 'flex', gap: '10px', marginTop: '8px' }}
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={resetSettings}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              padding: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '12px', color: '#94A3B8', fontSize: '14px', fontWeight: 500, cursor: 'pointer',
            }}
          >
            <RotateCcw size={18} /> รีเซ็ต
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowClearConfirm(true)}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              padding: '14px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '12px', color: '#EF4444', fontSize: '14px', fontWeight: 500, cursor: 'pointer',
            }}
          >
            <Trash size={18} /> ล้างประวัติ
          </motion.button>
        </motion.div>

        {/* Clear History Confirmation Modal */}
        <AnimatePresence>
          {showClearConfirm && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
              onClick={() => setShowClearConfirm(false)}>
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }} 
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: 'spring', duration: 0.3 }}
                onClick={e => e.stopPropagation()}
                style={{ background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)', borderRadius: 20, padding: 28, maxWidth: 360, width: '90%', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
                
                {/* Icon */}
                <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <Trash size={28} color="#EF4444" />
                </div>
                
                <h3 style={{ color: '#F8FAFC', fontSize: 18, fontWeight: 600, margin: '0 0 8px', textAlign: 'center' }}>ล้างประวัติทั้งหมด?</h3>
                <p style={{ color: '#94A3B8', fontSize: 14, margin: '0 0 24px', textAlign: 'center', lineHeight: 1.5 }}>ข้อมูลประวัติ Sensor ทั้งหมดจะถูกลบ<br/>และไม่สามารถกู้คืนได้</p>
                
                <div style={{ display: 'flex', gap: 12 }}>
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowClearConfirm(false)}
                    style={{ flex: 1, padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#E2E8F0', cursor: 'pointer', fontSize: 14, fontWeight: 500 }}>
                    ยกเลิก
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleClearHistory}
                    style={{ flex: 1, padding: '12px 16px', background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)', border: 'none', borderRadius: 12, color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 500, boxShadow: '0 4px 12px rgba(239,68,68,0.3)' }}>
                    ล้างประวัติ
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
