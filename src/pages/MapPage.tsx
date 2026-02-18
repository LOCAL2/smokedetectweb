import { useEffect, useRef, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ArrowLeft, X, Activity, Clock, TrendingUp, AlertTriangle } from 'lucide-react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useSensorDataContext } from '../context/SensorDataContext';
import { useSettingsContext } from '../context/SettingsContext';
import { useTheme } from '../context/ThemeContext';
import type { SensorData } from '../types/sensor';
import { getSensorStatusWithSettings } from '../hooks/useSettings';

export const MapPage = () => {
  const navigate = useNavigate();
  const { sensors, sensorHistory } = useSensorDataContext();
  const { settings } = useSettingsContext();
  const { isDark } = useTheme();
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedSensor, setSelectedSensor] = useState<SensorData | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<Map<string, maplibregl.Marker>>(new Map());

  const sensorsWithGPS = useMemo(() => {
    const filtered = sensors.filter(s => {
      return s.lat !== undefined && s.lng !== undefined;
    });
    return filtered;
  }, [sensors]);

  const getMarkerColor = (value: number) => {
    if (value >= settings.dangerThreshold) return '#EF4444';
    if (value >= settings.warningThreshold) return '#F59E0B';
    return '#10B981';
  };

  const textColor = isDark ? '#F8FAFC' : '#0F172A';
  const textSecondary = isDark ? '#94A3B8' : '#64748B';
  const cardBg = isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)';
  const borderColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
  const bgGradient = isDark
    ? 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)'
    : 'linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 50%, #F8FAFC 100%)';

  useEffect(() => {
    if (!mapContainerRef.current) {
      const timer = setTimeout(() => setMapLoaded(true), 100);
      return () => clearTimeout(timer);
    }
    
    if (mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {
          'osm-tiles': {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors'
          }
        },
        layers: [{
          id: 'osm-tiles',
          type: 'raster',
          source: 'osm-tiles',
          minzoom: 0,
          maxzoom: 19
        }]
      },
      center: [100.5018, 13.7563],
      zoom: 5.5,
      interactive: true,
      scrollZoom: true,
      boxZoom: true,
      dragRotate: true,
      dragPan: true,
      keyboard: true,
      doubleClickZoom: true,
      touchZoomRotate: true,
      touchPitch: true
    });

    map.addControl(new maplibregl.NavigationControl(), 'top-right');
    
    mapRef.current = map;

    return () => {
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current.clear();
      
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [mapLoaded]);

  useEffect(() => {
    if (!mapRef.current) return;

    // Wait for map to be fully loaded before adding markers
    const addMarkers = () => {
      const currentSensorIds = new Set(sensorsWithGPS.map(s => s.id));
      
      markersRef.current.forEach((marker, id) => {
        if (!currentSensorIds.has(id)) {
          marker.remove();
          markersRef.current.delete(id);
        }
      });

      if (sensorsWithGPS.length === 0) return;

      sensorsWithGPS.forEach(sensor => {
        const lat = sensor.lat;
        const lng = sensor.lng;
        
        if (!lat || !lng) return;

        const color = getMarkerColor(sensor.value);
        const existingMarker = markersRef.current.get(sensor.id);

        if (existingMarker) {
          const el = existingMarker.getElement();
          
          // Update marker color and value
          const mainMarker = el.querySelector('.marker-main') as HTMLElement;
          const pulseMarker = el.querySelector('.marker-pulse') as HTMLElement;
          const valueSpan = el.querySelector('span') as HTMLElement;
          
          if (mainMarker && valueSpan) {
            mainMarker.style.borderColor = color;
            valueSpan.style.color = color;
            valueSpan.textContent = sensor.value.toFixed(0);
          }
          
          if (pulseMarker) {
            pulseMarker.style.background = color;
          }
        } else {
          // Create custom marker element
          const el = document.createElement('div');
          el.className = 'custom-marker';
          el.style.cssText = `
            cursor: pointer;
            position: relative;
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-left: -18px;
            margin-top: -18px;
          `;
          
          // Marker design - clean modern style
          el.innerHTML = `
            <!-- Pulse effect -->
            <div class="marker-pulse" style="
              position: absolute;
              width: 36px;
              height: 36px;
              border-radius: 50%;
              background: ${color};
              opacity: 0;
              animation: pulse 2s infinite;
              pointer-events: none;
            "></div>
            
            <!-- Main marker -->
            <div class="marker-main" style="
              position: relative;
              width: 36px;
              height: 36px;
              background: white;
              border-radius: 50%;
              border: 3px solid ${color};
              box-shadow: 0 2px 8px rgba(0,0,0,0.2);
              display: flex;
              align-items: center;
              justify-content: center;
              transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
              z-index: 1;
            ">
              <span style="
                color: ${color};
                font-size: 12px;
                font-weight: 700;
                user-select: none;
              ">${sensor.value.toFixed(0)}</span>
            </div>
          `;

          // Add hover effect
          el.addEventListener('mouseenter', () => {
            const markerEl = el.querySelector('.marker-main') as HTMLElement;
            if (markerEl) {
              markerEl.style.transform = 'scale(1.2)';
              markerEl.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
            }
          });
          el.addEventListener('mouseleave', () => {
            const markerEl = el.querySelector('.marker-main') as HTMLElement;
            if (markerEl) {
              markerEl.style.transform = 'scale(1)';
              markerEl.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
            }
          });

          // Click to show detail panel
          el.addEventListener('click', () => {
            setSelectedSensor(sensor);
            markersRef.current.forEach((m, id) => {
              if (id !== sensor.id) {
                const p = m.getPopup();
                if (p && p.isOpen()) {
                  p.remove();
                }
              }
            });
          });

          const marker = new maplibregl.Marker({ 
            element: el,
            anchor: 'center'
          })
            .setLngLat([lng, lat])
            .addTo(mapRef.current!);

          markersRef.current.set(sensor.id, marker);
        }
      });
    };

    // If map is already loaded, add markers immediately
    if (mapRef.current.loaded()) {
      addMarkers();
    } else {
      // Otherwise wait for load event
      mapRef.current.once('load', addMarkers);
    }
  }, [sensorsWithGPS, settings.dangerThreshold, settings.warningThreshold]);

  return (
    <div style={{
      minHeight: '100vh',
      background: bgGradient,
      position: 'relative',
    }}>
      <style>{`
        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 0.6;
          }
          50% {
            transform: scale(1.5);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 0;
          }
        }
      `}</style>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          background: cardBg,
          borderBottom: `1px solid ${borderColor}`,
          backdropFilter: 'blur(10px)',
        }}
      >
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: 'clamp(12px, 3vw, 16px) clamp(16px, 4vw, 24px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px, 2vw, 16px)', flexWrap: 'wrap' }}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: 'clamp(8px, 2vw, 10px) clamp(12px, 3vw, 16px)',
                borderRadius: '12px',
                border: `1px solid ${borderColor}`,
                background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                color: textSecondary,
                fontSize: 'clamp(13px, 2.5vw, 14px)',
                fontWeight: 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              <ArrowLeft size={18} />
              <span style={{ display: window.innerWidth < 640 ? 'none' : 'inline' }}>กลับหน้าหลัก</span>
            </motion.button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px, 2vw, 12px)' }}>
              <div style={{
                width: 'clamp(32px, 8vw, 40px)',
                height: 'clamp(32px, 8vw, 40px)',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <MapPin size={window.innerWidth < 640 ? 16 : 20} color="#FFF" />
              </div>
              <div>
                <h1 style={{ color: textColor, fontSize: 'clamp(16px, 4vw, 20px)', fontWeight: 700, margin: 0 }}>
                  แผนที่ Sensor
                </h1>
                <p style={{ color: textSecondary, fontSize: 'clamp(11px, 2.5vw, 13px)', margin: 0, whiteSpace: 'nowrap' }}>
                  {sensorsWithGPS.length} ตำแหน่ง • Real-time
                </p>
              </div>
            </div>
          </div>

          <div style={{
            display: 'flex',
            gap: 'clamp(6px, 2vw, 12px)',
            alignItems: 'center',
          }}>
            <div style={{
              display: 'flex',
              gap: 'clamp(4px, 1.5vw, 8px)',
              padding: 'clamp(6px, 1.5vw, 8px) clamp(8px, 2vw, 12px)',
              borderRadius: '10px',
              background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
              flexWrap: 'wrap',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(4px, 1vw, 6px)' }}>
                <div style={{ width: 'clamp(10px, 2.5vw, 12px)', height: 'clamp(10px, 2.5vw, 12px)', borderRadius: '50%', background: '#10B981', flexShrink: 0 }} />
                <span style={{ color: textSecondary, fontSize: 'clamp(10px, 2vw, 12px)', whiteSpace: 'nowrap' }}>ปกติ</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(4px, 1vw, 6px)' }}>
                <div style={{ width: 'clamp(10px, 2.5vw, 12px)', height: 'clamp(10px, 2.5vw, 12px)', borderRadius: '50%', background: '#F59E0B', flexShrink: 0 }} />
                <span style={{ color: textSecondary, fontSize: 'clamp(10px, 2vw, 12px)', whiteSpace: 'nowrap' }}>เตือน</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(4px, 1vw, 6px)' }}>
                <div style={{ width: 'clamp(10px, 2.5vw, 12px)', height: 'clamp(10px, 2.5vw, 12px)', borderRadius: '50%', background: '#EF4444', flexShrink: 0 }} />
                <span style={{ color: textSecondary, fontSize: 'clamp(10px, 2vw, 12px)', whiteSpace: 'nowrap' }}>อันตราย</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div style={{ paddingTop: '72px', height: '100vh', width: '100%', position: 'relative', overflow: 'hidden' }}>
        {sensorsWithGPS.length === 0 ? (
          <div style={{
            height: 'calc(100vh - 72px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
          }}>
            <MapPin size={64} color={textSecondary} style={{ marginBottom: '24px', opacity: 0.3 }} />
            <h2 style={{ color: textColor, fontSize: '24px', fontWeight: 600, margin: '0 0 12px' }}>
              ยังไม่มี Sensor ที่มีพิกัด GPS
            </h2>
            <p style={{ color: textSecondary, fontSize: '16px', margin: '0 0 32px', textAlign: 'center', maxWidth: '400px' }}>
              ไปที่หน้าตั้งค่าเพื่อเพิ่มพิกัด GPS ให้กับ Sensor ของคุณ
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/settings')}
              style={{
                padding: '14px 28px',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
                color: '#FFF',
                fontSize: '15px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              ไปที่หน้าตั้งค่า
            </motion.button>
          </div>
        ) : (
          <>
            <div 
              ref={mapContainerRef} 
              style={{ 
                height: 'calc(100vh - 72px)', 
                width: '100%',
                position: 'relative',
                touchAction: 'none'
              }} 
            />
            
            {/* Detail Panel */}
            <AnimatePresence>
              {selectedSensor && (() => {
                const currentSensor = sensors.find(s => s.id === selectedSensor.id) || selectedSensor;
                const status = getSensorStatusWithSettings(
                  currentSensor.value,
                  settings.warningThreshold,
                  settings.dangerThreshold
                );
                const statusColor = status === 'danger' ? '#EF4444' : status === 'warning' ? '#F59E0B' : '#10B981';
                const statusText = status === 'danger' ? 'อันตราย' : status === 'warning' ? 'เตือน' : 'ปกติ';
                const history = sensorHistory[currentSensor.location || currentSensor.id] || [];
                
                return (
                  <motion.div
                    initial={{ x: 400, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 400, opacity: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    style={{
                      position: 'fixed',
                      right: 0,
                      top: '72px',
                      bottom: 0,
                      width: '400px',
                      maxWidth: '90vw',
                      background: cardBg,
                      borderLeft: `1px solid ${borderColor}`,
                      boxShadow: '-4px 0 24px rgba(0,0,0,0.1)',
                      zIndex: 1000,
                      overflowY: 'auto',
                    }}
                  >
                    <>
                      {/* Header */}
                      <div style={{
                        padding: '24px',
                        borderBottom: `1px solid ${borderColor}`,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                      }}>
                        <div style={{ flex: 1 }}>
                          <h2 style={{ color: textColor, fontSize: '20px', fontWeight: 700, margin: '0 0 8px' }}>
                            {currentSensor.name}
                          </h2>
                          <p style={{ color: textSecondary, fontSize: '14px', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <MapPin size={14} />
                            {currentSensor.location}
                          </p>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setSelectedSensor(null)}
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            border: `1px solid ${borderColor}`,
                            background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: textSecondary,
                          }}
                        >
                          <X size={18} />
                        </motion.button>
                      </div>

                      {/* Current Value */}
                      <div style={{ padding: '24px' }}>
                        <div style={{
                          background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                          borderRadius: '16px',
                          padding: '24px',
                          textAlign: 'center',
                          border: `2px solid ${statusColor}20`,
                        }}>
                          <div style={{ color: textSecondary, fontSize: '13px', marginBottom: '8px' }}>
                            ค่าปัจจุบัน
                          </div>
                          <div style={{ color: statusColor, fontSize: '48px', fontWeight: 700, lineHeight: 1 }}>
                            {currentSensor.value.toFixed(1)}
                          </div>
                          <div style={{ color: textSecondary, fontSize: '16px', marginTop: '4px' }}>
                            PPM
                          </div>
                          <div style={{
                            marginTop: '16px',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            background: `${statusColor}15`,
                            color: statusColor,
                            fontSize: '14px',
                            fontWeight: 600,
                            display: 'inline-block',
                          }}>
                            {statusText}
                          </div>
                        </div>
                      </div>

                      {/* Stats */}
                      <div style={{ padding: '0 24px 24px' }}>
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: '12px',
                        }}>
                          <div style={{
                            background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                            borderRadius: '12px',
                            padding: '16px',
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                              <Activity size={16} color={textSecondary} />
                              <span style={{ color: textSecondary, fontSize: '12px' }}>สถานะ</span>
                            </div>
                            <div style={{ color: textColor, fontSize: '16px', fontWeight: 600 }}>
                              {currentSensor.isOnline ? '🟢 ออนไลน์' : '🔴 ออฟไลน์'}
                            </div>
                          </div>

                          <div style={{
                            background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                            borderRadius: '12px',
                            padding: '16px',
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                              <Clock size={16} color={textSecondary} />
                              <span style={{ color: textSecondary, fontSize: '12px' }}>อัพเดท</span>
                            </div>
                            <div style={{ color: textColor, fontSize: '16px', fontWeight: 600 }}>
                              {new Date(currentSensor.timestamp).toLocaleTimeString('th-TH', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* History Chart */}
                      {history.length > 0 && (
                        <div style={{ padding: '0 24px 24px' }}>
                          <div style={{
                            background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                            borderRadius: '12px',
                            padding: '16px',
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <TrendingUp size={16} color={textSecondary} />
                                <span style={{ color: textColor, fontSize: '14px', fontWeight: 600 }}>
                                  ประวัติ 30 นาที
                                </span>
                              </div>
                              <span style={{ color: textSecondary, fontSize: '12px' }}>
                                {history.length} จุด
                              </span>
                            </div>
                            
                            {/* Mini Line Chart */}
                            <div style={{ 
                              height: '80px', 
                              position: 'relative',
                              marginTop: '16px',
                            }}>
                              <svg width="100%" height="80" style={{ overflow: 'visible' }}>
                                {/* Grid lines */}
                                <line x1="0" y1="20" x2="100%" y2="20" stroke={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} strokeWidth="1" />
                                <line x1="0" y1="40" x2="100%" y2="40" stroke={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} strokeWidth="1" />
                                <line x1="0" y1="60" x2="100%" y2="60" stroke={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} strokeWidth="1" />
                                
                                {/* Line chart */}
                                {(() => {
                                  const maxValue = Math.max(...history.map(h => h.value), settings.dangerThreshold);
                                  const minValue = Math.min(...history.map(h => h.value), 0);
                                  const range = maxValue - minValue || 1;
                                  const width = 100;
                                  const points = history.slice(-20).map((h, i, arr) => {
                                    const x = (i / (arr.length - 1 || 1)) * width;
                                    const y = 70 - ((h.value - minValue) / range) * 60;
                                    return `${x}%,${y}`;
                                  }).join(' ');
                                  
                                  return (
                                    <>
                                      {/* Area fill */}
                                      <polygon
                                        points={`0,80 ${points} ${width}%,80`}
                                        fill={`${statusColor}20`}
                                        stroke="none"
                                      />
                                      {/* Line */}
                                      <polyline
                                        points={points}
                                        fill="none"
                                        stroke={statusColor}
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      />
                                      {/* Points */}
                                      {history.slice(-20).map((h, i, arr) => {
                                        const x = (i / (arr.length - 1 || 1)) * width;
                                        const y = 70 - ((h.value - minValue) / range) * 60;
                                        return (
                                          <circle
                                            key={i}
                                            cx={`${x}%`}
                                            cy={y}
                                            r="2"
                                            fill={statusColor}
                                          />
                                        );
                                      })}
                                    </>
                                  );
                                })()}
                              </svg>
                              
                              {/* Value labels */}
                              <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginTop: '8px',
                                fontSize: '11px',
                                color: textSecondary,
                              }}>
                                <span>
                                  {history.length > 0 ? `${Math.min(...history.map(h => h.value)).toFixed(0)} PPM` : ''}
                                </span>
                                <span>
                                  {history.length > 0 ? `${Math.max(...history.map(h => h.value)).toFixed(0)} PPM` : ''}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Thresholds */}
                      <div style={{ padding: '0 24px 24px' }}>
                        <div style={{
                          background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                          borderRadius: '12px',
                          padding: '16px',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                            <AlertTriangle size={16} color={textSecondary} />
                            <span style={{ color: textColor, fontSize: '14px', fontWeight: 600 }}>
                              เกณฑ์การแจ้งเตือน
                            </span>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ color: textSecondary, fontSize: '13px' }}>เตือน</span>
                              <span style={{ color: '#F59E0B', fontSize: '14px', fontWeight: 600 }}>
                                {settings.warningThreshold} PPM
                              </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ color: textSecondary, fontSize: '13px' }}>อันตราย</span>
                              <span style={{ color: '#EF4444', fontSize: '14px', fontWeight: 600 }}>
                                {settings.dangerThreshold} PPM
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* GPS Coordinates */}
                      {currentSensor.lat && currentSensor.lng && (
                        <div style={{ padding: '0 24px 24px' }}>
                          <div style={{
                            background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                            borderRadius: '12px',
                            padding: '16px',
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                              <MapPin size={16} color={textSecondary} />
                              <span style={{ color: textColor, fontSize: '14px', fontWeight: 600 }}>
                                พิกัด GPS
                              </span>
                            </div>
                            <div style={{ color: textSecondary, fontSize: '12px', fontFamily: 'monospace' }}>
                              {currentSensor.lat.toFixed(6)}, {currentSensor.lng.toFixed(6)}
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  </motion.div>
                );
              })()}
            </AnimatePresence>
          </>
        )}
      </div>
    </div>
  );
};
