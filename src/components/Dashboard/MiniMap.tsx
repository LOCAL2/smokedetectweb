import { useEffect, useRef, useMemo, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Maximize2, X } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { SensorData } from '../../types/sensor';
import { useSettingsContext } from '../../context/SettingsContext';
import { useTheme } from '../../context/ThemeContext';

interface MiniMapProps {
  sensors: SensorData[];
}

export const MiniMap = ({ sensors }: MiniMapProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { settings } = useSettingsContext();
  const { isDark } = useTheme();

  const miniMapRef = useRef<HTMLDivElement>(null);
  const miniMapInstanceRef = useRef<L.Map | null>(null);
  const miniMarkersRef = useRef<L.Marker[]>([]);
  const miniMapInitializedRef = useRef(false);
  const miniBoundsSetRef = useRef(false);

  const expandedMapRef = useRef<HTMLDivElement>(null);
  const expandedMapInstanceRef = useRef<L.Map | null>(null);
  const expandedMarkersRef = useRef<L.Marker[]>([]);
  const expandedMapInitializedRef = useRef(false);

  
  const sensorsWithGPS = useMemo(() =>
    sensors.filter(s => s.latitude && s.longitude),
    [sensors]
  );

  
  const center = useMemo(() => {
    if (sensorsWithGPS.length === 0) return { lat: 13.7563, lng: 100.5018 };
    const avgLat = sensorsWithGPS.reduce((sum, s) => sum + (s.latitude || 0), 0) / sensorsWithGPS.length;
    const avgLng = sensorsWithGPS.reduce((sum, s) => sum + (s.longitude || 0), 0) / sensorsWithGPS.length;
    return { lat: avgLat, lng: avgLng };
  }, [sensorsWithGPS]);

  const getMarkerColor = useCallback((value: number) => {
    if (value >= settings.dangerThreshold) return '#EF4444';
    if (value >= settings.warningThreshold) return '#F59E0B';
    return '#10B981';
  }, [settings.dangerThreshold, settings.warningThreshold]);

  
  const cardBg = isDark ? 'rgba(30, 41, 59, 0.5)' : 'rgba(255, 255, 255, 0.8)';
  const borderColor = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)';
  const textColor = isDark ? '#F8FAFC' : '#0F172A';
  const textSecondary = isDark ? '#94A3B8' : '#64748B';
  const iconBg = isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)';
  const buttonBg = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)';

  const createMarkerIcon = useCallback((color: string, value: number) => L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 28px;
        height: 28px;
        background: ${color};
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 9px;
        font-weight: bold;
      ">${value.toFixed(0)}</div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  }), []);

  const openModal = useCallback(() => setIsExpanded(true), []);
  const closeModal = useCallback(() => setIsExpanded(false), []);

  
  useEffect(() => {
    
    if (sensorsWithGPS.length === 0) return;
    if (!miniMapRef.current) return;
    if (miniMapInitializedRef.current) return;
    
    miniMapInstanceRef.current = L.map(miniMapRef.current, {
      center: [center.lat, center.lng],
      zoom: 10,
      zoomControl: false,
      attributionControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      touchZoom: false,
    });

    L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 20,
    }).addTo(miniMapInstanceRef.current);
    
    miniMapInitializedRef.current = true;
    
    
    setTimeout(() => {
      if (miniMapInstanceRef.current) {
        miniMapInstanceRef.current.invalidateSize();
      }
    }, 100);
  }, [sensorsWithGPS.length > 0]); 
  
  
  useEffect(() => {
    return () => {
      if (miniMapInstanceRef.current) {
        try { miniMapInstanceRef.current.remove(); } catch (e) {}
        miniMapInstanceRef.current = null;
        miniMapInitializedRef.current = false;
      }
    };
  }, []);

  
  useEffect(() => {
    if (!miniMapInstanceRef.current || sensorsWithGPS.length === 0) return;

    const map = miniMapInstanceRef.current;

    
    miniMarkersRef.current.forEach(m => m.remove());
    miniMarkersRef.current = [];

    
    sensorsWithGPS.forEach(sensor => {
      const marker = L.marker([sensor.latitude!, sensor.longitude!], {
        icon: createMarkerIcon(getMarkerColor(sensor.value), sensor.value)
      }).addTo(map);

      marker.bindPopup(`
        <div style="text-align: center; min-width: 100px;">
          <strong>${sensor.location || sensor.id}</strong><br/>
          <span style="color: ${getMarkerColor(sensor.value)}; font-weight: 600;">
            ${sensor.value.toFixed(1)} PPM
          </span>
        </div>
      `);

      miniMarkersRef.current.push(marker);
    });

    
    if (!miniBoundsSetRef.current && sensorsWithGPS.length > 0) {
      if (sensorsWithGPS.length > 1) {
        const bounds = L.latLngBounds(sensorsWithGPS.map(s => [s.latitude!, s.longitude!]));
        map.fitBounds(bounds, { padding: [30, 30], maxZoom: 10, animate: false });
      } else {
        map.setView([sensorsWithGPS[0].latitude!, sensorsWithGPS[0].longitude!], 10, { animate: false });
      }
      miniBoundsSetRef.current = true;
    }
  }, [sensorsWithGPS, createMarkerIcon, getMarkerColor]);

  
  useEffect(() => {
    if (!isExpanded) {
      
      if (expandedMapInstanceRef.current) {
        try { expandedMapInstanceRef.current.remove(); } catch (e) {}
        expandedMapInstanceRef.current = null;
        expandedMapInitializedRef.current = false;
      }
      return;
    }

    
    const timer = setTimeout(() => {
      if (!expandedMapRef.current || expandedMapInitializedRef.current) return;

      expandedMapInstanceRef.current = L.map(expandedMapRef.current, {
        center: [center.lat, center.lng],
        zoom: 10,
        zoomControl: true,
        attributionControl: false,
      });

      L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        maxZoom: 20,
      }).addTo(expandedMapInstanceRef.current);

      
      sensorsWithGPS.forEach(sensor => {
        const marker = L.marker([sensor.latitude!, sensor.longitude!], {
          icon: createMarkerIcon(getMarkerColor(sensor.value), sensor.value)
        }).addTo(expandedMapInstanceRef.current!);

        marker.bindPopup(`
          <div style="text-align: center; min-width: 120px;">
            <strong style="font-size: 14px;">${sensor.location || sensor.id}</strong><br/>
            <span style="color: ${getMarkerColor(sensor.value)}; font-weight: 600; font-size: 16px;">
              ${sensor.value.toFixed(1)} PPM
            </span><br/>
            <span style="font-size: 11px; color: #666;">
              ${sensor.isOnline ? '🟢 Online' : '🔴 Offline'}
            </span>
          </div>
        `);

        expandedMarkersRef.current.push(marker);
      });

      
      if (sensorsWithGPS.length > 1) {
        const bounds = L.latLngBounds(sensorsWithGPS.map(s => [s.latitude!, s.longitude!]));
        expandedMapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 10 });
      } else if (sensorsWithGPS.length === 1) {
        expandedMapInstanceRef.current.setView([sensorsWithGPS[0].latitude!, sensorsWithGPS[0].longitude!], 10);
      }

      expandedMapInitializedRef.current = true;
    }, 200);

    return () => clearTimeout(timer);
  }, [isExpanded]); 

  if (sensorsWithGPS.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: cardBg,
          borderRadius: '16px',
          overflow: 'hidden',
          border: `1px solid ${borderColor}`,
          backdropFilter: 'blur(10px)',
          boxShadow: isDark ? 'none' : '0 4px 15px rgba(0, 0, 0, 0.05)',
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '16px',
          borderBottom: `1px solid ${borderColor}`,
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: iconBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <MapPin size={16} color="#3B82F6" />
          </div>
          <div>
            <h3 style={{ color: textColor, fontSize: '14px', fontWeight: 600, margin: 0 }}>
              แผนที่ Sensor
            </h3>
            <p style={{ color: textSecondary, fontSize: '11px', margin: 0 }}>0 ตำแหน่ง</p>
          </div>
        </div>
        <div style={{ 
          minHeight: '200px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <MapPin size={40} color={textSecondary} style={{ marginBottom: '16px', opacity: 0.4 }} />
          <p style={{ color: textColor, fontSize: '15px', fontWeight: 500, margin: '0 0 8px', textAlign: 'center' }}>
            ยังไม่มี Sensor ที่มีพิกัด GPS
          </p>
          <p style={{ color: textSecondary, fontSize: '13px', margin: 0, opacity: 0.7, textAlign: 'center' }}>
            ไปที่หน้าตั้งค่าเพื่อเพิ่มพิกัด GPS
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: cardBg,
          borderRadius: '16px',
          overflow: 'hidden',
          border: `1px solid ${borderColor}`,
          backdropFilter: 'blur(10px)',
          boxShadow: isDark ? 'none' : '0 4px 15px rgba(0, 0, 0, 0.05)',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          minHeight: '300px',
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px',
          borderBottom: `1px solid ${borderColor}`,
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: iconBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <MapPin size={16} color="#3B82F6" />
            </div>
            <div>
              <h3 style={{ color: textColor, fontSize: '14px', fontWeight: 600, margin: 0 }}>
                แผนที่ Sensor
              </h3>
              <p style={{ color: textSecondary, fontSize: '11px', margin: 0 }}>
                {sensorsWithGPS.length} ตำแหน่ง
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={openModal}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              borderRadius: '8px',
              border: `1px solid ${borderColor}`,
              background: buttonBg,
              color: textSecondary,
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            <Maximize2 size={14} />
            ขยาย
          </motion.button>
        </div>

        <div 
          ref={miniMapRef}
          onClick={openModal}
          style={{ flex: 1, minHeight: '200px', background: '#e5e5e5', cursor: 'pointer' }}
        />
      </motion.div>

      {}
      {createPortal(
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.8)',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
              }}
            >
              <div onClick={closeModal} style={{ position: 'absolute', inset: 0 }} />
              
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                style={{
                  width: '100%',
                  maxWidth: '900px',
                  height: '80vh',
                  background: isDark ? '#1E293B' : '#FFFFFF',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  borderBottom: `1px solid ${borderColor}`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: iconBg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <MapPin size={18} color="#3B82F6" />
                    </div>
                    <div>
                      <h3 style={{ color: textColor, fontSize: '16px', fontWeight: 600, margin: 0 }}>
                        แผนที่ Sensor
                      </h3>
                      <p style={{ color: textSecondary, fontSize: '12px', margin: 0 }}>
                        {sensorsWithGPS.length} ตำแหน่ง
                      </p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={closeModal}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      border: 'none',
                      background: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                      color: textSecondary,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <X size={20} />
                  </motion.button>
                </div>

                <div ref={expandedMapRef} style={{ height: 'calc(100% - 70px)', background: '#1a1a2e' }} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};
