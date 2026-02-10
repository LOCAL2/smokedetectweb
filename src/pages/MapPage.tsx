import { useEffect, useRef, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, ArrowLeft } from 'lucide-react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useSensorDataContext } from '../context/SensorDataContext';
import { useSettingsContext } from '../context/SettingsContext';
import { useTheme } from '../context/ThemeContext';

export const MapPage = () => {
  const navigate = useNavigate();
  const { sensors } = useSensorDataContext();
  const { settings } = useSettingsContext();
  const { isDark } = useTheme();
  const [mapLoaded, setMapLoaded] = useState(false);

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

    try {
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
    } catch (error) {
      console.error('Error initializing map:', error);
    }

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
          const inner = el.querySelector('div') as HTMLElement;
          if (inner) {
            inner.style.background = color;
            inner.textContent = sensor.value.toFixed(0);
          }
          
          const popup = existingMarker.getPopup();
          if (popup) {
            popup.setHTML(`
              <div style="text-align: center; min-width: 160px; padding: 12px;">
                <strong style="font-size: 16px; display: block; margin-bottom: 8px; color: #0F172A;">${sensor.location || sensor.id}</strong>
                <div style="
                  font-size: 28px;
                  font-weight: 700;
                  color: ${color};
                  margin: 12px 0;
                ">${sensor.value.toFixed(1)} <span style="font-size: 16px;">PPM</span></div>
                <div style="
                  font-size: 13px;
                  color: #64748B;
                  margin-top: 8px;
                  padding-top: 8px;
                  border-top: 1px solid #E2E8F0;
                ">
                  ${sensor.isOnline ? '🟢 ออนไลน์' : '🔴 ออฟไลน์'}
                </div>
              </div>
            `);
          }
        } else {
          // Create custom marker element
          const el = document.createElement('div');
          el.className = 'custom-marker';
          el.innerHTML = `
            <div style="
              width: 48px;
              height: 48px;
              border-radius: 50%;
              background: ${color};
              border: 3px solid white;
              box-shadow: 0 2px 8px rgba(0,0,0,0.25);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 13px;
              font-weight: 700;
              cursor: pointer;
              transition: transform 0.2s;
            ">${sensor.value.toFixed(0)}</div>
          `;

          // Add hover effect
          el.addEventListener('mouseenter', () => {
            const inner = el.querySelector('div') as HTMLElement;
            if (inner) inner.style.transform = 'scale(1.1)';
          });
          el.addEventListener('mouseleave', () => {
            const inner = el.querySelector('div') as HTMLElement;
            if (inner) inner.style.transform = 'scale(1)';
          });

          const popup = new maplibregl.Popup({ 
            offset: 25,
            closeButton: false,
            closeOnClick: true,
            closeOnMove: false,
            maxWidth: '300px'
          }).setHTML(`
            <div style="text-align: center; min-width: 160px; padding: 12px;">
              <strong style="font-size: 16px; display: block; margin-bottom: 8px; color: #0F172A;">${sensor.location || sensor.id}</strong>
              <div style="
                font-size: 28px;
                font-weight: 700;
                color: ${color};
                margin: 12px 0;
              ">${sensor.value.toFixed(1)} <span style="font-size: 16px;">PPM</span></div>
              <div style="
                font-size: 13px;
                color: #64748B;
                margin-top: 8px;
                padding-top: 8px;
                border-top: 1px solid #E2E8F0;
              ">
                ${sensor.isOnline ? '🟢 ออนไลน์' : '🔴 ออฟไลน์'}
              </div>
            </div>
          `);

          const marker = new maplibregl.Marker({ 
            element: el,
            anchor: 'center'
          })
            .setLngLat([lng, lat])
            .setPopup(popup)
            .addTo(mapRef.current!);

          // Close other popups when this one opens
          marker.getElement().addEventListener('click', () => {
            markersRef.current.forEach((m, id) => {
              if (id !== sensor.id) {
                const p = m.getPopup();
                if (p && p.isOpen()) {
                  p.remove();
                }
              }
            });
          });

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
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                borderRadius: '12px',
                border: `1px solid ${borderColor}`,
                background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                color: textSecondary,
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              <ArrowLeft size={18} />
              กลับหน้าหลัก
            </motion.button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <MapPin size={20} color="#FFF" />
              </div>
              <div>
                <h1 style={{ color: textColor, fontSize: '20px', fontWeight: 700, margin: 0 }}>
                  แผนที่ Sensor
                </h1>
                <p style={{ color: textSecondary, fontSize: '13px', margin: 0 }}>
                  {sensorsWithGPS.length} ตำแหน่ง • อัพเดทแบบ Real-time
                </p>
              </div>
            </div>
          </div>

          <div style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
          }}>
            <div style={{
              display: 'flex',
              gap: '8px',
              padding: '8px 12px',
              borderRadius: '10px',
              background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10B981' }} />
                <span style={{ color: textSecondary, fontSize: '12px' }}>ปกติ</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#F59E0B' }} />
                <span style={{ color: textSecondary, fontSize: '12px' }}>เตือน</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#EF4444' }} />
                <span style={{ color: textSecondary, fontSize: '12px' }}>อันตราย</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div style={{ paddingTop: '80px', height: '100vh', width: '100%', position: 'relative' }}>
        {sensorsWithGPS.length === 0 ? (
          <div style={{
            height: 'calc(100vh - 80px)',
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
          <div 
            ref={mapContainerRef} 
            style={{ 
              height: 'calc(100vh - 80px)', 
              width: '100%',
              position: 'relative',
              touchAction: 'none'
            }} 
          />
        )}
      </div>
    </div>
  );
};
