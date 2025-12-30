import { useEffect, useRef } from 'react';
import { X, Activity, TrendingUp, TrendingDown, BarChart3, Clock, MapPin, Navigation } from 'lucide-react';
import { motion } from 'framer-motion';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { SensorData } from '../../types/sensor';
import type { SettingsConfig } from '../../hooks/useSettings';
import { getSensorStatusWithSettings } from '../../hooks/useSettings';
import { STATUS_COLORS, STATUS_LABELS } from '../../config/thresholds';
import { formatNumber } from '../../utils/format';

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

// Default coordinates (Bangkok) if sensor doesn't have GPS data
const DEFAULT_COORDS = { lat: 13.7563, lng: 100.5018 };

// Interactive Map Component using Leaflet
const SensorMap = ({ sensor, colors, settings }: { sensor: SensorData; colors: any; settings: SettingsConfig }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);
  
  // Priority: 1. Settings coordinates (by location or id), 2. Sensor data coordinates, 3. Default
  // Use location as primary key for coordinates matching (more stable than endpoint-prefixed id)
  const settingsCoords = (settings.sensorCoordinates || []).find(c => 
    c.sensorId === sensor.location || c.sensorId === sensor.id
  );
  const lat = settingsCoords?.lat ?? sensor.lat ?? DEFAULT_COORDS.lat;
  const lng = settingsCoords?.lng ?? sensor.lng ?? DEFAULT_COORDS.lng;
  const address = settingsCoords?.address || sensor.address || sensor.location;
  const hasCoordinates = settingsCoords !== undefined || (sensor.lat !== undefined && sensor.lng !== undefined);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map only once
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current, {
        center: [lat, lng],
        zoom: 18,
        zoomControl: false,
        attributionControl: false,
      });

      // Use Google Maps style tiles
      L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        maxZoom: 20,
      }).addTo(mapInstanceRef.current);

      // Add zoom control to bottom right
      L.control.zoom({ position: 'bottomright' }).addTo(mapInstanceRef.current);
    }

    // Update map view
    mapInstanceRef.current.setView([lat, lng], 18);

    // Remove old marker and circle
    if (markerRef.current) {
      markerRef.current.remove();
    }
    if (circleRef.current) {
      circleRef.current.remove();
    }

    // Create custom marker icon
    const markerIcon = L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="position: relative;">
          <div style="
            width: 40px;
            height: 40px;
            background: ${colors.primary};
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 3px solid white;
            box-shadow: 0 4px 12px rgba(0,0,0,0.4);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="
              transform: rotate(45deg);
              color: white;
              font-weight: bold;
              font-size: 11px;
            ">${sensor.value.toFixed(0)}</div>
          </div>
          <div style="
            position: absolute;
            top: -30px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0,0,0,0.85);
            color: white;
            padding: 4px 10px;
            border-radius: 6px;
            font-size: 11px;
            white-space: nowrap;
            font-weight: 500;
          ">${sensor.location}</div>
        </div>
      `,
      iconSize: [40, 50],
      iconAnchor: [20, 50],
    });

    // Add new marker
    markerRef.current = L.marker([lat, lng], { icon: markerIcon })
      .addTo(mapInstanceRef.current);

    // Add pulsing circle
    circleRef.current = L.circle([lat, lng], {
      color: colors.primary,
      fillColor: colors.primary,
      fillOpacity: 0.2,
      radius: 15,
      weight: 2,
    }).addTo(mapInstanceRef.current);

    return () => {
      // Cleanup on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [sensor.id, sensor.value, lat, lng, colors.primary, sensor.location]);

  const openInGoogleMaps = () => {
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
  };

  return (
    <div style={{ padding: '0 20px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{ 
          color: '#F8FAFC', 
          fontSize: '14px', 
          fontWeight: 600, 
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <MapPin size={16} color="#10B981" />
          ตำแหน่งเซ็นเซอร์
        </h3>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={openInGoogleMaps}
          style={{
            background: 'rgba(59, 130, 246, 0.15)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '8px',
            padding: '6px 12px',
            color: '#60A5FA',
            fontSize: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Navigation size={14} />
          เปิดใน Maps
        </motion.button>
      </div>

      {/* No coordinates warning */}
      {!hasCoordinates && (
        <div style={{
          background: 'rgba(245, 158, 11, 0.1)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          borderRadius: '8px',
          padding: '8px 12px',
          marginBottom: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <MapPin size={14} color="#F59E0B" />
          <span style={{ color: '#F59E0B', fontSize: '12px' }}>
            ตั้งค่าพิกัดได้ที่หน้าตั้งค่า
          </span>
        </div>
      )}

      {/* Map Container */}
      <div style={{
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        position: 'relative',
      }}>
        <div 
          ref={mapRef} 
          style={{ 
            width: '100%', 
            height: '200px',
            background: '#1a1a2e',
          }} 
        />
        
        {/* Overlay Info */}
        <div style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(8px)',
          borderRadius: '10px',
          padding: '10px 14px',
          zIndex: 1000,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <div style={{ 
              width: '10px', 
              height: '10px', 
              borderRadius: '50%', 
              background: colors.primary,
              boxShadow: `0 0 8px ${colors.primary}`,
            }} />
            <span style={{ color: '#F8FAFC', fontSize: '12px', fontWeight: 600 }}>{sensor.value.toFixed(1)} PPM</span>
          </div>
          <p style={{ color: '#94A3B8', fontSize: '11px', margin: 0 }}>{address}</p>
        </div>
      </div>

      {/* Coordinates */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        marginTop: '10px',
        padding: '8px 12px',
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '8px',
      }}>
        <span style={{ color: '#64748B', fontSize: '11px' }}>พิกัด GPS</span>
        <span style={{ color: hasCoordinates ? '#94A3B8' : '#64748B', fontSize: '11px', fontFamily: 'monospace' }}>
          {hasCoordinates ? `${lat.toFixed(6)}, ${lng.toFixed(6)}` : 'ยังไม่ได้ตั้งค่า'}
        </span>
      </div>

      <style>{`
        .custom-marker {
          background: transparent !important;
          border: none !important;
        }
        .leaflet-container {
          background: #f2f2f2 !important;
        }
        .leaflet-tile-pane {
          opacity: 1 !important;
        }
        .leaflet-tile {
          border: none !important;
          outline: none !important;
        }
        .leaflet-control-zoom {
          border: none !important;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2) !important;
          border-radius: 8px !important;
          overflow: hidden;
        }
        .leaflet-control-zoom a {
          background: #fff !important;
          color: #333 !important;
          border: none !important;
          width: 32px !important;
          height: 32px !important;
          line-height: 32px !important;
          font-size: 18px !important;
        }
        .leaflet-control-zoom a:hover {
          background: #f0f0f0 !important;
          color: #000 !important;
        }
        .leaflet-control-zoom-in {
          border-bottom: 1px solid #ddd !important;
        }
      `}</style>
    </div>
  );
};

export const SensorDetailPanel = ({ sensor, stats, settings, onClose }: SensorDetailPanelProps) => {
  if (!sensor) return null;

  const status = getSensorStatusWithSettings(sensor.value, settings.warningThreshold, settings.dangerThreshold);
  const colors = STATUS_COLORS[status];

  return (
    <>
      {/* Backdrop */}
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
      
      {/* Panel */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: 'min(400px, 90vw)',
          background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)',
          borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
          zIndex: 1101,
          overflowY: 'auto',
          animation: 'slideIn 0.3s ease-out',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          background: 'linear-gradient(180deg, #1E293B 0%, rgba(30, 41, 59, 0.95) 100%)',
          backdropFilter: 'blur(10px)',
        }}>
          <div>
            <h2 style={{ color: '#F8FAFC', fontSize: '18px', fontWeight: 600, margin: 0 }}>
              {sensor.name}
            </h2>
            <p style={{ color: '#64748B', fontSize: '13px', margin: '4px 0 0' }}>
              {sensor.location}
            </p>
          </div>
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

        {/* Current Value */}
        <div style={{ padding: '24px 20px', textAlign: 'center' }}>
          <p style={{ color: '#64748B', fontSize: '13px', marginBottom: '8px' }}>
            <Clock size={14} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
            ค่าปัจจุบัน
          </p>
          <div
            style={{
              fontSize: '64px',
              fontWeight: 800,
              color: colors.primary,
              textShadow: colors.glow,
              lineHeight: 1,
            }}
          >
            {formatNumber(sensor.value)}
          </div>
          <div style={{ color: '#94A3B8', fontSize: '18px', marginTop: '4px', marginBottom: '16px' }}>
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

        {/* Progress Bar */}
        <div style={{ padding: '0 20px 24px' }}>
          <div style={{
            height: '8px',
            background: 'rgba(255, 255, 255, 0.1)',
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
            <span style={{ color: '#64748B', fontSize: '11px' }}>0</span>
            <span style={{ color: '#F59E0B', fontSize: '11px' }}>{settings.warningThreshold}</span>
            <span style={{ color: '#EF4444', fontSize: '11px' }}>{settings.dangerThreshold}</span>
            <span style={{ color: '#64748B', fontSize: '11px' }}>{Math.round(settings.dangerThreshold * 1.5)}</span>
          </div>
        </div>

        {/* Floor Map */}
        <SensorMap sensor={sensor} colors={colors} settings={settings} />

        {/* 24h Stats */}
        <div style={{ padding: '0 20px 24px' }}>
          <h3 style={{ 
            color: '#F8FAFC', 
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
            {/* Max */}
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
                <p style={{ color: '#94A3B8', fontSize: '12px', margin: 0 }}>ค่าสูงสุด</p>
                <p style={{ color: '#EF4444', fontSize: '24px', fontWeight: 700, margin: '4px 0 0' }}>
                  {stats ? formatNumber(stats.max24h) : '--'} <span style={{ fontSize: '14px', fontWeight: 400 }}>PPM</span>
                </p>
              </div>
            </div>

            {/* Min */}
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
                <p style={{ color: '#94A3B8', fontSize: '12px', margin: 0 }}>ค่าต่ำสุด</p>
                <p style={{ color: '#10B981', fontSize: '24px', fontWeight: 700, margin: '4px 0 0' }}>
                  {stats ? formatNumber(stats.min24h) : '--'} <span style={{ fontSize: '14px', fontWeight: 400 }}>PPM</span>
                </p>
              </div>
            </div>

            {/* Average */}
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
                <p style={{ color: '#94A3B8', fontSize: '12px', margin: 0 }}>ค่าเฉลี่ย</p>
                <p style={{ color: '#3B82F6', fontSize: '24px', fontWeight: 700, margin: '4px 0 0' }}>
                  {stats ? formatNumber(stats.avg24h) : '--'} <span style={{ fontSize: '14px', fontWeight: 400 }}>PPM</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sensor Info */}
        <div style={{ padding: '0 20px 24px' }}>
          <h3 style={{ 
            color: '#F8FAFC', 
            fontSize: '14px', 
            fontWeight: 600, 
            marginBottom: '16px',
          }}>
            ข้อมูลเซ็นเซอร์
          </h3>
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '12px',
            padding: '16px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ color: '#64748B', fontSize: '13px' }}>ID</span>
              <span style={{ color: '#F8FAFC', fontSize: '13px', fontFamily: 'monospace' }}>{sensor.id}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ color: '#64748B', fontSize: '13px' }}>สถานะ</span>
              <span style={{ color: sensor.isOnline ? '#10B981' : '#EF4444', fontSize: '13px' }}>
                {sensor.isOnline ? '● ออนไลน์' : '○ ออฟไลน์'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748B', fontSize: '13px' }}>อัพเดทล่าสุด</span>
              <span style={{ color: '#F8FAFC', fontSize: '13px' }}>
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
