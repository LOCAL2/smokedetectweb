import { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, RotateCcw, AlertTriangle, Clock, Bell, Volume2,
  Plus, Trash2, Server, MapPin, Gamepad2, Trash, Navigation, Activity,
  Layout, GripVertical, BarChart3, Pin, TrendingUp, ChevronDown, Check,
} from 'lucide-react';
import type { ApiEndpoint, SensorCoordinates, DashboardComponent, LayoutPosition, SettingsConfig, SensorGroup } from '../hooks/useSettings';
import { useSettingsContext } from '../context/SettingsContext';
import { useSensorDataContext } from '../context/SensorDataContext';
import { useTheme } from '../context/ThemeContext';


const ZoneDropdown = ({ 
  value, 
  groups, 
  onChange 
}: { 
  value: string; 
  groups: SensorGroup[]; 
  onChange: (val: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { isDark } = useTheme();
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const selectedGroup = groups.find(g => g.id === value);
  
  
  const handleClickOutside = (e: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
      setIsOpen(false);
    }
  };
  
  useState(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  });

  const bgColor = isDark ? '#1E293B' : '#FFFFFF';
  const borderColor = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)';
  const textColor = isDark ? '#F8FAFC' : '#0F172A';
  const textSecondary = isDark ? '#94A3B8' : '#64748B';
  const hoverBg = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 8px',
          background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
          border: `1px solid ${borderColor}`,
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '11px',
          color: selectedGroup ? textColor : textSecondary,
          minWidth: '80px',
        }}
      >
        {selectedGroup && (
          <span style={{ 
            width: '8px', 
            height: '8px', 
            borderRadius: '50%', 
            background: selectedGroup.color,
            flexShrink: 0,
          }} />
        )}
        <span style={{ flex: 1, textAlign: 'left' }}>
          {selectedGroup?.name || 'ไม่มีโซน'}
        </span>
        <ChevronDown size={12} style={{ 
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s',
        }} />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              marginTop: '4px',
              background: bgColor,
              border: `1px solid ${borderColor}`,
              borderRadius: '8px',
              boxShadow: isDark 
                ? '0 10px 40px rgba(0,0,0,0.5)' 
                : '0 10px 40px rgba(0,0,0,0.15)',
              zIndex: 100,
              minWidth: '120px',
              overflow: 'hidden',
            }}
          >
            {}
            <div
              onClick={() => { onChange(''); setIsOpen(false); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                cursor: 'pointer',
                background: !value ? hoverBg : 'transparent',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = hoverBg}
              onMouseLeave={(e) => e.currentTarget.style.background = !value ? hoverBg : 'transparent'}
            >
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: textSecondary, opacity: 0.3 }} />
              <span style={{ flex: 1, fontSize: '12px', color: textSecondary }}>ไม่มีโซน</span>
              {!value && <Check size={12} color="#10B981" />}
            </div>
            
            {}
            {groups.map(group => (
              <div
                key={group.id}
                onClick={() => { onChange(group.id); setIsOpen(false); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  cursor: 'pointer',
                  background: value === group.id ? hoverBg : 'transparent',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = hoverBg}
                onMouseLeave={(e) => e.currentTarget.style.background = value === group.id ? hoverBg : 'transparent'}
              >
                <span style={{ 
                  width: '8px', 
                  height: '8px', 
                  borderRadius: '50%', 
                  background: group.color,
                }} />
                <span style={{ flex: 1, fontSize: '12px', color: textColor }}>{group.name}</span>
                {value === group.id && <Check size={12} color="#10B981" />}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


const dashboardComponents: Record<DashboardComponent, { name: string; icon: React.ElementType; color: string }> = {
  statusCards: { name: 'สถิติ', icon: Activity, color: '#3B82F6' },
  chart: { name: 'กราฟ', icon: BarChart3, color: '#8B5CF6' },
  ranking: { name: 'อันดับค่าสูงสุด 24 ชั่วโมง', icon: Activity, color: '#F59E0B' },
  pinnedSensors: { name: 'เซ็นเซอร์ที่ปักหมุด', icon: Pin, color: '#10B981' },
  miniMap: { name: 'แผนที่ Sensor', icon: MapPin, color: '#06B6D4' },
  comparisonChart: { name: 'กราฟเปรียบเทียบ', icon: BarChart3, color: '#EC4899' },
  statusHistory: { name: 'ประวัติสถานะ', icon: Clock, color: '#8B5CF6' },
  trendAnalysis: { name: 'วิเคราะห์แนวโน้ม', icon: TrendingUp, color: '#14B8A6' },
};

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
  const { isDark } = useTheme();

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
                background: rank === 1 ? 'rgba(245,158,11,0.3)' : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'),
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
      case 'miniMap':
        return (
          <div style={{
            height: '40px',
            marginTop: '8px',
            background: 'linear-gradient(135deg, rgba(6,182,212,0.2) 0%, rgba(6,182,212,0.1) 100%)',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <MapPin size={16} color="#06B6D4" />
          </div>
        );
      case 'comparisonChart':
        return (
          <div style={{
            height: '40px',
            marginTop: '8px',
            display: 'flex',
            alignItems: 'flex-end',
            gap: '4px',
            justifyContent: 'center',
          }}>
            {[40, 70, 55].map((h, i) => (
              <div key={i} style={{
                width: '20px',
                height: `${h}%`,
                background: 'linear-gradient(180deg, #EC4899 0%, #DB2777 100%)',
                borderRadius: '3px',
              }} />
            ))}
          </div>
        );
      case 'statusHistory':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '8px' }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{
                height: '8px',
                background: i === 1 ? 'rgba(16,185,129,0.3)' : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'),
                borderRadius: '2px',
              }} />
            ))}
          </div>
        );
      case 'trendAnalysis':
        return (
          <div style={{
            height: '40px',
            marginTop: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
          }}>
            <div style={{
              width: '60%',
              height: '2px',
              background: 'linear-gradient(90deg, #14B8A6 0%, #14B8A6 50%, transparent 50%)',
              backgroundSize: '8px 2px',
              borderRadius: '1px',
            }} />
            <TrendingUp size={14} color="#14B8A6" />
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
            : (isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'),
        borderRadius: '10px',
        padding: '10px',
        border: isDragOver
          ? '2px dashed #6366F1'
          : `1px solid ${component ? `${component.color}40` : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)')}`,
        cursor: componentId ? 'grab' : 'default',
        minHeight: (position === 'top' || position === 'bottom') ? '60px' : (position.startsWith('bottom') ? '70px' : '70px'),
        transition: 'border-color 0.1s, background 0.1s',
      }}
    >
      {component ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <GripVertical size={14} color={isDark ? "#64748B" : "#94A3B8"} />
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
          <span style={{ color: isDark ? '#E2E8F0' : '#1E293B', fontSize: '11px', fontWeight: 600 }}>
            {component.name}
          </span>
        </div>
      ) : (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: isDark ? '#64748B' : '#94A3B8',
          fontSize: '11px',
        }}>
          ว่าง
        </div>
      )}
      {renderPreview()}
    </div>
  );
};


