import { useEffect, useRef, useMemo } from 'react';
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

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<Map<string, maplibregl.Marker>>(new Map());
  const initialBoundsSetRef = useRef(false);

  const sensorsWithGPS = useMemo(() =>
    sensors.filter(s => (s.latitude && s.longitude) || (s.lat && s.lng)),
    [sensors]
  );

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
    if (!mapContainerRef.current || mapRef.current) return;

    mapRef.current = new maplibregl.Map({
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
      zoom: 10,
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

    mapRef.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || sensorsWithGPS.length === 0) return;

    markersRef.current.forEach(marker => marker.remove());
    markersRef.current.clear();

    sensorsWithGPS.forEach(sensor => {
      const lat = sensor.latitude || sensor.lat;
      const lng = sensor.longitude || sensor.lng;
      if (!lat || !lng) return;

      const color = getMarkerColor(sensor.value);

      const el = document.createElement('div');
      el.style.width = '40px';
      el.style.height = '40px';
      el.style.borderRadius = '50%';
      el.style.background = color;
      el.style.border = '4px solid white';
      el.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.style.color = 'white';
      el.style.fontSize = '12px';
      el.style.fontWeight = 'bold';
      el.style.cursor = 'pointer';
      el.textContent = sensor.value.toFixed(0);

      const popup = new maplibregl.Popup({ offset: 25 }).setHTML(`
        <div style="text-align: center; min-width: 140px; padding: 8px;">
          <strong style="font-size: 16px; display: block; margin-bottom: 8px;">${sensor.location || sensor.id}</strong>
          <div style="
            font-size: 24px;
            font-weight: 700;
            color: ${color};
            margin: 8px 0;
          ">${sensor.value.toFixed(1)} PPM</div>
          <div style="
            font-size: 12px;
            color: #666;
            margin-top: 8px;
            padding-top: 8px;
            border-top: 1px solid #eee;
          ">
            ${sensor.isOnline ? '🟢 Online' : '🔴 Offline'}
          </div>
        </div>
      `);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(mapRef.current!);

      markersRef.current.set(sensor.id, marker);
    });

    if (!initialBoundsSetRef.current && sensorsWithGPS.length > 0) {
      const bounds = new maplibregl.LngLatBounds();
      sensorsWithGPS.forEach(s => {
        const lat = s.latitude || s.lat;
        const lng = s.longitude || s.lng;
        if (lat && lng) bounds.extend([lng, lat]);
      });
      
      mapRef.current.fitBounds(bounds, {
        padding: 80,
        maxZoom: 16
      });
      
      initialBoundsSetRef.current = true;
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
