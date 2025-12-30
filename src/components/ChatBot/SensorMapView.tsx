import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, X, Eye, EyeOff } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { SensorData } from '../../types/sensor';
import type { SettingsConfig } from '../../hooks/useSettings';

interface SensorMapViewProps {
  sensors: SensorData[];
  settings: SettingsConfig;
  onClose: () => void;
  onSelectSensor?: (sensor: SensorData) => void;
}

const DEFAULT_COORDS = { lat: 13.7563, lng: 100.5018 };

export const SensorMapView = ({ sensors, settings, onClose, onSelectSensor }: SensorMapViewProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const initialBoundsSetRef = useRef(false);
  const lastFilterRef = useRef<string>('all');
  
  const [filter, setFilter] = useState<'all' | 'danger' | 'warning' | 'safe'>('all');
  const [selectedSensorId, setSelectedSensorId] = useState<string | null>(null);
  const [showLabels, setShowLabels] = useState(true);

  const getStatusColor = (value: number) => {
    if (value >= settings.dangerThreshold) return '#EF4444';
    if (value >= settings.warningThreshold) return '#F59E0B';
    return '#10B981';
  };

  const getStatus = (value: number) => {
    if (value >= settings.dangerThreshold) return 'danger';
    if (value >= settings.warningThreshold) return 'warning';
    return 'safe';
  };

  const filteredSensors = sensors.filter(s => {
    if (filter === 'all') return true;
    return getStatus(s.value) === filter;
  });

  const getSensorCoords = (sensor: SensorData) => {
    const settingsCoords = (settings.sensorCoordinates || []).find(c => 
      c.sensorId === sensor.location || c.sensorId === sensor.id
    );
    return {
      lat: settingsCoords?.lat ?? sensor.lat ?? DEFAULT_COORDS.lat,
      lng: settingsCoords?.lng ?? sensor.lng ?? DEFAULT_COORDS.lng,
      hasCoords: settingsCoords !== undefined || (sensor.lat !== undefined && sensor.lng !== undefined)
    };
  };

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map
    if (!mapInstanceRef.current) {
      // Find center from sensors with coordinates
      let centerLat = DEFAULT_COORDS.lat;
      let centerLng = DEFAULT_COORDS.lng;
      let hasValidCoords = false;
      
      // First try to get coords from sensors
      const sensorsWithCoords = sensors.map(s => getSensorCoords(s)).filter(c => c.hasCoords);
      
      if (sensorsWithCoords.length > 0) {
        centerLat = sensorsWithCoords.reduce((sum, c) => sum + c.lat, 0) / sensorsWithCoords.length;
        centerLng = sensorsWithCoords.reduce((sum, c) => sum + c.lng, 0) / sensorsWithCoords.length;
        hasValidCoords = true;
      } else if (settings.sensorCoordinates && settings.sensorCoordinates.length > 0) {
        // Fallback to settings coordinates
        const settingsCoords = settings.sensorCoordinates;
        centerLat = settingsCoords.reduce((sum, c) => sum + c.lat, 0) / settingsCoords.length;
        centerLng = settingsCoords.reduce((sum, c) => sum + c.lng, 0) / settingsCoords.length;
        hasValidCoords = true;
      }

      mapInstanceRef.current = L.map(mapRef.current, {
        center: [centerLat, centerLng],
        zoom: hasValidCoords ? 15 : 12,
        zoomControl: false,
        attributionControl: false,
        maxZoom: 20,
        minZoom: 3,
      });

      L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        maxZoom: 20,
      }).addTo(mapInstanceRef.current);

      L.control.zoom({ position: 'bottomright' }).addTo(mapInstanceRef.current);
    }

    // Clear old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Add markers for each sensor
    filteredSensors.forEach(sensor => {
      const { lat, lng, hasCoords } = getSensorCoords(sensor);
      if (!hasCoords) return;

      const color = getStatusColor(sensor.value);
      const isSelected = selectedSensorId === sensor.id;

      const markerIcon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="position: relative; cursor: pointer;">
            <div style="
              width: ${isSelected ? '50px' : '36px'};
              height: ${isSelected ? '50px' : '36px'};
              background: ${color};
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              border: 3px solid ${isSelected ? '#FFF' : 'rgba(255,255,255,0.8)'};
              box-shadow: 0 4px 12px rgba(0,0,0,0.4)${isSelected ? ', 0 0 20px ' + color : ''};
              display: flex;
              align-items: center;
              justify-content: center;
              transition: all 0.2s;
            ">
              <div style="
                transform: rotate(45deg);
                color: white;
                font-weight: bold;
                font-size: ${isSelected ? '13px' : '10px'};
              ">${sensor.value.toFixed(0)}</div>
            </div>
            ${showLabels ? `
              <div style="
                position: absolute;
                top: -28px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0,0,0,0.85);
                color: white;
                padding: 3px 8px;
                border-radius: 6px;
                font-size: 10px;
                white-space: nowrap;
                font-weight: 500;
              ">${sensor.location || sensor.id}</div>
            ` : ''}
          </div>
        `,
        iconSize: [isSelected ? 50 : 36, isSelected ? 60 : 46],
        iconAnchor: [isSelected ? 25 : 18, isSelected ? 60 : 46],
      });

      const marker = L.marker([lat, lng], { icon: markerIcon })
        .addTo(mapInstanceRef.current!);
      
      marker.on('click', () => {
        setSelectedSensorId(sensor.id);
        if (onSelectSensor) onSelectSensor(sensor);
      });

      markersRef.current.push(marker);
    });

    // Fit bounds only on initial load or when filter changes
    const filterChanged = lastFilterRef.current !== filter;
    lastFilterRef.current = filter;
    
    if (!initialBoundsSetRef.current || filterChanged) {
      const sensorsWithCoords = filteredSensors
        .map(s => getSensorCoords(s))
        .filter(c => c.hasCoords);
      
      if (sensorsWithCoords.length > 0) {
        if (sensorsWithCoords.length === 1) {
          // Single sensor - center on it with good zoom
          mapInstanceRef.current.setView([sensorsWithCoords[0].lat, sensorsWithCoords[0].lng], 17);
        } else {
          // Multiple sensors - fit bounds
          const bounds = L.latLngBounds(sensorsWithCoords.map(c => [c.lat, c.lng]));
          mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 18 });
        }
        initialBoundsSetRef.current = true;
      }
    }

    return () => {
      // Don't destroy map on filter change, only on unmount
    };
  }, [filteredSensors, selectedSensorId, showLabels, settings, filter]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const dangerCount = sensors.filter(s => s.value >= settings.dangerThreshold).length;
  const warningCount = sensors.filter(s => s.value >= settings.warningThreshold && s.value < settings.dangerThreshold).length;
  const safeCount = sensors.filter(s => s.value < settings.warningThreshold).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'rgba(30, 41, 59, 0.6)',
        borderRadius: 16,
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.08)',
        marginBottom: 20,
      }}
    >
      {/* Header */}
      <div style={{
        padding: '14px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <MapPin size={16} color="#3B82F6" />
          <span style={{ color: '#F1F5F9', fontSize: 13, fontWeight: 600 }}>แผนที่ Sensor</span>
          <span style={{ 
            background: 'rgba(59, 130, 246, 0.2)', 
            color: '#60A5FA', 
            fontSize: 11, 
            padding: '2px 8px', 
            borderRadius: 10 
          }}>
            {filteredSensors.length} ตัว
          </span>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <button
            onClick={() => setShowLabels(!showLabels)}
            style={{
              background: showLabels ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 6,
              padding: '4px 8px',
              color: showLabels ? '#60A5FA' : '#94A3B8',
              fontSize: 11,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            {showLabels ? <Eye size={12} /> : <EyeOff size={12} />}
            ชื่อ
          </button>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 6,
              padding: '4px 8px',
              color: '#94A3B8',
              fontSize: 11,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            <X size={12} />
            ปิด
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        padding: '10px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        gap: 8,
        flexWrap: 'wrap',
      }}>
        <button
          onClick={() => setFilter('all')}
          style={{
            padding: '6px 12px',
            borderRadius: 8,
            border: filter === 'all' ? '1px solid rgba(59, 130, 246, 0.5)' : '1px solid rgba(255,255,255,0.1)',
            background: filter === 'all' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.03)',
            color: filter === 'all' ? '#60A5FA' : '#94A3B8',
            fontSize: 11,
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          ทั้งหมด ({sensors.length})
        </button>
        {dangerCount > 0 && (
          <button
            onClick={() => setFilter('danger')}
            style={{
              padding: '6px 12px',
              borderRadius: 8,
              border: filter === 'danger' ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(255,255,255,0.1)',
              background: filter === 'danger' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.03)',
              color: filter === 'danger' ? '#F87171' : '#94A3B8',
              fontSize: 11,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            อันตราย ({dangerCount})
          </button>
        )}
        {warningCount > 0 && (
          <button
            onClick={() => setFilter('warning')}
            style={{
              padding: '6px 12px',
              borderRadius: 8,
              border: filter === 'warning' ? '1px solid rgba(245, 158, 11, 0.5)' : '1px solid rgba(255,255,255,0.1)',
              background: filter === 'warning' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255,255,255,0.03)',
              color: filter === 'warning' ? '#FBBF24' : '#94A3B8',
              fontSize: 11,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            เฝ้าระวัง ({warningCount})
          </button>
        )}
        {safeCount > 0 && (
          <button
            onClick={() => setFilter('safe')}
            style={{
              padding: '6px 12px',
              borderRadius: 8,
              border: filter === 'safe' ? '1px solid rgba(16, 185, 129, 0.5)' : '1px solid rgba(255,255,255,0.1)',
              background: filter === 'safe' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.03)',
              color: filter === 'safe' ? '#34D399' : '#94A3B8',
              fontSize: 11,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            ปลอดภัย ({safeCount})
          </button>
        )}
      </div>

      {/* Map */}
      <div 
        ref={mapRef} 
        style={{ 
          width: '100%', 
          height: '350px',
          background: '#1a1a2e',
        }} 
      />

      {/* Legend */}
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        gap: 16,
        flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10B981' }} />
          <span style={{ color: '#94A3B8', fontSize: 11 }}>ปลอดภัย</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#F59E0B' }} />
          <span style={{ color: '#94A3B8', fontSize: 11 }}>เฝ้าระวัง</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#EF4444' }} />
          <span style={{ color: '#94A3B8', fontSize: 11 }}>อันตราย</span>
        </div>
        <span style={{ color: '#64748B', fontSize: 10, marginLeft: 'auto' }}>
          คลิกที่ marker เพื่อดูรายละเอียด
        </span>
      </div>
    </motion.div>
  );
};