const Card = ({ children, delay = 0, highlight = false }: { children: React.ReactNode; delay?: number; highlight?: boolean }) => {
  const { isDark } = useTheme();
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      style={{
        background: highlight
          ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(245, 158, 11, 0.02) 100%)'
          : (isDark ? 'rgba(30, 41, 59, 0.5)' : 'rgba(255, 255, 255, 0.7)'),
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        border: highlight
          ? '1px solid rgba(245, 158, 11, 0.2)'
          : (isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid rgba(255, 255, 255, 0.5)'),
        padding: '20px',
        marginBottom: '12px',
        boxShadow: isDark ? 'none' : '0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02)',
      }}
    >
      {children}
    </motion.section>
  );
};

const Toggle = ({ enabled, onChange, color = '#6366F1' }: { enabled: boolean; onChange: () => void; color?: string }) => {
  const { isDark } = useTheme();
  return (
    <div onClick={onChange} style={{
      width: '48px', height: '26px', borderRadius: '13px', cursor: 'pointer', transition: 'all 0.2s',
      background: enabled ? color : (isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'), position: 'relative', flexShrink: 0,
    }}>
      <div style={{
        width: '22px', height: '22px', borderRadius: '11px', background: '#FFF',
        position: 'absolute', top: '2px', left: enabled ? '24px' : '2px', transition: 'left 0.2s',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
      }} />
    </div>
  );
};

const SettingRow = ({ icon: Icon, title, subtitle, color, children }: {
  icon: React.ElementType; title: string; subtitle?: string; color: string; children: React.ReactNode;
}) => {
  const { isDark } = useTheme();
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '4px 0' }}>
      <div style={{
        width: '40px', height: '40px', borderRadius: '12px', flexShrink: 0,
        background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={20} color={color} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ color: isDark ? '#F1F5F9' : '#1E293B', fontSize: '14px', fontWeight: 500, margin: 0 }}>{title}</p>
        {subtitle && <p style={{ color: isDark ? '#64748B' : '#94A3B8', fontSize: '12px', margin: '2px 0 0' }}>{subtitle}</p>}
      </div>
      {children}
    </div>
  );
};

export const SettingsPage = () => {
  const navigate = useNavigate();
  const { settings, updateSettings, resetSettings } = useSettingsContext();
  const { sensors } = useSensorDataContext();
  const { isDark } = useTheme();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [editingSensorId, setEditingSensorId] = useState<string | null>(null);
  const [newSensorId, setNewSensorId] = useState('');

  const handleThresholdChange = (type: 'warning' | 'danger', value: number) => {
    if (type === 'warning') {
      updateSettings({ warningThreshold: value });
    } else {
      updateSettings({ dangerThreshold: value });
    }
  };

  
  const handleNotificationToggle = async () => {
    if (!settings.enableNotification) {
      
      if ('Notification' in window) {
        if (Notification.permission === 'granted') {
          updateSettings({ enableNotification: true });
        } else if (Notification.permission !== 'denied') {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            updateSettings({ enableNotification: true });
          }
        } else {
          alert('การแจ้งเตือนถูกบล็อก กรุณาเปิดใช้งานในการตั้งค่าเบราว์เซอร์');
        }
      } else {
        alert('เบราว์เซอร์นี้ไม่รองรับการแจ้งเตือน');
      }
    } else {
      
      updateSettings({ enableNotification: false });
    }
  };

  const handleClearHistory = () => {
    localStorage.removeItem('smoke-sensor-history');
    localStorage.removeItem('smoke-sensor-max-values');
    localStorage.removeItem('smoke-sensor-individual-history');
    setShowClearConfirm(false);
    window.location.reload();
  };

  
  const getSensorCoords = (sensorId: string, location?: string): SensorCoordinates | undefined => {
    return (settings.sensorCoordinates || []).find(c =>
      c.sensorId === location || c.sensorId === sensorId
    );
  };

  
  
  
  
  const sensorLocationsKey = useMemo(() => {
    return sensors.map(s => s.location || s.id).sort().join(',');
  }, [sensors]);

  
  const prevSensorListRef = useRef<{ id: string; location: string; coordKey: string; isOnline: boolean }[]>([]);
  const prevKeyRef = useRef<string>('');

  const allSensorIds = useMemo(() => {
    const coordsKey = (settings.sensorCoordinates || []).map(c => c.sensorId).sort().join(',');
    const combinedKey = `${sensorLocationsKey}|${coordsKey}`;
    
    
    if (combinedKey === prevKeyRef.current) {
      return prevSensorListRef.current;
    }
    
    const sensorMap = new Map<string, { id: string; location: string; coordKey: string; isOnline: boolean }>();

    
    sensors.forEach(s => {
      const coordKey = s.location || s.id;
      sensorMap.set(coordKey, {
        id: s.id,
        location: s.location || s.name || s.id,
        coordKey,
        isOnline: true
      });
    });

    
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

    prevKeyRef.current = combinedKey;
    prevSensorListRef.current = Array.from(sensorMap.values());

    return prevSensorListRef.current;
  }, [sensors, sensorLocationsKey, settings.sensorCoordinates]);

  
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

  
  const deleteSensorCoords = (sensorId: string) => {
    const existing = settings.sensorCoordinates || [];
    updateSettings({ sensorCoordinates: existing.filter(c => c.sensorId !== sensorId) });
  };

  
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

  
  const pageBg = isDark ? '#0B0F1A' : '#F1F5F9';
  const textColor = isDark ? '#F8FAFC' : '#0F172A';
  const textSecondary = isDark ? '#64748B' : '#64748B';
  const buttonBg = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)';
  const buttonBorder = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
  const inputBg = isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.6)';
  const inputBorder = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
  const borderColor = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)';

  return (
    <div style={{
      minHeight: '100vh',
      background: pageBg,
      padding: 'clamp(16px, 4vw, 24px)',
      transition: 'background 0.3s ease',
    }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        {}
        <motion.header
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: 'flex', alignItems: 'center', gap: '16px',
            marginBottom: '24px', paddingBottom: '20px',
            borderBottom: `1px solid ${borderColor}`,
          }}
        >
          <button
            onClick={() => navigate('/')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: buttonBg,
              border: `1px solid ${buttonBorder}`,
              borderRadius: '10px',
              padding: '10px 16px',
              color: textSecondary,
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => e.currentTarget.style.background = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 1)'}
            onMouseOut={(e) => e.currentTarget.style.background = buttonBg}
          >
            <ArrowLeft size={18} />
            <span style={{ display: 'none' }}>กลับ</span>
          </button>
          <div>
            <h1 style={{ color: textColor, fontSize: 'clamp(18px, 4vw, 20px)', fontWeight: 600, margin: 0 }}>ตั้งค่า</h1>
            <p style={{ color: textSecondary, fontSize: '13px', margin: '2px 0 0' }}>บันทึกอัตโนมัติ</p>
          </div>
        </motion.header>

        {/* Threshold Settings */}
        <Card delay={0.05}>
          <h3 style={{ color: textColor, fontSize: '14px', fontWeight: 600, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={16} color="#F59E0B" /> ระดับค่าควัน (PPM)
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Warning Threshold */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '5px', background: '#F59E0B' }} />
                  <span style={{ color: textColor, fontSize: '14px', fontWeight: 500 }}>เฝ้าระวัง</span>
                </div>
                <div style={{
                  background: 'rgba(245, 158, 11, 0.15)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  borderRadius: '10px',
                  padding: '8px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}>
                  <input
                    type="number"
                    value={settings.warningThreshold}
                    onChange={(e) => handleThresholdChange('warning', Number(e.target.value) || 0)}
                    style={{
                      width: '60px',
                      background: 'transparent',
                      border: 'none',
                      color: '#F59E0B',
                      fontSize: '18px',
                      fontWeight: 700,
                      outline: 'none',
                      textAlign: 'right',
                    }}
                  />
                  <span style={{ color: '#F59E0B', fontSize: '13px', fontWeight: 600 }}>PPM</span>
                </div>
              </div>
              <input
                type="range"
                min="10"
                max="500"
                step="5"
                value={settings.warningThreshold}
                onChange={(e) => handleThresholdChange('warning', Number(e.target.value))}
                style={{
                  width: '100%',
                  height: '8px',
                  borderRadius: '4px',
                  background: `linear-gradient(to right, #F59E0B 0%, #F59E0B ${((settings.warningThreshold - 10) / 490) * 100}%, ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} ${((settings.warningThreshold - 10) / 490) * 100}%, ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} 100%)`,
                  outline: 'none',
                  cursor: 'pointer',
                  WebkitAppearance: 'none',
                  appearance: 'none',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                <span style={{ color: textSecondary, fontSize: '11px' }}>10 PPM</span>
                <span style={{ color: textSecondary, fontSize: '11px' }}>500 PPM</span>
              </div>
            </div>

            {/* Danger Threshold */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '5px', background: '#EF4444' }} />
                  <span style={{ color: textColor, fontSize: '14px', fontWeight: 500 }}>อันตราย</span>
                </div>
                <div style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '10px',
                  padding: '8px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}>
                  <input
                    type="number"
                    value={settings.dangerThreshold}
                    onChange={(e) => handleThresholdChange('danger', Number(e.target.value) || 0)}
                    style={{
                      width: '60px',
                      background: 'transparent',
                      border: 'none',
                      color: '#EF4444',
                      fontSize: '18px',
                      fontWeight: 700,
                      outline: 'none',
                      textAlign: 'right',
                    }}
                  />
                  <span style={{ color: '#EF4444', fontSize: '13px', fontWeight: 600 }}>PPM</span>
                </div>
              </div>
              <input
                type="range"
                min="50"
                max="1000"
                step="10"
                value={settings.dangerThreshold}
                onChange={(e) => handleThresholdChange('danger', Number(e.target.value))}
                style={{
                  width: '100%',
                  height: '8px',
                  borderRadius: '4px',
                  background: `linear-gradient(to right, #EF4444 0%, #EF4444 ${((settings.dangerThreshold - 50) / 950) * 100}%, ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} ${((settings.dangerThreshold - 50) / 950) * 100}%, ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} 100%)`,
                  outline: 'none',
                  cursor: 'pointer',
                  WebkitAppearance: 'none',
                  appearance: 'none',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                <span style={{ color: textSecondary, fontSize: '11px' }}>50 PPM</span>
                <span style={{ color: textSecondary, fontSize: '11px' }}>1000 PPM</span>
              </div>
            </div>
          </div>

          <style>{`
            input[type="range"]::-webkit-slider-thumb {
              -webkit-appearance: none;
              appearance: none;
              width: 22px;
              height: 22px;
              border-radius: 50%;
              background: #FFF;
              cursor: pointer;
              border: 3px solid currentColor;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
            }
            input[type="range"]::-moz-range-thumb {
              width: 22px;
              height: 22px;
              border-radius: 50%;
              background: #FFF;
              cursor: pointer;
              border: 3px solid currentColor;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
            }
            input[type="number"]::-webkit-inner-spin-button,
            input[type="number"]::-webkit-outer-spin-button {
              -webkit-appearance: none;
              margin: 0;
            }
            input[type="number"] {
              -moz-appearance: textfield;
            }
          `}</style>
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
                background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${((settings.pollingInterval / 1000 - 0.5) / 29.5) * 100}%, ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} ${((settings.pollingInterval / 1000 - 0.5) / 29.5) * 100}%, ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} 100%)`,
                outline: 'none',
                cursor: 'pointer',
                WebkitAppearance: 'none',
                appearance: 'none',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
              <span style={{ color: textSecondary, fontSize: '11px' }}>0.5s</span>
              <span style={{ color: textSecondary, fontSize: '11px' }}>30s</span>
            </div>
          </div>
        </Card>
        <Card delay={0.15}>
          <h3 style={{ color: textColor, fontSize: '14px', fontWeight: 600, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell size={16} color="#10B981" /> การแจ้งเตือน
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <SettingRow icon={Volume2} title="เสียงแจ้งเตือน" color="#10B981">
              <Toggle enabled={settings.enableSoundAlert} onChange={() => updateSettings({ enableSoundAlert: !settings.enableSoundAlert })} color="#10B981" />
            </SettingRow>
            <SettingRow icon={Bell} title="Notification" color="#10B981">
              <Toggle enabled={settings.enableNotification} onChange={handleNotificationToggle} color="#10B981" />
            </SettingRow>
          </div>
        </Card>

        {}
        <Card delay={0.2}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ color: textColor, fontSize: '14px', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
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
            <div style={{ padding: '24px', textAlign: 'center', background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.03)', borderRadius: '12px' }}>
              <Server size={32} color="#475569" style={{ marginBottom: '8px' }} />
              <p style={{ color: textSecondary, fontSize: '13px', margin: 0 }}>ยังไม่มี API endpoint</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {settings.apiEndpoints.map((endpoint, index) => (
                <div key={endpoint.id} style={{
                  padding: '14px', background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.03)', borderRadius: '12px',
                  border: endpoint.enabled ? '1px solid rgba(139, 92, 246, 0.2)' : `1px solid ${inputBorder}`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <MapPin size={16} color={endpoint.enabled ? '#8B5CF6' : textSecondary} />
                    <input
                      type="text" value={endpoint.name}
                      onChange={(e) => {
                        const updated = [...settings.apiEndpoints];
                        updated[index] = { ...endpoint, name: e.target.value };
                        updateSettings({ apiEndpoints: updated });
                      }}
                      style={{
                        flex: 1, background: 'transparent', border: 'none', color: textColor,
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
                      width: '100%', padding: '10px 12px', background: inputBg,
                      border: `1px solid ${inputBorder}`, borderRadius: '8px',
                      color: textSecondary, fontSize: '13px', outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </Card>

        {}
        <Card delay={0.25} highlight={settings.demoMode}>
          <SettingRow icon={Gamepad2} title="Demo Mode" subtitle="ใช้ข้อมูลจำลองสำหรับทดสอบ" color="#F59E0B">
            <Toggle enabled={settings.demoMode} onChange={() => updateSettings({ demoMode: !settings.demoMode })} color="#F59E0B" />
          </SettingRow>
        </Card>

        {}
        <Card delay={0.26} highlight={settings.mqtt.enabled}>
          <SettingRow icon={Activity} title="MQTT Real-time" subtitle="เชื่อมต่อ MQTT Broker สำหรับข้อมูล Real-time" color="#10B981">
            <Toggle 
              enabled={settings.mqtt.enabled} 
              onChange={() => updateSettings({ mqtt: { ...settings.mqtt, enabled: !settings.mqtt.enabled } })} 
              color="#10B981" 
            />
          </SettingRow>
          
          {settings.mqtt.enabled && (
            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: `1px solid ${borderColor}` }}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', color: textSecondary, fontSize: '12px', marginBottom: '6px' }}>
                  MQTT Broker URL
                </label>
                <input
                  type="text"
                  value={settings.mqtt.broker}
                  onChange={(e) => updateSettings({ mqtt: { ...settings.mqtt, broker: e.target.value } })}
                  placeholder="wss://broker.hivemq.com:8884/mqtt"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                    border: `1px solid ${borderColor}`,
                    borderRadius: '8px',
                    color: textColor,
                    fontSize: '13px',
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', color: textSecondary, fontSize: '12px', marginBottom: '6px' }}>
                  MQTT Topics (คั่นด้วยเครื่องหมายจุลภาค)
                </label>
                <input
                  type="text"
                  value={settings.mqtt.topics.join(', ')}
                  onChange={(e) => {
                    const topics = e.target.value.split(',').map(t => t.trim()).filter(t => t);
                    updateSettings({ mqtt: { ...settings.mqtt, topics } });
                  }}
                  placeholder="mq2/sensor001/data, mq2/sensor002/data"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                    border: `1px solid ${borderColor}`,
                    borderRadius: '8px',
                    color: textColor,
                    fontSize: '13px',
                  }}
                />
              </div>
            </div>
          )}
        </Card>

        {}
        <Card delay={0.28}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h3 style={{ color: textColor, fontSize: '14px', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layout size={16} color="#EC4899" /> จัดการโซน (Sensor Groups)
            </h3>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6', '#06B6D4', '#EF4444'];
                const newGroup = {
                  id: `group-${Date.now()}`,
                  name: `โซน ${settings.sensorGroups.length + 1}`,
                  color: colors[settings.sensorGroups.length % colors.length]
                };
                updateSettings({ sensorGroups: [...settings.sensorGroups, newGroup] });
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '6px 12px', background: 'rgba(236, 72, 153, 0.1)',
                border: '1px solid rgba(236, 72, 153, 0.3)', borderRadius: '8px',
                color: '#EC4899', fontSize: '12px', fontWeight: 500, cursor: 'pointer',
              }}
            >
              <Plus size={14} /> สร้างโซน
            </motion.button>
          </div>
          <p style={{ color: textSecondary, fontSize: '12px', margin: '0 0 16px' }}>
            จัดกลุ่ม Sensor ตามโซนเพื่อกรองดูข้อมูลแยกตามพื้นที่
          </p>

          {}
          <div style={{
            background: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.05)',
            borderRadius: '16px',
            padding: '12px',
            border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)',
          }}>
            {settings.sensorGroups.length === 0 ? (
              <div style={{
                padding: '24px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Layout size={32} color="#64748B" style={{ marginBottom: '8px', opacity: 0.5 }} />
                <p style={{ color: textSecondary, fontSize: '13px', margin: 0 }}>ยังไม่มีโซน</p>
                <p style={{ color: '#64748B', fontSize: '12px', margin: '4px 0 0' }}>กดปุ่ม "สร้างโซน" เพื่อเริ่มจัดกลุ่ม</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {settings.sensorGroups.map((group, index) => {
                  
                  const sensorCount = Object.values(settings.sensorAssignments).filter(gId => gId === group.id).length;
                  
                  return (
                    <motion.div
                      key={group.id}
                      data-zone-id={group.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      style={{
                        padding: '12px',
                        background: isDark ? 'rgba(255,255,255,0.03)' : '#FFFFFF',
                        borderRadius: '12px',
                        border: `1px solid ${group.color}30`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                      }}
                    >
                      {}
                      <div style={{ color: textSecondary, cursor: 'grab', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <div style={{ display: 'flex', gap: '2px' }}>
                          <div style={{ width: '3px', height: '3px', borderRadius: '50%', background: textSecondary }} />
                          <div style={{ width: '3px', height: '3px', borderRadius: '50%', background: textSecondary }} />
                        </div>
                        <div style={{ display: 'flex', gap: '2px' }}>
                          <div style={{ width: '3px', height: '3px', borderRadius: '50%', background: textSecondary }} />
                          <div style={{ width: '3px', height: '3px', borderRadius: '50%', background: textSecondary }} />
                        </div>
                        <div style={{ display: 'flex', gap: '2px' }}>
                          <div style={{ width: '3px', height: '3px', borderRadius: '50%', background: textSecondary }} />
                          <div style={{ width: '3px', height: '3px', borderRadius: '50%', background: textSecondary }} />
                        </div>
                      </div>

                      {}
                      <div 
                        data-color-badge
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '10px',
                          background: `${group.color}20`,
                          border: `1px solid ${group.color}40`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          position: 'relative',
                        }}>
                        <Activity size={18} color={group.color} />
                        {}
                        <input
                          type="color"
                          defaultValue={group.color}
                          onBlur={(e) => {
                            if (e.target.value !== group.color) {
                              const updated = [...settings.sensorGroups];
                              updated[index] = { ...group, color: e.target.value };
                              updateSettings({ sensorGroups: updated });
                            }
                          }}
                          onInput={(e) => {
                            const target = e.target as HTMLInputElement;
                            const color = target.value;
                            const zoneCard = target.closest('[data-zone-id]');
                            if (zoneCard) {
                              
                              (zoneCard as HTMLElement).style.borderColor = `${color}30`;
                              
                              const badge = zoneCard.querySelector('[data-color-badge]') as HTMLElement;
                              if (badge) {
                                badge.style.background = `${color}20`;
                                badge.style.borderColor = `${color}40`;
                                
                                const icon = badge.querySelector('svg');
                                if (icon) {
                                  icon.style.stroke = color;
                                  icon.style.color = color;
                                }
                              }
                              
                              const bars = zoneCard.querySelectorAll('[data-preview-bar]');
                              bars.forEach((bar, i) => {
                                (bar as HTMLElement).style.background = i === 3 ? color : `${color}80`;
                              });
                            }
                          }}
                          style={{
                            position: 'absolute',
                            inset: 0,
                            opacity: 0,
                            cursor: 'pointer',
                            width: '100%',
                            height: '100%',
                          }}
                          title="เปลี่ยนสี"
                        />
                      </div>

                      {}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <input
                            type="text"
                            value={group.name}
                            onChange={(e) => {
                              const updated = [...settings.sensorGroups];
                              updated[index] = { ...group, name: e.target.value };
                              updateSettings({ sensorGroups: updated });
                            }}
                            style={{
                              flex: 1,
                              background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                              border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                              borderRadius: '6px',
                              color: textColor,
                              fontSize: '14px',
                              fontWeight: 600,
                              outline: 'none',
                              padding: '6px 10px',
                            }}
                            placeholder="ชื่อโซน"
                          />
                        </div>
                        <p style={{ color: textSecondary, fontSize: '11px', margin: '4px 0 0' }}>
                          {sensorCount > 0 ? `${sensorCount} เซ็นเซอร์` : 'ยังไม่มีเซ็นเซอร์'}
                        </p>
                      </div>

                      {}
                      <div style={{
                        display: 'flex',
                        alignItems: 'flex-end',
                        gap: '3px',
                        height: '24px',
                        padding: '0 8px',
                      }}>
                        {[40, 70, 55, 85].map((h, i) => (
                          <div 
                            key={i} 
                            data-preview-bar
                            style={{
                              width: '6px',
                              height: `${h}%`,
                              background: i === 3 ? group.color : `${group.color}80`,
                              borderRadius: '2px',
                            }} 
                          />
                        ))}
                      </div>

                      {}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          const newAssignments = { ...settings.sensorAssignments };
                          Object.keys(newAssignments).forEach(key => {
                            if (newAssignments[key] === group.id) delete newAssignments[key];
                          });
                          updateSettings({
                            sensorGroups: settings.sensorGroups.filter(g => g.id !== group.id),
                            sensorAssignments: newAssignments
                          });
                        }}
                        style={{
                          background: 'rgba(239,68,68,0.1)',
                          border: '1px solid rgba(239,68,68,0.2)',
                          borderRadius: '8px',
                          padding: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                        }}
                      >
                        <Trash2 size={14} color="#EF4444" />
                      </motion.button>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {}
          {settings.sensorGroups.length > 0 && (
            <p style={{ color: '#64748B', fontSize: '11px', margin: '12px 0 0', textAlign: 'center' }}>
              💡 กำหนดโซนให้ Sensor ได้ที่ส่วน "พิกัด GPS เซ็นเซอร์" ด้านล่าง
            </p>
          )}
        </Card>

        {}
        <Card delay={0.3}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ color: textColor, fontSize: '14px', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={16} color="#10B981" /> พิกัด GPS เซ็นเซอร์
            </h3>
          </div>

          {}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <input
              type="text"
              value={newSensorId}
              onChange={(e) => setNewSensorId(e.target.value)}
              placeholder="เพิ่ม Sensor ID ใหม่..."
              style={{
                flex: 1, padding: '10px 12px', background: inputBg,
                border: `1px solid ${inputBorder}`, borderRadius: '8px',
                color: textColor, fontSize: '13px', outline: 'none',
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
              background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.03)',
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Activity size={32} color="#475569" style={{ marginBottom: '8px' }} />
              <p style={{ color: textSecondary, fontSize: '13px', margin: 0 }}>ยังไม่มีเซ็นเซอร์ในระบบ</p>
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
                    background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.03)',
                    borderRadius: '12px',
                    border: coords ? '1px solid rgba(16, 185, 129, 0.2)' : `1px solid ${inputBorder}`,
                  }}>
                    {}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: coords || isEditing ? '10px' : '0' }}>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '10px',
                        background: coords ? 'rgba(16, 185, 129, 0.15)' : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'),
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <MapPin size={18} color={coords ? '#10B981' : textSecondary} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <p style={{ color: textColor, fontSize: '14px', fontWeight: 500, margin: 0 }}>{sensor.location}</p>
                          {sensor.isOnline ? (
                            <span style={{ fontSize: '10px', color: '#10B981', background: 'rgba(16,185,129,0.15)', padding: '2px 6px', borderRadius: '4px' }}>Online</span>
                          ) : (
                            <span style={{ fontSize: '10px', color: textSecondary, background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', padding: '2px 6px', borderRadius: '4px' }}>Offline</span>
                          )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                          <p style={{ color: '#64748B', fontSize: '11px', margin: 0 }}>Key: {sensor.coordKey}</p>

                          {}
                          <ZoneDropdown
                            value={settings.sensorAssignments[sensor.id] || ''}
                            groups={settings.sensorGroups}
                            onChange={(val) => {
                              const newAssignments = { ...settings.sensorAssignments };
                              if (val) {
                                newAssignments[sensor.id] = val;
                              } else {
                                delete newAssignments[sensor.id];
                              }
                              updateSettings({ sensorAssignments: newAssignments });
                            }}
                          />
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setEditingSensorId(isEditing ? null : sensor.coordKey)}
                        style={{
                          padding: '6px 12px',
                          background: isEditing ? 'rgba(59, 130, 246, 0.2)' : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'),
                          border: `1px solid ${isEditing ? 'rgba(59, 130, 246, 0.4)' : (isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)')}`,
                          borderRadius: '8px',
                          color: isEditing ? '#60A5FA' : (isDark ? '#E2E8F0' : '#475569'),
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

                    {}
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
                          <span style={{ color: textSecondary, fontSize: '11px', marginLeft: 'auto' }}>
                            {coords.address}
                          </span>
                        )}
                      </div>
                    )}

                    {}
                    <AnimatePresence>
                      {isEditing && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          style={{ overflow: 'hidden' }}
                        >
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {}
                            <div>
                              <label style={{ color: textSecondary, fontSize: '11px', display: 'block', marginBottom: '4px' }}>วางพิกัด (lat,lng)</label>
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

                            {}
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <div style={{ flex: 1 }}>
                                <label style={{ color: textSecondary, fontSize: '11px', display: 'block', marginBottom: '4px' }}>Latitude</label>
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
                                    width: '100%', padding: '10px 12px', background: inputBg,
                                    border: `1px solid ${inputBorder}`, borderRadius: '8px',
                                    color: textColor, fontSize: '13px', outline: 'none', boxSizing: 'border-box',
                                  }}
                                />
                              </div>
                              <div style={{ flex: 1 }}>
                                <label style={{ color: textSecondary, fontSize: '11px', display: 'block', marginBottom: '4px' }}>Longitude</label>
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
                                    width: '100%', padding: '10px 12px', background: inputBg,
                                    border: `1px solid ${inputBorder}`, borderRadius: '8px',
                                    color: textColor, fontSize: '13px', outline: 'none', boxSizing: 'border-box',
                                  }}
                                />
                              </div>
                            </div>

                            {}
                            <div>
                              <label style={{ color: textSecondary, fontSize: '11px', display: 'block', marginBottom: '4px' }}>ที่อยู่ (ไม่บังคับ)</label>
                              <input
                                type="text"
                                value={coords?.address || ''}
                                onChange={(e) => {
                                  updateSensorCoords(sensor.coordKey, coords?.lat || 0, coords?.lng || 0, e.target.value);
                                }}
                                placeholder="เช่น อาคาร A ชั้น 1"
                                style={{
                                  width: '100%', padding: '10px 12px', background: inputBg,
                                  border: `1px solid ${inputBorder}`, borderRadius: '8px',
                                  color: textColor, fontSize: '13px', outline: 'none', boxSizing: 'border-box',
                                }}
                              />
                            </div>

                            {}
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

        {}
        <Card delay={0.35}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h3 style={{ color: textColor, fontSize: '14px', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
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
          <p style={{ color: textSecondary, fontSize: '12px', margin: '0 0 16px' }}>
            ลาก component ไปวางแทนที่ตำแหน่งอื่นเพื่อสลับตำแหน่ง
          </p>

          {}
          <div style={{
            background: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.05)',
            borderRadius: '16px',
            padding: '12px',
            border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)',
          }}>
            {}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {}
              <LayoutSlot
                position="top"
                componentId={settings.dashboardLayout?.positions?.top || defaultPositions.top}
                settings={settings}
                updateSettings={updateSettings}
              />

              {}
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

              {}
              <LayoutSlot
                position="bottom"
                componentId={settings.dashboardLayout?.positions?.bottom || defaultPositions.bottom}
                settings={settings}
                updateSettings={updateSettings}
              />

              {}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                <LayoutSlot
                  position="bottomLeft"
                  componentId={settings.dashboardLayout?.positions?.bottomLeft || defaultPositions.bottomLeft}
                  settings={settings}
                  updateSettings={updateSettings}
                />
                <LayoutSlot
                  position="bottomMiddle"
                  componentId={settings.dashboardLayout?.positions?.bottomMiddle || defaultPositions.bottomMiddle}
                  settings={settings}
                  updateSettings={updateSettings}
                />
                <LayoutSlot
                  position="bottomRight"
                  componentId={settings.dashboardLayout?.positions?.bottomRight || defaultPositions.bottomRight}
                  settings={settings}
                  updateSettings={updateSettings}
                />
              </div>
            </div>
          </div>
        </Card>

        {}
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
              padding: '14px', background: buttonBg, border: `1px solid ${buttonBorder}`,
              borderRadius: '12px', color: textSecondary, fontSize: '14px', fontWeight: 500, cursor: 'pointer',
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

        {}
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
                style={{
                  background: isDark ? 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)' : '#FFF',
                  borderRadius: 20, padding: 28, maxWidth: 360, width: '90%',
                  border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
                }}>

                {}
                <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <Trash size={28} color="#EF4444" />
                </div>

                <h3 style={{ color: textColor, fontSize: 18, fontWeight: 600, margin: '0 0 8px', textAlign: 'center' }}>ล้างประวัติทั้งหมด?</h3>
                <p style={{ color: textSecondary, fontSize: 14, margin: '0 0 24px', textAlign: 'center', lineHeight: 1.5 }}>ข้อมูลประวัติ Sensor ทั้งหมดจะถูกลบ<br />และไม่สามารถกู้คืนได้</p>

                <div style={{ display: 'flex', gap: 12 }}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowClearConfirm(false)}
                    style={{
                      flex: 1, padding: '12px 16px', background: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9',
                      border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)',
                      borderRadius: 12, color: isDark ? '#E2E8F0' : '#475569', cursor: 'pointer', fontSize: 14, fontWeight: 500
                    }}>
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
